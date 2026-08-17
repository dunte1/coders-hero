<?php

namespace App\Services\Website;

use App\Models\Faq;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class ChatService
{
    private const MAX_HISTORY_MESSAGES = 8;

    private const STOP_WORDS = [
        'the', 'and', 'for', 'you', 'your', 'are', 'how', 'what', 'who', 'why', 'when',
        'where', 'do', 'does', 'did', 'with', 'this', 'that', 'our', 'get', 'from', 'can',
        'not', 'was', 'were', 'will', 'have', 'has', 'its', 'would', 'could', 'should',
        'about', 'which', 'their', 'them', 'they', 'there', 'here', 'all', 'one', 'two',
        'but', 'than', 'into', 'then', 'more', 'also', 'some', 'any', 'each', 'such',
    ];

    public function chat(string $message, array $history = []): array
    {
        $message = trim($message);

        if ($message === '') {
            return $this->fallback('Please type a question so I can help you. 😊');
        }

        if ($this->llmAvailable()) {
            try {
                $reply = $this->askLlm($message, $history);
                if ($reply !== null && trim($reply) !== '') {
                    return ['reply' => trim($reply), 'source' => 'llm'];
                }
            } catch (\Throwable $e) {
                logger()->warning('AI chat LLM call failed, falling back to FAQ.', [
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $this->answerFromFaq($message);
    }

    public function llmAvailable(): bool
    {
        return (bool) config('services.openai.api_key')
            && filter_var(config('services.openai.enabled', true), FILTER_VALIDATE_BOOL);
    }

    private function askLlm(string $message, array $history): ?string
    {
        $messages = [
            ['role' => 'system', 'content' => $this->systemPrompt()],
        ];

        foreach (array_slice($history, -self::MAX_HISTORY_MESSAGES) as $entry) {
            $role = ($entry['role'] ?? 'user') === 'assistant' ? 'assistant' : 'user';
            $content = (string) ($entry['content'] ?? '');
            if (trim($content) !== '') {
                $messages[] = ['role' => $role, 'content' => $content];
            }
        }

        $messages[] = ['role' => 'user', 'content' => $message];

        $response = Http::withToken(config('services.openai.api_key'))
            ->acceptJson()
            ->timeout(25)
            ->post(rtrim(config('services.openai.base_url'), '/') . '/chat/completions', [
                'model' => config('services.openai.model', 'gpt-4o-mini'),
                'messages' => $messages,
                'temperature' => 0.7,
                'max_tokens' => 500,
            ]);

        if (!$response->successful()) {
            return null;
        }

        return $response->json('choices.0.message.content');
    }

    private function systemPrompt(): string
    {
        $siteName = app(WebsiteService::class)->siteName();
        $faqs = Faq::query()->active()->ordered()->limit(10)->get()
            ->map(fn (Faq $faq) => 'Q: ' . $faq->question . "\nA: " . Str::limit($faq->answer, 220))
            ->implode("\n\n");

        return <<<PROMPT
You are the friendly AI assistant for {$siteName}, a learning centre that teaches children coding,
robotics and STEM skills. Answer visitors' questions about programs, robotics, coding classes,
pricing, schedules, gallery photos and contacting the centre.

Be warm, concise and helpful. When relevant, use the knowledge base below to answer; otherwise
answer from general knowledge about {$siteName}. Keep answers to a short paragraph unless a list
is genuinely helpful. Do not invent phone numbers, emails or addresses.

Knowledge base:
{$faqs}
PROMPT;
    }

    private function answerFromFaq(string $message): array
    {
        $faqs = Faq::query()->active()->get();
        $tokens = $this->tokens($message);

        $best = null;
        $bestScore = 0;

        foreach ($faqs as $faq) {
            $questionTokens = $this->tokens($faq->question);
            if ($questionTokens === []) {
                continue;
            }
            $score = count(array_intersect($tokens, $questionTokens));
            if ($score > $bestScore) {
                $bestScore = $score;
                $best = $faq;
            }
        }

        if ($best !== null && $bestScore >= 1) {
            return [
                'reply' => $best->answer,
                'source' => 'faq',
                'matched_question' => $best->question,
            ];
        }

        return $this->fallback();
    }

    private function fallback(string $reply = null): array
    {
        $reply ??= "I'm sorry, I couldn't find an answer to that just yet. "
            . "Please try asking about our coding or robotics programs, pricing, or age groups, "
            . "or use the contact form and we'll get back to you soon.";

        return ['reply' => $reply, 'source' => 'fallback'];
    }

    private function tokens(string $text): array
    {
        $words = preg_split('/[^\p{L}\p{N}]+/u', Str::lower($text)) ?: [];

        return array_values(array_unique(array_filter(
            $words,
            fn ($word) => mb_strlen($word) > 2 && !in_array($word, self::STOP_WORDS, true)
        )));
    }
}
