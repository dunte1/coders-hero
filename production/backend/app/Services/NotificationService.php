<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class NotificationService
{
    public function send(string $userId, string $title, string $body, string $type = 'general'): Notification
    {
        $user = User::findOrFail($userId);

        return Notification::create([
            'type' => $type,
            'notifiable_type' => User::class,
            'notifiable_id' => $userId,
            'data' => [
                'title' => $title,
                'body' => $body,
            ],
        ]);
    }

    public function sendToMultiple(array $userIds, string $title, string $body, string $type = 'general'): void
    {
        foreach ($userIds as $userId) {
            $this->send($userId, $title, $body, $type);
        }
    }

    public function sendToRole(string $roleName, string $title, string $body, string $type = 'general'): int
    {
        $users = User::role($roleName)->pluck('id');
        $count = 0;

        foreach ($users as $userId) {
            $this->send($userId, $title, $body, $type);
            $count++;
        }

        return $count;
    }

    public function getAll(string $userId, int $perPage = 15, array $filters = [])
    {
        return Notification::forUser($userId)
            ->with('deliveries')
            ->inInbox()
            ->ofCategory($filters['category'] ?? null)
            ->ofStatus($filters['status'] ?? null)
            ->ofChannel($filters['channel'] ?? null)
            ->ofReadStatus(
                isset($filters['is_read']) ? filter_var($filters['is_read'], FILTER_VALIDATE_BOOL) : null
            )
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function getUnread(string $userId)
    {
        return Notification::forUser($userId)
            ->with('deliveries')
            ->inInbox()
            ->unread()
            ->orderByDesc('created_at')
            ->get();
    }

    public function getUnreadCount(string $userId): int
    {
        return Notification::forUser($userId)->inInbox()->unread()->count();
    }

    public function markAsRead(string $userId, string $notificationId): bool
    {
        $notification = Notification::forUser($userId)->findOrFail($notificationId);
        $notification->markAsRead();
        return true;
    }

    public function markAllAsRead(string $userId): int
    {
        return Notification::forUser($userId)
            ->unread()
            ->update(['read_at' => now()]);
    }

    public function delete(string $userId, string $notificationId): bool
    {
        return Notification::forUser($userId)->findOrFail($notificationId)->delete();
    }

    public function getStats(string $userId): array
    {
        $notifications = Notification::forUser($userId)->inInbox();

        return [
            'total' => (clone $notifications)->count(),
            'unread' => (clone $notifications)->unread()->count(),
            'read' => (clone $notifications)->read()->count(),
            'today' => (clone $notifications)->whereDate('created_at', today())->count(),
            'this_week' => (clone $notifications)->where('created_at', '>=', now()->startOfWeek())->count(),
        ];
    }
}
