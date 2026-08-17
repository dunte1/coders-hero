<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\NotificationDelivery;
use App\Models\NotificationTemplate;
use App\Models\User;
use App\Models\UserFcmToken;
use App\Services\Notifications\NotificationDispatcher;
use Database\Seeders\NotificationSeeder;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Queue;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
        $this->seed(PermissionSeeder::class);
        $this->seed(NotificationSeeder::class);

        Cache::flush();
    }

    private function user(string $role = 'student', array $attrs = []): User
    {
        $user = User::factory()->create($attrs);
        $user->assignRole($role);

        return $user;
    }

    private function dispatch(User $user, string $event, array $data = [], ?string $link = null, ?array $channels = null): array
    {
        return app(NotificationDispatcher::class)->notify($user, $event, $data, $link, $channels);
    }

    public function test_notification_endpoints_require_authentication(): void
    {
        $this->getJson('/api/notifications')->assertStatus(401);
        $this->getJson('/api/notifications/unread')->assertStatus(401);
        $this->getJson('/api/notification-preferences')->assertStatus(401);
        $this->getJson('/api/notification-templates')->assertStatus(401);
        $this->getJson('/api/admin/notifications/summary')->assertStatus(401);
        $this->getJson('/api/admin/notifications/deliveries')->assertStatus(401);
        $this->getJson('/api/admin/notification-templates')->assertStatus(401);
    }

    public function test_default_preferences_are_returned_for_all_categories(): void
    {
        $user = $this->user('student');
        Sanctum::actingAs($user);

        $this->getJson('/api/notification-preferences')
            ->assertOk()
            ->assertJsonPath('data.0.category', 'attendance')
            ->assertJsonCount(7, 'data');
    }

    public function test_user_can_update_preferences(): void
    {
        $user = $this->user('student');
        Sanctum::actingAs($user);

        $this->putJson('/api/notification-preferences', [
            'preferences' => [
                'fees' => ['email' => true, 'sms' => true, 'push' => false, 'in_app' => false],
                'not_a_category' => ['email' => true],
            ],
        ])
            ->assertOk()
            ->assertJsonPath('data.1.category', 'fees')
            ->assertJsonPath('data.1.sms', true);

        $this->assertDatabaseHas('notification_preferences', [
            'user_id' => $user->id,
            'category' => 'fees',
            'sms' => true,
            'in_app' => false,
        ]);

        $this->assertDatabaseMissing('notification_preferences', [
            'user_id' => $user->id,
            'category' => 'not_a_category',
        ]);
    }

    public function test_dispatcher_creates_in_app_notification_and_delivery(): void
    {
        $user = $this->user('student');
        $sent = $this->dispatch($user, 'attendance.alert', [
            'student_name' => 'Jane Doe',
            'status' => 'Absent',
            'date' => 'Aug 15, 2026',
        ]);

        $this->assertCount(1, $sent);

        $notification = $sent[0];
        $this->assertSame('attendance.alert', $notification->type);
        $this->assertSame('attendance', $notification->category);

        $this->assertDatabaseHas('notifications', [
            'id' => $notification->id,
            'notifiable_id' => $user->id,
            'category' => 'attendance',
        ]);

        $delivery = NotificationDelivery::where('notification_id', $notification->id)->first();
        $this->assertNotNull($delivery);
        $this->assertSame('delivered', $delivery->status);
        $this->assertSame('email', $delivery->channel);
    }

    public function test_inbox_listing_read_flow(): void
    {
        $user = $this->user('student');
        $sent = $this->dispatch($user, 'attendance.alert', ['title' => 'Hello', 'status' => 'Late', 'date' => 'Aug 15, 2026', 'student_name' => 'Jane']);
        Sanctum::actingAs($user);

        $this->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonPath('data.0.id', $sent[0]->id)
            ->assertJsonPath('data.0.title', 'Hello');

        $this->putJson('/api/notifications/' . $sent[0]->id . '/read')->assertOk();
        $this->assertNotNull($sent[0]->fresh()->read_at);

        $this->putJson('/api/notifications/read-all')->assertOk();
        $this->getJson('/api/notifications/stats')->assertJsonPath('data.unread', 0);
    }

    public function test_legacy_notification_still_shows_in_inbox(): void
    {
        $user = $this->user('student');
        app(\App\Services\NotificationService::class)->send($user->id, 'Old title', 'Old body');

        Sanctum::actingAs($user);

        $this->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Old title');
    }

    public function test_email_delivery_tracking(): void
    {
        Mail::fake();
        $user = $this->user('student');

        $sent = $this->dispatch($user, 'invoice.issued', ['invoice_number' => 'INV-1', 'amount' => '500.00']);

        $delivery = NotificationDelivery::where('notification_id', $sent[0]->id)
            ->where('channel', 'email')
            ->first();

        $this->assertNotNull($delivery);
        $this->assertSame('delivered', $delivery->status);
        $this->assertNotNull($delivery->delivered_at);

        Mail::assertSent(\App\Mail\NotificationMail::class, fn ($mail) => $mail->hasTo($user->email));
    }

    public function test_sms_delivery_via_africa_talking(): void
    {
        Config::set('notifications.channels.sms', true);
        Config::set('notifications.default_preferences.sms', true);
        Config::set('notifications.africastalking.api_key', 'test-key');

        Http::fake([
            'https://api.africastalking.com/*' => Http::response([
                'SMSMessageData' => [
                    'Recipients' => [
                        ['messageId' => 'ATX123', 'status' => 'Success', 'statusCode' => 101, 'description' => 'Sent'],
                    ],
                ],
            ], 200),
        ]);

        $user = $this->user('student', ['phone' => '+254700000000']);
        $sent = $this->dispatch($user, 'fee.reminder', ['amount' => '1000.00', 'due_date' => 'Aug 30, 2026']);

        $delivery = NotificationDelivery::where('notification_id', $sent[0]->id)
            ->where('channel', 'sms')
            ->first();

        $this->assertNotNull($delivery);
        $this->assertSame('delivered', $delivery->status);
        $this->assertSame('ATX123', $delivery->provider_reference);

        Http::assertSent(fn ($request) => str_contains($request->url(), 'africastalking.com'));
    }

    public function test_push_delivery_via_fcm(): void
    {
        Config::set('notifications.channels.push', true);
        Config::set('notifications.fcm.enabled', true);
        Config::set('notifications.fcm.project_id', 'test-project');
        Config::set('notifications.fcm.server_key', 'test-key');

        Http::fake([
            'https://fcm.googleapis.com/*' => Http::response(['name' => 'projects/test-project/messages/msg-1'], 200),
        ]);

        $user = $this->user('student');
        UserFcmToken::create([
            'user_id' => $user->id,
            'token' => 'device-token-1',
            'platform' => 'web',
        ]);

        $sent = $this->dispatch($user, 'system.notification', ['message' => 'System maintenance tonight.'], null, ['push']);

        $delivery = NotificationDelivery::where('notification_id', $sent[0]->id)
            ->where('channel', 'push')
            ->first();

        $this->assertNotNull($delivery);
        $this->assertSame('delivered', $delivery->status);
        $this->assertSame('projects/test-project/messages/msg-1', $delivery->provider_reference);
    }

    public function test_failed_delivery_is_marked_failed_after_max_attempts(): void
    {
        Config::set('notifications.retry.max_attempts', 1);
        Config::set('notifications.channels.sms', true);
        Config::set('notifications.default_preferences.sms', true);
        Config::set('notifications.africastalking.api_key', 'test-key');

        Http::fake([
            'https://api.africastalking.com/*' => Http::response([
                'SMSMessageData' => [
                    'Recipients' => [
                        ['messageId' => null, 'status' => 'Rejected', 'statusCode' => 500, 'description' => 'Internal Server Error'],
                    ],
                ],
            ], 500),
        ]);

        $user = $this->user('student', ['phone' => '+254700000000']);
        $sent = $this->dispatch($user, 'fee.reminder', ['amount' => '1000.00', 'due_date' => 'Aug 30, 2026']);

        $delivery = NotificationDelivery::where('notification_id', $sent[0]->id)
            ->where('channel', 'sms')
            ->first();

        $this->assertNotNull($delivery);
        $this->assertSame('failed', $delivery->status);
        $this->assertSame(1, $delivery->retry_count);
        $this->assertNotNull($delivery->failed_at);
        $this->assertNotNull($delivery->error_message);
    }

    public function test_student_cannot_manage_templates(): void
    {
        $student = $this->user('student');
        Sanctum::actingAs($student);

        $this->postJson('/api/admin/notification-templates', [
            'event' => 'custom.event',
            'name' => 'Custom',
            'category' => 'system',
            'body' => 'Hello',
        ])->assertForbidden();
    }

    public function test_admin_can_manage_templates(): void
    {
        $admin = $this->user('admin');
        Sanctum::actingAs($admin);

        $created = $this->postJson('/api/admin/notification-templates', [
            'event' => 'custom.event',
            'name' => 'Custom Event',
            'category' => 'system',
            'subject' => 'Hi {{user_name}}',
            'body' => 'Hello {{user_name}}, this is a test.',
            'channels' => ['in_app', 'email'],
        ])->assertCreated();

        $id = $created->json('data.id');
        $this->assertNotNull($id);

        $this->putJson('/api/admin/notification-templates/' . $id, [
            'body' => 'Updated body',
        ])->assertOk()
            ->assertJsonPath('data.body', 'Updated body');

        $this->deleteJson('/api/admin/notification-templates/' . $id)->assertOk();
        $this->assertDatabaseMissing('notification_templates', ['id' => $id]);
    }

    public function test_admin_can_broadcast_to_role(): void
    {
        $students = User::factory()->count(3)->create();
        foreach ($students as $s) {
            $s->assignRole('student');
        }

        $admin = $this->user('admin');
        Sanctum::actingAs($admin);

        $this->postJson('/api/admin/notifications/send', [
            'event' => 'system.notification',
            'recipient_type' => 'role',
            'role' => 'student',
            'data' => ['message' => 'Maintenance tonight'],
        ])
            ->assertOk()
            ->assertJsonPath('data.notifications_created', 3);

        $this->assertSame(3, Notification::where('category', 'system')->count());
    }

    public function test_admin_can_retry_failed_delivery(): void
    {
        Queue::fake();

        $admin = $this->user('admin');
        Sanctum::actingAs($admin);

        $user = $this->user('student');
        $sent = $this->dispatch($user, 'attendance.alert', ['student_name' => 'Jane', 'status' => 'Absent', 'date' => 'Aug 15, 2026']);

        $delivery = NotificationDelivery::where('notification_id', $sent[0]->id)->first();
        $delivery->markFailed('Simulated failure');

        $this->postJson('/api/admin/notifications/deliveries/' . $delivery->id . '/retry')
            ->assertOk()
            ->assertJsonPath('data.status', 'queued');

        Queue::assertPushed(\App\Jobs\SendChannelNotificationJob::class);
    }

    public function test_admin_deliveries_listing(): void
    {
        $admin = $this->user('admin');
        Sanctum::actingAs($admin);

        $user = $this->user('student');
        $this->dispatch($user, 'attendance.alert', ['student_name' => 'Jane', 'status' => 'Present', 'date' => 'Aug 15, 2026']);

        $this->getJson('/api/admin/notifications/summary')
            ->assertOk()
            ->assertJsonStructure([
                'data' => ['notifications_total', 'deliveries'],
            ]);

        $this->getJson('/api/admin/notifications/deliveries')
            ->assertOk()
            ->assertJsonPath('data.0.channel', 'email')
            ->assertJsonPath('data.0.status', 'delivered');
    }

    public function test_fcm_token_registration_and_revocation(): void
    {
        $user = $this->user('student');
        Sanctum::actingAs($user);

        $this->postJson('/api/fcm-tokens', [
            'token' => 'device-abc-123',
            'platform' => 'android',
            'device_name' => 'Pixel',
        ])->assertCreated();

        $this->assertDatabaseHas('user_fcm_tokens', [
            'user_id' => $user->id,
            'token' => 'device-abc-123',
        ]);

        $token = UserFcmToken::where('token', 'device-abc-123')->first();

        $this->getJson('/api/fcm-tokens')
            ->assertOk()
            ->assertJsonPath('data.0.id', $token->id);

        $this->deleteJson('/api/fcm-tokens/' . $token->id)->assertOk();
        $this->assertNotNull($token->fresh()->revoked_at);
    }

    public function test_template_rendering_replaces_placeholders(): void
    {
        $template = NotificationTemplate::where('event', 'exam.scheduled')->firstOrFail();

        $rendered = app(\App\Services\Notifications\NotificationTemplateService::class)->render($template, [
            'exam_title' => 'Mathematics Midterm',
            'exam_date' => 'Aug 20, 2026',
            'exam_time' => '9:00 AM',
        ]);

        $this->assertStringContainsString('Mathematics Midterm', $rendered['subject']);
        $this->assertStringContainsString('Aug 20, 2026', $rendered['body']);
        $this->assertStringNotContainsString('{{exam_title}}', $rendered['body']);
    }

    public function test_dispatch_with_invalid_event_is_silent(): void
    {
        $user = $this->user('student');

        $result = $this->dispatch($user, 'unknown.event', ['foo' => 'bar']);

        $this->assertSame([], $result);
        $this->assertDatabaseMissing('notifications', ['type' => 'unknown.event']);
    }
}
