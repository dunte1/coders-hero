<?php

namespace App\Services\AI;

use App\Services\AI\Contracts\AiProvider;
use App\Services\AI\Dto\AiProviderResponse;
use Illuminate\Support\Facades\Http;

class OpenAiProvider implements AiProvider
{
    public function chat(array $messages, array $options = []): AiProviderResponse
    {
        $start = hrtime(true);

        $response = Http::withToken($this->apiKey())
            ->timeout(config('ai.timeout', 45))
            ->post($this->baseUrl() . '/chat/completions', [
                'model' => $options['model'] ?? config('ai.default_model'),
                'messages' => $messages,
                'max_tokens' => $options['max_tokens'] ?? config('ai.max_tokens', 800),
                'temperature' => $options['temperature'] ?? config('ai.temperature', 0.7),
            ]);

        $latencyMs = (int) round((hrtime(true) - $start) / 1e6);

        if ($response->failed()) {
            throw new \RuntimeException('AI provider error: ' . $response->body());
        }

        $json = $response->json();
        $content = data_get($json, 'choices.0.message.content');
        if (! $content) {
            throw new \RuntimeException('AI provider returned no content.');
        }

        $model = data_get($json, 'model') ?? ($options['model'] ?? config('ai.default_model'));
        $usage = data_get($json, 'usage', []);
        $promptTokens = (int) ($usage['prompt_tokens'] ?? 0);
        $completionTokens = (int) ($usage['completion_tokens'] ?? 0);

        return new AiProviderResponse(
            content: (string) $content,
            model: $model,
            promptTokens: $promptTokens,
            completionTokens: $completionTokens,
            totalTokens: $promptTokens + $completionTokens,
            cost: $this->estimateCost($model, $promptTokens, $completionTokens),
            latencyMs: $latencyMs,
            raw: $json,
        );
    }

    public function name(): string
    {
        return 'openai';
    }

    public function isConfigured(): bool
    {
        return (bool) $this->apiKey() && (bool) config('ai.providers.openai.enabled', true);
    }

    private function apiKey(): ?string
    {
        return config('ai.providers.openai.api_key') ?: config('services.openai.api_key');
    }

    private function baseUrl(): string
    {
        return rtrim((string) (config('ai.providers.openai.base_url') ?: 'https://api.openai.com/v1'), '/');
    }

    /**
     * Estimate USD cost using the per-model pricing table (per 1M tokens).
     */
    private function estimateCost(string $model, int $promptTokens, int $completionTokens): float
    {
        $pricing = config('ai.models.' . $model, config('ai.models.' . config('ai.default_model'), ['prompt' => 0, 'completion' => 0]));

        return (($promptTokens / 1_000_000) * (float) $pricing['prompt'])
            + (($completionTokens / 1_000_000) * (float) $pricing['completion']);
    }
}
