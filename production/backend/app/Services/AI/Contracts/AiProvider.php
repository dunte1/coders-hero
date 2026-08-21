<?php

namespace App\Services\AI\Contracts;

use App\Services\AI\Dto\AiProviderResponse;

interface AiProvider
{
    /**
     * Send a chat completion request.
     *
     * @param  array<int, array{role: string, content: string}>  $messages
     * @param  array<string, mixed>  $options  model, max_tokens, temperature, etc.
     */
    public function chat(array $messages, array $options = []): AiProviderResponse;

    /** Human-readable provider name, e.g. "openai". */
    public function name(): string;

    /** Whether this provider is configured (has credentials). */
    public function isConfigured(): bool;
}
