<?php

namespace App\Services\Lms;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CodingAiService
{
    public function hint(string $userId, int $exerciseId, string $code, string $errorMessage): array
    {
        $openaiKey = config('services.openai.api_key');
        $enabled = (bool) config('services.openai.enabled', true);

        if ($enabled && $openaiKey) {
            try {
                return $this->callOpenAi($code, $errorMessage);
            } catch (\Throwable $e) {
                Log::warning('AI Tutor hint OpenAI call failed, using fallback.', [
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $this->fallbackHint($errorMessage);
    }

    public function debug(string $userId, int $exerciseId, string $code, string $errorOutput): array
    {
        $openaiKey = config('services.openai.api_key');
        $enabled = (bool) config('services.openai.enabled', true);

        if ($enabled && $openaiKey) {
            try {
                return $this->callOpenAiForDebug($code, $errorOutput);
            } catch (\Throwable $e) {
                Log::warning('AI Tutor debug OpenAI call failed, using fallback.', [
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $this->fallbackDebug($errorOutput);
    }

    protected function callOpenAi(string $code, string $errorMessage): array
    {
        $systemPrompt = 'You are an encouraging programming tutor. A student is stuck on a coding exercise. '
            . 'Given their code and an error message, provide a short hint that guides them to the fix '
            . 'without giving away the solution. Use Markdown formatting.';

        $userPrompt = "## Student's code\n\n" . $code . "\n\n"
            . "## Error message\n\n" . $errorMessage . "\n\n"
            . "Provide a concise hint (2-3 sentences max) that helps the student identify the issue and how to fix it.";

        $response = Http::withToken($openaiKey)
            ->timeout(45)
            ->post(rtrim(config('services.openai.base_url'), '/') . '/chat/completions', [
                'model' => config('services.openai.model', 'gpt-4o-mini'),
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userPrompt],
                ],
                'max_tokens' => 300,
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

    protected function callOpenAiForDebug(string $code, string $errorOutput): array
    {
        $systemPrompt = 'You are a programming debugger. A student encountered an error running their code. '
            . 'Given their code and the error output, provide a debugging guide that helps them understand '
            . 'the error and how to fix it. Be concise and educational. Use Markdown formatting.';

        $userPrompt = "## Student's code\n\n" . $code . "\n\n"
            . "## Error output\n\n" . $errorOutput . "\n\n"
            . "Provide a step-by-step debugging guide (3-5 steps max) that helps the student understand "
            . "the root cause and how to fix it.";

        $response = Http::withToken(config('services.openai.api_key'))
            ->timeout(45)
            ->post(rtrim(config('services.openai.base_url'), '/') . '/chat/completions', [
                'model' => config('services.openai.model', 'gpt-4o-mini'),
                'messages' => [
                    ['role' => 'system', 'content' => $systemPrompt],
                    ['role' => 'user', 'content' => $userPrompt],
                ],
                'max_tokens' => 500,
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

    protected function fallbackHint(string $errorMessage): array
    {
        $lower = mb_strtolower($errorMessage);

        if (str_contains($lower, 'syntax') || str_contains($lower, 'invalid syntax')) {
            $reply = 'There seems to be a syntax error in your code. Check for missing colons, indentation, or typos. '
                . 'Python is sensitive to whitespace — make sure your indentation is consistent.';
        } elseif (str_contains($lower, 'nameerror') || str_contains($lower, 'undefined')) {
            $reply = 'You are using a name that Python does not recognize. Make sure all variables are defined '
                . 'and that you have imported any required modules.';
        } elseif (str_contains($lower, 'index') || str_contains($lower, 'list index out')) {
            $reply = 'You are trying to access an index that does not exist. Check that your list or array '
                . 'has enough elements before accessing them.';
        } else {
            $reply = 'There is an error in your code. Review the error message carefully, check '
                . 'variable types and spelling, and ensure your logic matches the problem requirements.';
        }

        return [
            'content' => $reply,
            'meta' => ['fallback' => true],
        ];
    }

    protected function fallbackDebug(string $errorOutput): array
    {
        $lower = mb_strtolower($errorOutput);

        if (str_contains($lower, 'syntax') || str_contains($lower, 'invalid syntax')) {
            $reply = 'Syntax error detected. Check for missing punctuation, incorrect indentation, or '
                . 'typos. Python requires consistent indentation and colons after control flow statements.';
        } elseif (str_contains($lower, 'nameerror') || str_contains($lower, 'name ')) {
            $reply = 'Name error: you are using a variable or function that is not defined. '
                . 'Check that all variables are assigned before use and that you have imported required modules.';
        } elseif (str_contains($lower, 'typeerror')) {
            $reply = 'Type error: you are performing an operation on a data type that does not support it. '
                . 'For example, concatenating a string with a number, or operating on None.';
        } elseif (str_contains($lower, 'index') || str_contains($lower, 'list index out')) {
            $reply = 'Index error: you are trying to access an index that does not exist. '
                . 'Make sure your list or array has enough elements.';
        } else {
            $reply = 'There is an error in your code. Review the output above, check variable types, '
                . 'and ensure your logic follows the expected flow.';
        }

        return [
            'content' => $reply,
            'meta' => ['fallback' => true],
        ];
    }
}