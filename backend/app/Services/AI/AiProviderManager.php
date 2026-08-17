<?php

namespace App\Services\AI;

use App\Services\AI\Contracts\AiProvider;
use Illuminate\Support\Manager;

class AiProviderManager extends Manager
{
    public function getDefaultDriver(): string
    {
        return (string) config('ai.default_provider', 'openai');
    }

    public function createOpenaiDriver(): AiProvider
    {
        return new OpenAiProvider();
    }
}
