<?php

namespace App\Services\Lms;

use App\Models\Bookmark;

class BookmarkService
{
    protected array $types = [
        'course' => \App\Models\Course::class,
        'lesson' => \App\Models\Lesson::class,
        'thread' => \App\Models\ForumThread::class,
    ];

    public function all(string $userId, ?string $type = null, int $perPage = 20)
    {
        return Bookmark::query()
            ->forUser($userId)
            ->with('bookmarkable')
            ->when($type && $type !== 'all', function ($query) use ($type) {
                return $query->where('bookmarkable_type', $this->types[$type] ?? $type);
            })
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function toggle(string $userId, string $type, int $id): array
    {
        $morphClass = $this->types[$type] ?? null;

        if (!$morphClass) {
            throw new \InvalidArgumentException('Unsupported bookmark type.');
        }

        $existing = Bookmark::forUser($userId)
            ->where('bookmarkable_type', $morphClass)
            ->where('bookmarkable_id', $id)
            ->first();

        if ($existing) {
            $existing->delete();

            return ['bookmarked' => false];
        }

        Bookmark::create([
            'user_id' => $userId,
            'bookmarkable_type' => $morphClass,
            'bookmarkable_id' => $id,
        ]);

        return ['bookmarked' => true];
    }

    public function status(string $userId, string $type, int $id): array
    {
        $morphClass = $this->types[$type] ?? null;

        return [
            'bookmarked' => $morphClass && Bookmark::forUser($userId)
                ->where('bookmarkable_type', $morphClass)
                ->where('bookmarkable_id', $id)
                ->exists(),
        ];
    }
}
