<?php

namespace App\Services\Lms;

use App\Models\ForumPost;
use App\Models\ForumThread;

class ForumService
{
    public function threads(int $courseId, array $filters = [], int $perPage = 20)
    {
        return ForumThread::query()
            ->with(['user', 'posts.user'])
            ->withCount('allPosts')
            ->where('course_id', $courseId)
            ->when(!empty($filters['search']), function ($query) use ($filters) {
                return $query->where(function ($q) use ($filters) {
                    $q->where('title', 'like', "%{$filters['search']}%")
                        ->orWhere('content', 'like', "%{$filters['search']}%");
                });
            })
            ->orderByDesc('is_pinned')
            ->orderByDesc('updated_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getThread(int $id): ?ForumThread
    {
        $thread = ForumThread::with(['user', 'course', 'posts.user', 'posts.replies.user'])->find($id);

        if ($thread) {
            $thread->incrementViews();
        }

        return $thread;
    }

    public function createThread(string $userId, int $courseId, array $data): ForumThread
    {
        return ForumThread::create([
            'course_id' => $courseId,
            'user_id' => $userId,
            'title' => $data['title'],
            'content' => $data['content'],
            'is_pinned' => $data['is_pinned'] ?? false,
            'is_locked' => $data['is_locked'] ?? false,
        ]);
    }

    public function updateThread(int $id, string $userId, array $data): ForumThread
    {
        $thread = $this->findThreadForUser($id, $userId);
        $thread->update($data);

        return $thread->fresh(['user', 'posts.user']);
    }

    public function deleteThread(int $id, string $userId): bool
    {
        $thread = $this->findThreadForUser($id, $userId);

        return (bool) $thread->delete();
    }

    public function pinThread(int $id, string $userId, bool $pinned): ForumThread
    {
        $thread = $this->findThreadForUser($id, $userId);
        $thread->update(['is_pinned' => $pinned]);

        return $thread->fresh();
    }

    public function post(int $threadId, string $userId, string $content, ?int $parentId = null): ForumPost
    {
        $thread = ForumThread::findOrFail($threadId);

        if ($thread->is_locked) {
            throw new \RuntimeException('This thread is locked and cannot accept new posts.');
        }

        $post = ForumPost::create([
            'thread_id' => $threadId,
            'user_id' => $userId,
            'content' => $content,
            'parent_id' => $parentId,
        ]);

        $thread->touch();

        return $post->load(['user', 'replies.user']);
    }

    public function deletePost(int $postId, string $userId): bool
    {
        $post = ForumPost::where('id', $postId)->where('user_id', $userId)->first();

        if (!$post) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Forum post not found.');
        }

        return (bool) $post->delete();
    }

    protected function findThreadForUser(int $id, string $userId): ForumThread
    {
        $thread = ForumThread::where('id', $id)
            ->where('user_id', $userId)
            ->first();

        if (!$thread) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Forum thread not found.');
        }

        return $thread;
    }
}
