<?php

namespace App\Services\AI;

use App\Models\AiAssistant;
use App\Models\AiConversation;
use App\Models\AiMessage;
use App\Models\AiPromptTemplate;
use App\Models\AiUsageLog;
use App\Services\AI\Contracts\AiProvider;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class AiPlatformService
{
    public function __construct(
        private AiProviderManager $providerManager
    ) {}

    private function provider(): AiProvider
    {
        return $this->providerManager->driver();
    }

    // ---- Assistants ----

    public function assistants(): \Illuminate\Database\Eloquent\Collection
    {
        return AiAssistant::active()->orderBy('name')->get();
    }

    public function assistant(string $slug): AiAssistant
    {
        return AiAssistant::active()->where('slug', $slug)->firstOrFail();
    }

    // ---- Conversations ----

    public function conversations(string $userId, ?int $assistantId = null, int $perPage = 20): LengthAwarePaginator
    {
        return AiConversation::query()
            ->forUser($userId)
            ->when($assistantId, fn (Builder $q) => $q->forAssistant($assistantId))
            ->with(['assistant:id,name,slug,icon'])
            ->withCount('messages')
            ->orderByDesc('updated_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getConversation(int $id, string $userId): AiConversation
    {
        return AiConversation::forUser($userId)
            ->with(['assistant', 'messages' => fn ($q) => $q->orderBy('created_at')])
            ->findOrFail($id);
    }

    public function createConversation(string $userId, string $assistantSlug, array $data): AiConversation
    {
        $assistant = $this->assistant($assistantSlug);

        return AiConversation::create([
            'user_id' => $userId,
            'assistant_id' => $assistant->id,
            'title' => $data['title'] ?? 'New conversation',
            'context' => $data['context'] ?? null,
        ]);
    }

    public function renameConversation(int $id, string $userId, string $title): AiConversation
    {
        $conversation = $this->getConversation($id, $userId);
        $conversation->update(['title' => mb_strimwidth($title, 0, 120, '...')]);

        return $conversation->fresh();
    }

    public function deleteConversation(int $id, string $userId): bool
    {
        return (bool) $this->getConversation($id, $userId)->delete();
    }

    // ---- Chat ----

    public function sendMessage(int $conversationId, string $userId, string $content): array
    {
        $content = trim($content);
        $this->assertMessageWithinLimits($userId, $content);

        $conversation = $this->getConversation($conversationId, $userId);
        $assistant = $conversation->assistant;

        $userMessage = AiMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => $content,
        ]);

        // Safety check after persisting the user message.
        $blocked = $this->isBlocked($content);
        if ($blocked) {
            $refusal = "I'm sorry, but I can't help with that request. Let's keep the conversation focused on learning and productivity.";
            $assistantMessage = $this->persistAssistantMessage($conversation, $refusal, 0, 0, 0, 0.0, $assistant->model, null, ['blocked' => true]);
            $this->logUsage($userId, $assistant->id, $conversation->id, $assistant->model, 0, 0, 0, 0.0, null, true);

            return $this->chatResult($userMessage, $assistantMessage, $conversation);
        }

        $systemPrompt = $this->buildSystemPrompt($assistant, $conversation);
        $history = $conversation->messages()
            ->where('role', '!=', 'system')
            ->latest()
            ->limit(config('ai.history_limit', 12))
            ->get()
            ->reverse()
            ->map(fn ($m) => ['role' => $m->role, 'content' => $m->content])
            ->values();

        $reply = $this->generate($assistant, $systemPrompt, $history->toArray());

        $assistantMessage = $this->persistAssistantMessage(
            $conversation,
            $reply->content,
            $reply->promptTokens,
            $reply->completionTokens,
            $reply->totalTokens,
            $reply->cost,
            $reply->model ?? $assistant->model,
            $reply->latencyMs,
            ['provider' => $this->provider()->name()]
        );

        $this->logUsage(
            $userId,
            $assistant->id,
            $conversation->id,
            $reply->model ?? $assistant->model,
            $reply->promptTokens,
            $reply->completionTokens,
            $reply->totalTokens,
            $reply->cost,
            $reply->latencyMs,
            false
        );

        if ($conversation->title === 'New conversation' && mb_strlen($content) > 0) {
            $conversation->update(['title' => mb_strimwidth($content, 0, 60, '...')]);
        }

        $conversation->touch();

        return $this->chatResult($userMessage, $assistantMessage, $conversation);
    }

    // ---- Prompt templates ----

    public function promptTemplates(?string $category = null): \Illuminate\Database\Eloquent\Collection
    {
        return AiPromptTemplate::active()
            ->when($category, fn (Builder $q) => $q->where('category', $category))
            ->orderBy('name')
            ->get();
    }

    public function renderPrompt(string $slug, array $variables = []): string
    {
        $template = AiPromptTemplate::active()->where('slug', $slug)->firstOrFail();

        return $this->renderTemplate($template, $variables);
    }

    public function renderTemplate(AiPromptTemplate $template, array $variables): string
    {
        $body = $template->template;
        foreach ($variables as $key => $value) {
            $body = str_replace('{{ ' . $key . ' }}', (string) $value, $body);
        }

        return $body;
    }

    /** One-shot generation from a prompt template (used by capability actions). */
    public function generateWithTemplate(string $slug, array $variables, ?AiAssistant $assistant = null): array
    {
        $template = AiPromptTemplate::active()->where('slug', $slug)->firstOrFail();
        $prompt = $this->renderTemplate($template, $variables);
        $assistant ??= AiAssistant::where('slug', $template->category . '-assistant')
            ->orWhere('slug', $template->category)
            ->first()
            ?? AiAssistant::active()->first();

        $reply = $this->generate(
            $assistant,
            $this->buildSystemPrompt($assistant, null),
            [['role' => 'user', 'content' => $prompt]]
        );

        $this->logUsage(
            auth()->id(),
            $assistant->id,
            null,
            $reply->model ?? $assistant->model,
            $reply->promptTokens,
            $reply->completionTokens,
            $reply->totalTokens,
            $reply->cost,
            $reply->latencyMs,
            false
        );

        return [
            'content' => $reply->content,
            'model' => $reply->model ?? $assistant->model,
            'assistant' => $assistant->slug,
            'cost' => $reply->cost,
            'total_tokens' => $reply->totalTokens,
        ];
    }

    // ---- Usage ----

    public function myUsage(string $userId, int $days = 30): array
    {
        $since = now()->subDays($days)->startOfDay();

        $logs = AiUsageLog::where('user_id', $userId)->where('created_at', '>=', $since);

        return [
            'total_calls' => (clone $logs)->count(),
            'blocked' => (clone $logs)->where('blocked', true)->count(),
            'total_tokens' => (int) (clone $logs)->sum('total_tokens'),
            'total_cost' => round((float) (clone $logs)->sum('cost'), 6),
            'by_assistant' => (clone $logs)
                ->selectRaw('assistant_id, COUNT(*) as calls, SUM(total_tokens) as tokens, SUM(cost) as cost')
                ->groupBy('assistant_id')
                ->with('assistant:id,name,slug,icon')
                ->get(),
        ];
    }

    public function adminUsage(array $filters = [], int $perPage = 20): array
    {
        $logs = AiUsageLog::query()
            ->with(['user:id,name', 'assistant:id,name,slug'])
            ->when(($filters['assistant_id'] ?? null), fn (Builder $q, $id) => $q->where('assistant_id', $id))
            ->when(($filters['from'] ?? null), fn (Builder $q, $d) => $q->whereDate('created_at', '>=', $d))
            ->when(($filters['to'] ?? null), fn (Builder $q, $d) => $q->whereDate('created_at', '<=', $d))
            ->orderByDesc('created_at');

        $paginated = (clone $logs)->paginate($perPage)->withQueryString();

        $summary = [
            'total_calls' => (clone $logs)->count(),
            'blocked' => (clone $logs)->where('blocked', true)->count(),
            'total_tokens' => (int) (clone $logs)->sum('total_tokens'),
            'total_cost' => round((float) (clone $logs)->sum('cost'), 6),
            'by_assistant' => (clone $logs)
                ->selectRaw('assistant_id, COUNT(*) as calls, SUM(total_tokens) as tokens, SUM(cost) as cost')
                ->groupBy('assistant_id')
                ->with('assistant:id,name,slug')
                ->get(),
        ];

        return [
            'summary' => $summary,
            'logs' => $paginated,
        ];
    }

    // ---- Internal ----

    protected function generate(AiAssistant $assistant, string $systemPrompt, array $history): \App\Services\AI\Dto\AiProviderResponse
    {
        $provider = $this->provider();

        if (! $provider->isConfigured()) {
            throw new \RuntimeException('AI provider is not configured. Add an API key to enable AI responses.');
        }

        $messages = array_merge(
            [['role' => 'system', 'content' => $systemPrompt]],
            $history
        );

        try {
            return $provider->chat($messages, [
                'model' => $assistant->model ?: config('ai.default_model'),
                'max_tokens' => $assistant->max_tokens ?: config('ai.max_tokens', 800),
                'temperature' => $assistant->temperature !== null ? (float) $assistant->temperature : config('ai.temperature', 0.7),
            ]);
        } catch (\Throwable $e) {
            Log::warning('AI platform generation failed.', ['error' => $e->getMessage()]);
            throw new \RuntimeException('The AI service is temporarily unavailable. Please try again shortly.');
        }
    }

    protected function buildSystemPrompt(AiAssistant $assistant, ?AiConversation $conversation): string
    {
        $prompt = $assistant->system_prompt ?: "You are {$assistant->name}, an AI assistant in the Coder's Hero platform. Be helpful, clear and concise.";

        $context = $conversation?->context;
        if (! empty($context['course'])) {
            $prompt .= "\n\nContext — the user is working with the course: {$context['course']}.";
        }
        if (! empty($context['student'])) {
            $prompt .= "\n\nContext — the user is asking about the student: {$context['student']}.";
        }

        return $prompt;
    }

    protected function persistAssistantMessage(
        AiConversation $conversation,
        string $content,
        int $promptTokens,
        int $completionTokens,
        int $totalTokens,
        float $cost,
        ?string $model,
        ?int $latencyMs,
        array $meta
    ): AiMessage {
        return AiMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'assistant',
            'content' => $content,
            'prompt_tokens' => $promptTokens,
            'completion_tokens' => $completionTokens,
            'total_tokens' => $totalTokens,
            'cost' => $cost,
            'model' => $model,
            'latency_ms' => $latencyMs,
            'meta' => $meta,
        ]);
    }

    protected function logUsage(
        string $userId,
        int $assistantId,
        ?int $conversationId,
        ?string $model,
        int $promptTokens,
        int $completionTokens,
        int $totalTokens,
        float $cost,
        ?int $latencyMs,
        bool $blocked
    ): void {
        AiUsageLog::create([
            'user_id' => $userId,
            'assistant_id' => $assistantId,
            'conversation_id' => $conversationId,
            'model' => $model,
            'endpoint' => 'chat',
            'prompt_tokens' => $promptTokens,
            'completion_tokens' => $completionTokens,
            'total_tokens' => $totalTokens,
            'cost' => $cost,
            'latency_ms' => $latencyMs,
            'blocked' => $blocked,
        ]);
    }

    protected function chatResult(AiMessage $userMessage, AiMessage $assistantMessage, AiConversation $conversation): array
    {
        return [
            'user_message' => $userMessage,
            'assistant_message' => $assistantMessage,
            'title' => $conversation->fresh()->title,
        ];
    }

    protected function assertMessageWithinLimits(string $userId, string $content): void
    {
        $maxLength = (int) config('ai.safety.max_message_length', 4000);
        if (mb_strlen($content) > $maxLength) {
            throw new \InvalidArgumentException('Message is too long. Please keep it under ' . $maxLength . ' characters.');
        }

        $perMinute = (int) config('ai.rate_limits.messages_per_minute', 15);
        $window = (int) config('ai.rate_limits.window_minutes', 1);
        $minuteKey = 'ai:limit:' . $userId . ':minute';
        $minuteCount = (int) Cache::get($minuteKey, 0);

        if ($minuteCount >= $perMinute) {
            throw new \RuntimeException('You are sending messages too quickly. Please wait a moment before continuing.', 429);
        }

        $perDay = (int) config('ai.rate_limits.messages_per_day', 300);
        $dayKey = 'ai:limit:' . $userId . ':day';
        $dayCount = (int) Cache::get($dayKey, 0);

        if ($dayCount >= $perDay) {
            throw new \RuntimeException('You have reached your daily AI message limit.', 429);
        }

        Cache::put($minuteKey, $minuteCount + 1, now()->addMinutes($window));
        Cache::put($dayKey, $dayCount + 1, now()->addDay());
    }

    protected function isBlocked(string $content): bool
    {
        $lower = mb_strtolower($content);
        foreach (config('ai.safety.blocked_words', []) as $word) {
            if (str_contains($lower, $word)) {
                return true;
            }
        }

        return false;
    }
}
