<?php

namespace App\Services;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AnnouncementService
{
    public function getAll(int $perPage = 15): LengthAwarePaginator
    {
        return Announcement::published()
            ->notExpired()
            ->with('author')
            ->orderByDesc('is_pinned')
            ->orderByDesc('published_at')
            ->paginate($perPage);
    }

    public function getAllForAdmin(int $perPage = 15): LengthAwarePaginator
    {
        return Announcement::with('author')
            ->orderByDesc('is_pinned')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function getById(int $id): ?Announcement
    {
        return Announcement::with('author')->find($id);
    }

    public function create(array $data): Announcement
    {
        $data['published_at'] = $data['published_at'] ?? now();

        $announcement = Announcement::create($data);
        return $announcement->load('author');
    }

    public function update(int $id, array $data): Announcement
    {
        $announcement = Announcement::findOrFail($id);
        $announcement->update($data);
        return $announcement->fresh()->load('author');
    }

    public function delete(int $id): bool
    {
        return Announcement::findOrFail($id)->delete();
    }

    public function pin(int $id): Announcement
    {
        $announcement = Announcement::findOrFail($id);
        $announcement->update(['is_pinned' => !$announcement->is_pinned]);
        return $announcement->fresh();
    }

    public function forUser(string $userId): LengthAwarePaginator
    {
        $user = User::findOrFail($userId);
        $roles = $user->getRoleNames()->toArray();

        return Announcement::published()
            ->notExpired()
            ->where(function ($query) use ($roles) {
                $query->whereNull('target_roles')
                    ->orWhere(function ($q) use ($roles) {
                        foreach ($roles as $role) {
                            $q->orWhereJsonContains('target_roles', $role);
                        }
                    });
            })
            ->with('author')
            ->orderByDesc('is_pinned')
            ->orderByDesc('published_at')
            ->paginate(15);
    }
}
