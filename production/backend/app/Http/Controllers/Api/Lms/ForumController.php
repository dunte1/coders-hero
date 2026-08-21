<?php

namespace App\Http\Controllers\Api\Lms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lms\CreateForumPostRequest;
use App\Http\Requests\Lms\CreateForumThreadRequest;
use App\Services\Lms\ForumService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ForumController extends Controller
{
    use ApiResponse;

    public function __construct(
        private ForumService $forumService
    ) {}

    public function threads(Request $request, int $courseId): JsonResponse
    {
        $threads = $this->forumService->threads(
            $courseId,
            $request->only(['search']),
            (int) $request->get('per_page', 20)
        );

        return $this->paginatedResponse($threads, 'Forum threads retrieved successfully.');
    }

    public function storeThread(CreateForumThreadRequest $request, int $courseId): JsonResponse
    {
        $thread = $this->forumService->createThread(auth()->id(), $courseId, $request->validated());

        return $this->createdResponse($thread, 'Thread created successfully.');
    }

    public function showThread(int $id): JsonResponse
    {
        $thread = $this->forumService->getThread($id);

        if (!$thread) {
            return $this->notFoundResponse('Thread not found.');
        }

        return $this->successResponse($thread, 'Thread retrieved successfully.');
    }

    public function updateThread(CreateForumThreadRequest $request, int $id): JsonResponse
    {
        try {
            $thread = $this->forumService->updateThread($id, auth()->id(), $request->validated());
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->successResponse($thread, 'Thread updated successfully.');
    }

    public function destroyThread(int $id): JsonResponse
    {
        try {
            $this->forumService->deleteThread($id, auth()->id());
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->noContentResponse('Thread deleted successfully.');
    }

    public function post(CreateForumPostRequest $request, int $threadId): JsonResponse
    {
        try {
            $post = $this->forumService->post(
                $threadId,
                auth()->id(),
                $request->validated('content'),
                $request->validated('parent_id')
            );
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), 403);
        }

        return $this->createdResponse($post, 'Post created successfully.');
    }

    public function destroyPost(int $postId): JsonResponse
    {
        try {
            $this->forumService->deletePost($postId, auth()->id());
        } catch (ModelNotFoundException $e) {
            return $this->notFoundResponse($e->getMessage());
        }

        return $this->noContentResponse('Post deleted successfully.');
    }
}
