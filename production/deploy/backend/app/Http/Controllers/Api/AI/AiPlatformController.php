<?php

namespace App\Http\Controllers\Api\AI;

use App\Http\Controllers\Controller;
use App\Services\AI\AiPlatformService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiPlatformController extends Controller
{
    use ApiResponse;

    public function __construct(
        private AiPlatformService $aiPlatformService
    ) {}

    public function assistants(): JsonResponse
    {
        return $this->successResponse(
            $this->aiPlatformService->assistants(),
            'AI assistants retrieved successfully.'
        );
    }

    public function assistant(string $slug): JsonResponse
    {
        try {
            $assistant = $this->aiPlatformService->assistant($slug);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Assistant not found.');
        }

        return $this->successResponse($assistant, 'Assistant retrieved successfully.');
    }

    public function conversations(Request $request): JsonResponse
    {
        $conversations = $this->aiPlatformService->conversations(
            auth()->id(),
            $request->integer('assistant_id') ?: null,
            (int) $request->get('per_page', 20)
        );

        return $this->paginatedResponse($conversations, 'Conversations retrieved successfully.');
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'assistant_slug' => ['required', 'string', 'exists:ai_assistants,slug'],
            'title' => ['nullable', 'string', 'max:120'],
            'context' => ['nullable', 'array'],
        ]);

        $conversation = $this->aiPlatformService->createConversation(
            auth()->id(),
            $request->input('assistant_slug'),
            $request->only(['title', 'context'])
        );

        return $this->createdResponse($conversation->load('assistant'), 'Conversation created successfully.');
    }

    public function show(int $id): JsonResponse
    {
        try {
            $conversation = $this->aiPlatformService->getConversation($id, auth()->id());
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Conversation not found.');
        }

        return $this->successResponse($conversation, 'Conversation retrieved successfully.');
    }

    public function rename(Request $request, int $id): JsonResponse
    {
        $request->validate(['title' => ['required', 'string', 'max:120']]);

        try {
            $conversation = $this->aiPlatformService->renameConversation($id, auth()->id(), $request->input('title'));
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Conversation not found.');
        }

        return $this->successResponse($conversation, 'Conversation renamed successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->aiPlatformService->deleteConversation($id, auth()->id());
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Conversation not found.');
        }

        return $this->successResponse(null, 'Conversation deleted successfully.');
    }

    public function send(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'content' => ['required', 'string', 'max:' . config('ai.safety.max_message_length', 4000)],
        ]);

        try {
            $result = $this->aiPlatformService->sendMessage($id, auth()->id(), $request->input('content'));
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Conversation not found.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        } catch (\RuntimeException $e) {
            $status = $e->getCode() === 429 ? 429 : 503;

            return $this->errorResponse($e->getMessage(), $status);
        }

        return $this->successResponse($result, 'Message sent successfully.');
    }

    public function promptTemplates(Request $request): JsonResponse
    {
        return $this->successResponse(
            $this->aiPlatformService->promptTemplates($request->input('category')),
            'Prompt templates retrieved successfully.'
        );
    }

    public function generateFromTemplate(Request $request): JsonResponse
    {
        $request->validate([
            'slug' => ['required', 'string', 'exists:ai_prompt_templates,slug'],
            'variables' => ['nullable', 'array'],
        ]);

        try {
            $result = $this->aiPlatformService->generateWithTemplate(
                $request->input('slug'),
                $request->input('variables', [])
            );
        } catch (\RuntimeException $e) {
            $status = $e->getCode() === 429 ? 429 : 503;

            return $this->errorResponse($e->getMessage(), $status);
        }

        return $this->successResponse($result, 'AI generation completed successfully.');
    }

    public function myUsage(Request $request): JsonResponse
    {
        return $this->successResponse(
            $this->aiPlatformService->myUsage(auth()->id(), (int) $request->get('days', 30)),
            'Usage retrieved successfully.'
        );
    }
}
