<?php

namespace App\Services\CodeRunner;

/**
 * Contract for an isolated, sandboxed code execution engine.
 *
 * Implementations MUST run untrusted code outside of the Laravel process
 * (e.g. Piston/Judge0 containers) and MUST enforce resource limits
 * (CPU, memory, execution time, network and filesystem isolation).
 *
 * The normalized result shape:
 *   [
 *     'stdout'    => string,
 *     'stderr'    => string,
 *     'output'    => string,   // combined, trimmed
 *     'exit_code' => int,
 *     'timed_out' => bool,
 *     'version'   => ?string,
 *   ]
 */
interface CodeRunnerContract
{
    public function run(array $files, ?string $stdin = null): array;

    public function languages(): array;

    public function isAvailable(): bool;
}
