<?php

namespace App\Services\AI\Dto;

class AiProviderResponse
{
    public function __construct(
        public readonly string $content,
        public readonly ?string $model = null,
        public readonly int $promptTokens = 0,
        public readonly int $completionTokens = 0,
        public readonly int $totalTokens = 0,
        public readonly float $cost = 0.0,
        public readonly ?int $latencyMs = null,
        public readonly array $raw = [],
    ) {}
}
