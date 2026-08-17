<?php

namespace App\Services\Lms;

use App\Models\CodingWorkspace;
use App\Models\CodingSubmission;
use App\Services\CodeRunner\CodeRunnerContract;
use App\Services\CodeRunner\CodeRunnerUnavailableException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class CodingPlaygroundService
{
    protected CodeRunnerContract $runner;

    public function __construct(CodeRunnerContract $runner)
    {
        $this->runner = $runner;
    }

    public function saveWorkspace(string $userId, string $name, string $language, array $files, ?string $activeFile = null): CodingWorkspace
    {
        return CodingWorkspace::create([
            'user_id' => $userId,
            'name' => $name,
            'language' => $language,
            'files' => $files,
            'active_file' => $activeFile,
            'saved_at' => now(),
        ]);
    }

    public function loadWorkspace(int $workspaceId, string $userId): ?CodingWorkspace
    {
        return CodingWorkspace::where('id', $workspaceId)
            ->where('user_id', $userId)
            ->first();
    }

    public function updateWorkspace(int $workspaceId, string $userId, array $data): ?CodingWorkspace
    {
        $workspace = $this->loadWorkspace($workspaceId, $userId);

        if (!$workspace) {
            return null;
        }

        $workspace->update([
            'name' => $data['name'],
            'language' => $data['language'],
            'files' => $data['files'],
            'active_file' => $data['active_file'] ?? null,
            'saved_at' => now(),
        ]);

        return $workspace->fresh();
    }

    public function deleteWorkspace(int $workspaceId, string $userId): bool
    {
        $workspace = $this->loadWorkspace($workspaceId, $userId);

        if (!$workspace) {
            return false;
        }

        return (bool) $workspace->delete();
    }

    public function listWorkspaces(string $userId, ?int $courseId = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = CodingWorkspace::where('user_id', $userId);

        if ($courseId) {
            $query->where('course_id', $courseId);
        }

        return $query->orderByDesc('saved_at')->get();
    }

    public function runCode(string $language, array $files, ?string $stdin = null, ?int $timeout = null): array
    {
        if (!$this->runner->isAvailable()) {
            throw new CodeRunnerUnavailableException();
        }

        $timeout = $timeout ?? $this->runner->timeout;

        try {
            $runResult = $this->runner->run($files, $stdin, $timeout);
        } catch (\Throwable $e) {
            throw new CodeRunnerUnavailableException('Code execution failed: ' . $e->getMessage());
        }

        return [
            'stdout' => $runResult['stdout'] ?? '',
            'stderr' => $runResult['stderr'] ?? '',
            'output' => $runResult['output'] ?? '',
            'exit_code' => $runResult['exit_code'] ?? 1,
            'timed_out' => $runResult['timed_out'] ?? false,
        ];
    }

    public function getLanguageConfig(string $language): array
    {
        $config = config('services.code_runner.languages', []);

        return $config[$language] ?? $config['python'] ?? [];
    }
}