<?php

namespace App\Http\Controllers\Api\Lms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lms\RunPlaygroundCodeRequest;
use App\Http\Requests\Lms\SaveWorkspaceRequest;
use App\Services\Lms\CodingPlaygroundService;
use App\Services\CodeRunner\CodeRunnerUnavailableException;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlaygroundController extends Controller
{
    use ApiResponse;

    public function __construct(
        private CodingPlaygroundService $playgroundService
    ) {}

    public function run(RunPlaygroundCodeRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $languageConfig = $this->playgroundService->getLanguageConfig($validated['language']);
        $entry = $languageConfig['entry'] ?? 'main.' . $validated['language'];
        $pistonLanguage = $languageConfig['piston'] ?? $validated['language'];

        try {
            $result = $this->playgroundService->runCode(
                $validated['language'],
                [[
                    'name' => $entry,
                    'content' => $validated['code'],
                    'language' => $pistonLanguage,
                ]],
                $validated['stdin'] ?? null,
            );

            return $this->successResponse([
                'stdout' => $result['stdout'],
                'stderr' => $result['stderr'],
                'output' => $result['output'],
                'exit_code' => $result['exit_code'],
                'timed_out' => $result['timed_out'],
            ]);
        } catch (CodeRunnerUnavailableException $e) {
            return $this->errorResponse($e->getMessage(), 503);
        } catch (\Throwable $e) {
            return $this->errorResponse('Code execution failed: ' . $e->getMessage(), 500);
        }
    }

    public function saveWorkspace(SaveWorkspaceRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $workspace = $this->playgroundService->saveWorkspace(
            auth()->id(),
            $validated['name'],
            $validated['language'],
            $validated['files'],
            $validated['active_file'] ?? null,
        );

        return $this->createdResponse($workspace, 'Workspace saved successfully.');
    }

    public function loadWorkspace(int $workspaceId): JsonResponse
    {
        $workspace = $this->playgroundService->loadWorkspace($workspaceId, auth()->id());

        if (!$workspace) {
            return $this->notFoundResponse('Workspace not found.');
        }

        return $this->successResponse($workspace->only('name', 'language', 'files', 'active_file', 'saved_at'));
    }

    public function updateWorkspace(SaveWorkspaceRequest $request, int $workspaceId): JsonResponse
    {
        $validated = $request->validated();

        $workspace = $this->playgroundService->updateWorkspace($workspaceId, auth()->id(), $validated);

        if (!$workspace) {
            return $this->notFoundResponse('Workspace not found.');
        }

        return $this->successResponse($workspace, 'Workspace updated successfully.');
    }

    public function deleteWorkspace(int $workspaceId): JsonResponse
    {
        $deleted = $this->playgroundService->deleteWorkspace($workspaceId, auth()->id());

        if (!$deleted) {
            return $this->notFoundResponse('Workspace not found.');
        }

        return $this->successResponse(null, 'Workspace deleted successfully.');
    }

    public function listWorkspaces(): JsonResponse
    {
        $workspaces = $this->playgroundService->listWorkspaces(auth()->id());

        return $this->successResponse($workspaces);
    }

    public function languages(): JsonResponse
    {
        $runner = $this->playgroundService->getRunner();

        $languages = collect(config('services.code_runner.languages', []))
            ->filter(function (array $definition, string $slug) use ($runner) {
                if ($runner instanceof \App\Services\CodeRunner\NativeCodeRunner) {
                    return $runner->supports($slug);
                }
                if ($runner instanceof \App\Services\CodeRunner\NullCodeRunner) {
                    return false;
                }

                return true;
            })
            ->map(fn (array $definition, string $slug) => [
                'slug' => $slug,
                'label' => $definition['label'] ?? $slug,
                'entry' => $definition['entry'] ?? 'main.' . $slug,
            ])
            ->values()
            ->all();

        return $this->successResponse($languages);
    }
}