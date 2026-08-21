<?php

namespace App\Http\Controllers\Api\Lms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lms\CreateAiTutorConversationRequest;
use App\Http\Requests\Lms\SendAiTutorMessageRequest;
use App\Services\Lms\AiTutorService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiTutorController extends Controller
{
    use ApiResponse;

    public function __construct(
        private AiTutorService $tutorService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $conversations = $this->tutorService->conversations(auth()->id(), (int) $request->get('per_page', 20));

        return $this->paginatedResponse($conversations, 'Conversations retrieved successfully.');
    }

    public function store(CreateAiTutorConversationRequest $request): JsonResponse
    {
        $conversation = $this->tutorService->createConversation(auth()->id(), $request->validated());

        return $this->createdResponse($conversation, 'Conversation created successfully.');
    }

    public function show(int $id): JsonResponse
    {
        $conversation = $this->tutorService->getConversation($id, auth()->id());

        if (!$conversation) {
            return $this->notFoundResponse('Conversation not found.');
        }

        return $this->successResponse($conversation, 'Conversation retrieved successfully.');
    }

    public function rename(Request $request, int $id): JsonResponse
    {
        $request->validate(['title' => ['required', 'string', 'max:255']]);

        try {
            $conversation = $this->tutorService->renameConversation($id, auth()->id(), $request->validated('title'));
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->successResponse($conversation, 'Conversation renamed successfully.');
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->tutorService->deleteConversation($id, auth()->id());
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->noContentResponse('Conversation deleted successfully.');
    }

    public function send(SendAiTutorMessageRequest $request, int $id): JsonResponse
    {
        try {
            $result = $this->tutorService->sendMessage($id, auth()->id(), $request->validated('content'));
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->successResponse($result, 'Message sent successfully.');
    }
}
