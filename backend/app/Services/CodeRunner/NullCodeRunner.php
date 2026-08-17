<?php

namespace App\Services\CodeRunner;

/**
 * Fallback used when no isolated runner is configured (CODE_RUNNER_ENABLED=false).
 *
 * It never executes user code. Callers must degrade gracefully (return the
 * submission with a "pending" status instead of silently grading), so the
 * platform stays secure by default and the isolated runner is a hard
 * requirement for real execution.
 */
class NullCodeRunner implements CodeRunnerContract
{
    public function isAvailable(): bool
    {
        return false;
    }

    public function languages(): array
    {
        return [];
    }

    public function run(array $files, ?string $stdin = null): array
    {
        throw new CodeRunnerUnavailableException();
    }
}
