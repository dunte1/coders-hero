<?php

namespace App\Services\CodeRunner;

use Illuminate\Support\Str;

/**
 * Local execution engine for shared/cPanel hosting that has no Docker.
 *
 * Runs untrusted code using the interpreters/compilers already installed on
 * the host (python3, node, php, ruby, perl, bash, gcc, g++). Each run happens
 * inside a fresh temporary directory with a hard wall-clock timeout and a
 * process-level memory cap, and each top-level command is prefixed with GNU
 * `timeout` so a runaway process is force-killed.
 *
 * SECURITY NOTE: this executes code on the application server, not in an
 * isolated container. Only enable it where Piston is not an option and the
 * host is a dedicated/staging environment for the platform.
 */
class NativeCodeRunner implements CodeRunnerContract
{
/**
     * piston -> native runtime definition.
     *
     * @var array<string, array{binary: string, interpreter: bool, source: string, output?: string, flags?: string, mem_kb?: int}>
     */
    protected array $runtimes = [
        'python' => ['binary' => 'python3', 'interpreter' => true, 'source' => 'main.py'],
        'javascript' => ['binary' => 'node', 'interpreter' => true, 'source' => 'main.js', 'mem_kb' => 1048576],
        'php' => ['binary' => 'php', 'interpreter' => true, 'source' => 'main.php', 'mem_kb' => 1048576],
        'ruby' => ['binary' => 'ruby', 'interpreter' => true, 'source' => 'main.rb', 'flags' => '--disable-gems', 'mem_kb' => 512000],
        'perl' => ['binary' => 'perl', 'interpreter' => true, 'source' => 'main.pl'],
        'bash' => ['binary' => 'bash', 'interpreter' => true, 'source' => 'main.sh'],
        'c' => ['binary' => 'gcc', 'interpreter' => false, 'compile' => '-o', 'source' => 'main.c', 'output' => 'main', 'mem_kb' => 512000],
        'c++' => ['binary' => 'g++', 'interpreter' => false, 'compile' => '-o', 'source' => 'main.cpp', 'output' => 'main', 'mem_kb' => 512000],
    ];

    /** @var array<string, array{binary: string, interpreter: bool, source: string, output?: string, flags?: string, mem_kb?: int, path: ?string}> */
    protected array $runtimeBinary = [];

    public function __construct(
        private readonly int $runTimeoutMs = 10000,
        private readonly int $compileTimeoutMs = 15000,
        private readonly int $memoryLimitKb = 256000,
    ) {
        $this->runtimeBinary = $this->detectRuntimes();
    }

    protected function detectRuntimes(): array
    {
        return array_map(
            fn ($runtime) => [
                ...$runtime,
                'path' => $this->resolveBinary($runtime['binary']),
            ],
            $this->runtimes
        );
    }

    public function isAvailable(): bool
    {
        foreach ($this->runtimeBinary as $runtime) {
            if ($runtime['path'] !== null) {
                return true;
            }
        }

        return false;
    }

    public function languages(): array
    {
        $languages = [];

        foreach ($this->runtimeBinary as $piston => $runtime) {
            if ($runtime['path'] !== null) {
                $languages[] = $piston;
            }
        }

        return $languages;
    }

    public function supports(string $language): bool
    {
        $piston = config("services.code_runner.languages.{$language}.piston", $language);

        return isset($this->runtimeBinary[$piston]) && $this->runtimeBinary[$piston]['path'] !== null;
    }

    public function run(array $files, ?string $stdin = null): array
    {
        if (empty($files)) {
            throw new CodeRunnerUnavailableException('No source files were provided.');
        }

        $language = $files[0]['language'] ?? 'python';

        if (!isset($this->runtimeBinary[$language])) {
            throw new CodeRunnerUnavailableException("Language '{$language}' has no local runtime on this server.");
        }

        $runtime = $this->runtimeBinary[$language];

        if ($runtime['path'] === null || $runtime['path'] === '') {
            throw new CodeRunnerUnavailableException("Binary '{$runtime['binary']}' is not installed on this server.");
        }

        $dir = $this->makeTempDir();

        try {
            $this->writeFiles($files, $dir);

            $runSeconds = max(1, (int) ceil($this->runTimeoutMs / 1000));
            $compileSeconds = max(1, (int) ceil($this->compileTimeoutMs / 1000));
            $memoryKb = max(1024, (int) ($runtime['mem_kb'] ?? $this->memoryLimitKb));

            if ($runtime['interpreter']) {
                $flags = $runtime['flags'] ?? '';
                $command = "timeout -k {$runSeconds}s {$runSeconds}s {$runtime['path']} {$flags} {$this->esc($runtime['source'])}";
            } else {
                $compileCommand = "timeout -k {$compileSeconds}s {$compileSeconds}s {$runtime['path']} {$this->esc($runtime['source'])} -o {$this->esc($runtime['output'])}";
                $command = "{$compileCommand} && timeout -k {$runSeconds}s {$runSeconds}s {$this->esc('./' . $runtime['output'])}";
            }

            return $this->execute($dir, $command, $stdin, $memoryKb);
        } finally {
            $this->cleanup($dir);
        }
    }

    protected function resolveBinary(string $binary): ?string
    {
        $candidates = [
            $binary,
            $this->homeDir('node') . '/current/bin/' . $binary,
            $this->homeDir() . '/.local/bin/' . $binary,
        ];

        $found = @exec('command -v ' . escapeshellarg($binary) . ' 2>/dev/null');

        if (is_string($found) && $found !== '' && $found !== false) {
            return trim($found);
        }

        foreach ($candidates as $candidate) {
            if (is_file($candidate) && @is_executable($candidate)) {
                return $candidate;
            }
        }

        $nvm = $this->homeDir() . '/.nvm/versions/node';
        $nvmHome = $this->homeDir('current/bin');
        foreach ([$nvm, $nvmHome] as $dir) {
            if ($dir !== '' && is_dir($dir)) {
                $versions = glob($dir . '/*/bin/' . $binary) ?: [];
                if ($versions) {
                    return $versions[0];
                }
            }
        }

        foreach (['/home/*/.nvm/versions/node/*/bin/' . $binary] as $pattern) {
            $versions = glob($pattern) ?: [];
            sort($versions);
            if ($versions) {
                return $versions[0];
            }
        }

        return null;
    }

    protected function homeDir(string $sub = ''): string
    {
        $home = (string) (getenv('HOME') ?: '');
        if ($home === '') {
            $home = trim((string) @exec('echo $HOME 2>/dev/null'));
        }

        return rtrim($home, '/\\') . ($sub !== '' ? '/' . $sub : '');
    }

    protected function makeTempDir(): string
    {
        $base = rtrim((string) storage_path('app/code-runner'), '/\\');

        if (!is_dir($base) && !@mkdir($base, 0700, true) && !is_dir($base)) {
            $base = rtrim((string) (sys_get_temp_dir() ?: '/tmp'), '/\\');
        }

        $dir = $base . '/run_' . Str::random(12);

        if (!mkdir($dir, 0700, true) && !is_dir($dir)) {
            throw new CodeRunnerUnavailableException('Could not create a scratch directory for code execution.');
        }

        return $dir;
    }

    protected function writeFiles(array $files, string $dir): void
    {
        foreach ($files as $file) {
            $name = basename((string) ($file['name'] ?? 'main'));

            if ($name === '' || $name === '.' || $name === '..' || str_contains($name, '/')) {
                $name = 'main';
            }

            $content = (string) ($file['content'] ?? '');

            if (file_put_contents($dir . '/' . $name, $content) === false) {
                throw new CodeRunnerUnavailableException('Could not write source file for code execution.');
            }
        }
    }

    protected function esc(string $path): string
    {
        return escapeshellarg($path);
    }

    protected function execute(string $dir, string $command, ?string $stdin, int $memoryKb): array
    {
        $wrapped = sprintf(
            'cd %s && ulimit -v %d 2>/dev/null; %s',
            escapeshellarg($dir),
            $memoryKb,
            $command
        );

        $process = proc_open(
            ['/bin/bash', '-c', $wrapped],
            [
                0 => ['pipe', 'r'],
                1 => ['pipe', 'w'],
                2 => ['pipe', 'w'],
            ],
            $pipes,
            $dir
        );

        if (!is_resource($process)) {
            throw new CodeRunnerUnavailableException('Could not start the code execution process.');
        }

        if ($stdin !== null && $stdin !== '') {
            fwrite($pipes[0], $stdin);
        }
        fclose($pipes[0]);

        $stdout = stream_get_contents($pipes[1]);
        $stderr = stream_get_contents($pipes[2]);

        fclose($pipes[1]);
        fclose($pipes[2]);

        $exitCode = proc_close($process);

        $timedOut = in_array($exitCode, [124, 137], true);

        $output = trim((string) $stdout . "\n" . (string) $stderr);

        return [
            'stdout' => (string) $stdout,
            'stderr' => (string) $stderr,
            'output' => $output,
            'exit_code' => (int) $exitCode,
            'timed_out' => $timedOut,
            'version' => null,
        ];
    }

    protected function cleanup(string $dir): void
    {
        if (!is_dir($dir)) {
            return;
        }

        exec('rm -rf ' . escapeshellarg($dir) . ' 2>/dev/null');
    }
}