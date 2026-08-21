<?php

namespace App\Services\CodeRunner;

use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Executes untrusted code against a Piston-compatible isolated runner.
 *
 * Each execution runs inside a fresh ephemeral container with enforced
 * CPU, memory, runtime and compile time limits. The runner container has no
 * outbound network access and a read-only filesystem, so untrusted code can
 * never reach the application server, the database or the host network.
 */
class PistonCodeRunner implements CodeRunnerContract
{
    public function __construct(
        private readonly string $baseUrl,
        private readonly ?string $token = null,
        private readonly int $timeout = 30,
        private readonly int $runTimeoutMs = 10000,
        private readonly int $compileTimeoutMs = 15000,
        private readonly int $memoryLimitKb = 256000,
    ) {}

    public function isAvailable(): bool
    {
        return $this->baseUrl !== '';
    }

    protected function client(): \Illuminate\Http\Client\PendingRequest
    {
        $client = Http::baseUrl($this->baseUrl)->timeout($this->timeout);

        if ($this->token !== null && $this->token !== '') {
            $client = $client->withToken($this->token);
        }

        return $client;
    }

    public function languages(): array
    {
        $response = $this->client()
            ->get('/runtimes');

        if ($response->failed()) {
            throw new CodeRunnerUnavailableException('Could not reach the code execution service.');
        }

        return collect($response->json())
            ->map(fn (array $runtime) => [
                'language' => $runtime['language'] ?? null,
                'version' => $runtime['version'] ?? null,
            ])
            ->filter()
            ->values()
            ->all();
    }

    public function run(array $files, ?string $stdin = null): array
    {
        if (!$this->isAvailable()) {
            throw new CodeRunnerUnavailableException();
        }

        $language = $files[0]['language'] ?? 'python';
        $payloadFiles = array_values(array_map(
            fn (array $file) => [
                'name' => $file['name'],
                'content' => $file['content'],
            ],
            $files
        ));

        $payload = [
            'language' => $language,
            'version' => '*',
            'files' => $payloadFiles,
            'stdin' => $stdin,
            'run_timeout' => $this->runTimeoutMs,
            'compile_timeout' => $this->compileTimeoutMs,
            'run_memory_limit' => $this->memoryLimitKb,
            'compile_memory_limit' => $this->memoryLimitKb,
        ];

        try {
            $response = $this->client()
                ->post('/execute', $payload);
        } catch (\Throwable $e) {
            throw new CodeRunnerUnavailableException('Code execution service could not be reached: ' . $e->getMessage());
        }

        if ($response->failed()) {
            throw new CodeRunnerUnavailableException('Code execution failed with status ' . $response->status());
        }

        $run = $response->json('run', []);

        $exitCode = (int) ($run['code'] ?? 1);
        $signal = $run['signal'] ?? null;

        return [
            'stdout' => (string) ($run['stdout'] ?? ''),
            'stderr' => (string) ($run['stderr'] ?? ''),
            'output' => trim((string) ($run['output'] ?? '')),
            'exit_code' => $exitCode,
            'timed_out' => $signal !== null && in_array($signal, ['Killed', 'Timeout'], true) || $exitCode === 137,
            'version' => $response->json('version'),
        ];
    }
}
