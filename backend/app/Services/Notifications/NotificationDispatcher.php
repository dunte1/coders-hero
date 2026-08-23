<?php

namespace App\Services\Notifications;

use App\Jobs\SendChannelNotificationJob;
use App\Models\Notification;
use App\Models\NotificationDelivery;
use App\Models\NotificationPreference;
use App\Models\NotificationTemplate;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;

class NotificationDispatcher
{
    public function __construct(private NotificationTemplateService $templates) {}

    /**
     * Send an event-based notification to one or many users.
     *
     * @param  User|array<int, User>|Collection<int, User>  $users
     * @return array<int, Notification>
     */
    public function notify(User|array|Collection $users, string $event, array $data = [], ?string $link = null, ?array $channels = null): array
    {
        $recipients = $users instanceof User
            ? [$users]
            : ($users instanceof Collection ? $users->all() : $users);

        $created = [];

        foreach ($recipients as $user) {
            if (!$user instanceof User) {
                continue;
            }

            $notification = $this->notifyUser($user, $event, $data, $link, $channels);

            if ($notification !== null) {
                $created[] = $notification;
            }
        }

        return $created;
    }

    /**
     * Send to every user holding one of the given roles.
     *
     * @param  array<int, string>|string  $roles
     * @return array<int, Notification>
     */
    public function notifyRole(array|string $roles, string $event, array $data = [], ?string $link = null, ?array $channels = null): array
    {
        $roleNames = (array) $roles;
        $users = User::query()
            ->where('is_active', true)
            ->whereHas('roles', fn ($q) => $q->whereIn('name', $roleNames))
            ->get();

        return $this->notify($users, $event, $data, $link, $channels);
    }

    public function notifyUser(User $user, string $event, array $data = [], ?string $link = null, ?array $channels = null): ?Notification
    {
        try {
            return $this->dispatchForUser($user, $event, $data, $link, $channels);
        } catch (\Throwable $e) {
            Log::warning("Notification dispatch failed for event [{$event}] user [{$user->id}]: {$e->getMessage()}");

            return null;
        }
    }

    private function dispatchForUser(User $user, string $event, array $data = [], ?string $link = null, ?array $channels = null): ?Notification
    {
        if (!$user->is_active) {
            return null;
        }

        $template = NotificationTemplate::where('event', $event)
            ->where('is_active', true)
            ->first();

        if (!$template) {
            return null;
        }

        $category = $template->category ?? 'system';
        $rendered = $this->templates->render($template, $data);

        $preferred = $this->preferredChannels($user, $category);
        $templateChannels = $channels ?: $template->defaultChannels();

        $enabled = array_values(array_filter(
            array_unique(array_merge($templateChannels, $channels ?: [])),
            fn (string $channel) => $this->isChannelEnabled($channel)
        ));

        $activeChannels = array_values(array_intersect($enabled, $preferred));

        $payload = array_merge($rendered, [
            'event' => $event,
            'data' => $data,
        ]);

        $notification = null;

        if (in_array('in_app', $activeChannels, true)) {
            $notification = $this->createInApp($user, $template, $category, $payload, $link);
        } else {
            // Still record the notification so external deliveries are traceable,
            // but do not surface it in the in-app inbox when in_app is disabled.
            $notification = $this->createInApp($user, $template, $category, $payload, $link, false);
        }

        foreach (['email', 'sms', 'push', 'whatsapp'] as $channel) {
            if (!in_array($channel, $activeChannels, true)) {
                continue;
            }

            if (!$this->recipientCanReceive($user, $channel)) {
                continue;
            }

            $delivery = NotificationDelivery::create([
                'notification_id' => $notification->id,
                'channel' => $channel,
                'status' => 'queued',
                'metadata' => [
                    'event' => $event,
                    'category' => $category,
                ],
            ]);

            SendChannelNotificationJob::dispatch($delivery->id)
                ->onQueue('notifications')
                ->afterCommit();
        }

        return $notification;
    }

    private function createInApp(User $user, NotificationTemplate $template, string $category, array $payload, ?string $link, bool $surfaceInInbox = true): Notification
    {
        return Notification::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'type' => $template->event,
            'category' => $category,
            'channel' => 'in_app',
            'status' => $surfaceInInbox ? 'sent' : 'sent',
            'notifiable_type' => User::class,
            'notifiable_id' => $user->id,
            'data' => $payload,
            'link' => $link,
            'metadata' => [
                'event' => $template->event,
                'category' => $category,
                'in_inbox' => $surfaceInInbox,
            ],
            'sent_at' => now(),
        ]);
    }

    /**
     * Channels a user has opted into for a category (falling back to defaults).
     */
    public function preferredChannels(User $user, string $category): array
    {
        $preference = NotificationPreference::where('user_id', $user->id)
            ->where('category', $category)
            ->first();

        $pref = $preference
            ? $preference->only(['email', 'sms', 'push', 'in_app', 'whatsapp'])
            : config('notifications.default_preferences');

        return array_keys(array_filter($pref, fn ($enabled) => (bool) $enabled));
    }

    public function isChannelEnabled(string $channel): bool
    {
        return (bool) config('notifications.channels.' . $channel, false);
    }

    private function recipientCanReceive(User $user, string $channel): bool
    {
        return match ($channel) {
            'email' => filter_var($user->email, FILTER_VALIDATE_EMAIL) !== false,
            'sms' => is_string($user->phone) && trim($user->phone) !== '',
            'push' => $user->fcmTokens()->active()->exists(),
            'whatsapp' => is_string($user->phone) && trim($user->phone) !== '',
            default => true,
        };
    }

    /**
     * Build the set of available category keys.
     */
    public function categories(): array
    {
        return config('notifications.categories');
    }

    /**
     * Resolve defaults for a user across every category.
     */
    public function preferencesFor(User $user): array
    {
        $stored = NotificationPreference::where('user_id', $user->id)
            ->get()
            ->keyBy('category');

        $defaults = config('notifications.default_preferences');

        $rows = [];

        foreach (array_keys($this->categories()) as $category) {
            $row = $stored->get($category);
            $rows[$category] = [
                'category' => $category,
                'email' => $row ? $row->email : $defaults['email'],
                'sms' => $row ? $row->sms : $defaults['sms'],
                'push' => $row ? $row->push : $defaults['push'],
                'in_app' => $row ? $row->in_app : $defaults['in_app'],
                'whatsapp' => $row ? $row->whatsapp : $defaults['whatsapp'],
            ];
        }

        return $rows;
    }

    /**
     * Persist preference updates for a user (partial allowed).
     */
    public function updatePreferences(User $user, array $preferences): array
    {
        foreach ($preferences as $category => $channels) {
            if (!array_key_exists($category, $this->categories())) {
                continue;
            }

            $booleanKeys = Arr::only($channels, ['email', 'sms', 'push', 'in_app', 'whatsapp']);

            $row = NotificationPreference::firstOrNew([
                'user_id' => $user->id,
                'category' => $category,
            ]);

            foreach ($booleanKeys as $key => $value) {
                $row->{$key} = (bool) $value;
            }

            $row->save();
        }

        return $this->preferencesFor($user);
    }
}
