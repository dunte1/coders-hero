<?php

namespace App\Services\Lms;

use App\Models\AiTutorConversation;
use App\Models\AiTutorMessage;
use Illuminate\Support\Facades\Http;

class AiTutorService
{
    public function conversations(string $userId, int $perPage = 20)
    {
        return AiTutorConversation::query()
            ->forUser($userId)
            ->with(['course:id,title', 'lesson:id,title'])
            ->withCount('messages')
            ->orderByDesc('updated_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getConversation(int $id, string $userId): ?AiTutorConversation
    {
        return AiTutorConversation::query()
            ->forUser($userId)
            ->with(['course:id,title,description', 'lesson:id,title,content', 'messages'])
            ->find($id);
    }

    public function createConversation(string $userId, array $data): AiTutorConversation
    {
        return AiTutorConversation::create([
            'user_id' => $userId,
            'course_id' => $data['course_id'] ?? null,
            'lesson_id' => $data['lesson_id'] ?? null,
            'title' => $data['title'] ?? 'New conversation',
        ]);
    }

    public function renameConversation(int $id, string $userId, string $title): AiTutorConversation
    {
        $conversation = $this->findForUser($id, $userId);
        $conversation->update(['title' => $title]);

        return $conversation->fresh();
    }

    public function deleteConversation(int $id, string $userId): bool
    {
        return (bool) $this->findForUser($id, $userId)->delete();
    }

    public function sendMessage(int $id, string $userId, string $content): array
    {
        $conversation = $this->findForUser($id, $userId);

        $userMessage = AiTutorMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => $content,
        ]);

        $history = $conversation->messages()
            ->latest()
            ->limit(10)
            ->get()
            ->reverse()
            ->map(fn ($m) => ['role' => $m->role, 'content' => $m->content])
            ->values();

        $reply = $this->generateReply($conversation, $content, $history);

        $assistantMessage = AiTutorMessage::create([
            'conversation_id' => $conversation->id,
            'role' => 'assistant',
            'content' => $reply['content'],
            'meta' => $reply['meta'] ?? [],
        ]);

        if ($conversation->title === 'New conversation' && mb_strlen($content) > 0) {
            $conversation->update([
                'title' => mb_strimwidth($content, 0, 60, '...'),
            ]);
        }

        $conversation->touch();

        return [
            'user_message' => $userMessage,
            'assistant_message' => $assistantMessage,
            'title' => $conversation->fresh()->title,
        ];
    }

    protected function findForUser(int $id, string $userId): AiTutorConversation
    {
        $conversation = AiTutorConversation::forUser($userId)->find($id);

        if (!$conversation) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Conversation not found.');
        }

        return $conversation;
    }

    protected function generateReply(AiTutorConversation $conversation, string $message, $history): array
    {
        $openaiKey = config('services.openai.api_key');
        $enabled = (bool) config('services.openai.enabled', true);

        if ($enabled && $openaiKey) {
            try {
                return $this->callOpenAi($conversation, $message, $history);
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('AI Tutor OpenAI call failed, using fallback.', [
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $this->fallbackReply($conversation, $message);
    }

    protected function callOpenAi(AiTutorConversation $conversation, string $message, $history): array
    {
        $systemPrompt = 'You are an encouraging, concise programming tutor embedded in the Coder\'s Hero LMS. '
            . 'Help students understand concepts by guiding them to answers rather than doing the work for them. '
            . 'Use short responses with Markdown formatting.';

        if ($conversation->course) {
            $systemPrompt .= ' The student is taking the course: ' . $conversation->course->title . '.';
        }

        if ($conversation->lesson) {
            $systemPrompt .= ' They are currently on the lesson: ' . $conversation->lesson->title . '.';
        }

        $response = Http::withToken(config('services.openai.api_key'))
            ->timeout(45)
            ->post(rtrim(config('services.openai.base_url'), '/') . '/chat/completions', [
                'model' => config('services.openai.model', 'gpt-4o-mini'),
                'messages' => array_merge(
                    [['role' => 'system', 'content' => $systemPrompt]],
                    $history->toArray()
                ),
                'max_tokens' => 600,
                'temperature' => 0.7,
            ]);

        if ($response->failed()) {
            throw new \RuntimeException('OpenAI API error: ' . $response->body());
        }

        $content = data_get($response->json(), 'choices.0.message.content');

        if (!$content) {
            throw new \RuntimeException('OpenAI returned no content.');
        }

        return [
            'content' => $content,
            'meta' => ['model' => config('services.openai.model')],
        ];
    }

    protected function fallbackReply(AiTutorConversation $conversation, string $message): array
    {
        $subject = $conversation->lesson?->title ?? $conversation->course?->title ?? 'programming';

        $lower = mb_strtolower($message);

        if (str_contains($lower, 'hello') || str_contains($lower, 'hi') || $lower === 'hey') {
            $reply = "Hello! I'm your AI tutor for **{$subject}**. Ask me anything about the lesson, "
                . 'practice problems, or debugging your code.';
        } elseif (str_contains($lower, 'debug') || str_contains($lower, 'error')) {
            $reply = "Let's debug together. Could you paste the code snippet and the exact error message? "
                . "While we do that, remember: **read the error line by line** → **check the stack trace** → "
                . '**simplify the failing case** → **test with minimal input**.';
        } elseif (str_contains($lower, 'explain') || str_contains($lower, 'what is') || str_contains($lower, 'how')) {
            $reply = "Great question about **{$subject}**! I'd break it down as: \n\n"
                . "1. **The core idea** – what problem it solves.\n"
                . "2. **How it works** – the mechanics step by step.\n"
                . "3. **A concrete example** – trace through a small case.\n\n"
                . "Want me to walk through any of these, or would you prefer a practice problem?";
        } elseif (str_contains($lower, 'practice') || str_contains($lower, 'exercise') || str_contains($lower, 'quiz')) {
            $reply = "Here's a practice problem for **{$subject}**:\n\n"
                . "> Write a small function that takes a list of numbers and returns the sum of all even numbers.\n\n"
                . 'Try it yourself first, then share your solution and I\'ll review it with you.';
        } else {
            $reply = "I can help you with **{$subject}** — concepts, examples, practice problems, or debugging. "
                . 'Try asking me to *explain* a concept, give you a *practice* problem, or help you *debug* some code.';
        }

        return [
            'content' => $reply,
            'meta' => ['fallback' => true],
        ];
    }
}
