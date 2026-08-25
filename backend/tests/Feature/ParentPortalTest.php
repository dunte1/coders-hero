<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Conversation;
use App\Models\Fee;
use App\Models\Message;
use App\Models\Notification;
use App\Models\ReportCard;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ParentPortalTest extends TestCase
{
    use RefreshDatabase;

    protected User $parent;

    protected User $teacher;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DatabaseSeeder::class);

        $this->parent = User::where('email', 'parent@codershero.com')->firstOrFail();
        $this->teacher = User::role('instructor')->firstOrFail();
        $this->admin = User::where('email', 'admin@codershero.com')->firstOrFail();
    }

    private function actingAsParent(): void
    {
        Sanctum::actingAs($this->parent, ['*']);
    }

    private function actingAsAdmin(): void
    {
        Sanctum::actingAs($this->admin, ['*']);
    }

    private function makeStudent(array $overrides = []): Student
    {
        return Student::create(array_merge([
            'student_id' => 'STU' . strtoupper(Str::random(6)),
            'first_name' => 'Stray',
            'last_name' => 'Child',
            'status' => 'active',
            'qr_code' => 'CH|TEST|' . Str::uuid(),
        ], $overrides));
    }

    public function test_portal_endpoints_require_authentication(): void
    {
        $uris = [
            '/api/parent/summary',
            '/api/parent/children',
            '/api/parent/teachers',
            '/api/parent/attendance?month=2026-08',
            '/api/parent/report-cards',
            '/api/parent/progress',
            '/api/parent/fees',
            '/api/parent/appointments',
            '/api/parent/notifications',
            '/api/chat',
        ];

        foreach ($uris as $uri) {
            $this->getJson($uri)->assertStatus(401);
        }
    }

    public function test_parent_can_view_summary_children_and_teachers(): void
    {
        $this->actingAsParent();

        $this->getJson('/api/parent/summary')
            ->assertOk()
            ->assertJsonStructure(['data' => ['guardian', 'students']]);

        $this->getJson('/api/parent/children')
            ->assertOk()
            ->assertJsonStructure(['data' => [['id', 'student_id', 'full_name', 'grade']]]);

        $this->getJson('/api/parent/teachers')
            ->assertOk()
            ->assertJsonStructure(['data' => [['id', 'name']]]);
    }

    public function test_parent_attendance_returns_monthly_children_summaries(): void
    {
        $this->actingAsParent();

        $this->getJson('/api/parent/attendance?month=2026-08')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'month',
                    'children' => [
                        ['student', 'summary' => ['present', 'late', 'absent', 'excused', 'total'], 'records'],
                    ],
                ],
            ]);
    }

    public function test_parent_can_view_report_cards_with_items(): void
    {
        $this->actingAsParent();

        $this->getJson('/api/parent/report-cards')
            ->assertOk()
            ->assertJsonStructure(['data' => [['id', 'term', 'academic_year', 'student', 'items']]]);

        $reportCard = ReportCard::first();

        $this->getJson("/api/parent/report-cards/{$reportCard->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $reportCard->id);
    }

    public function test_parent_cannot_view_another_students_report_card(): void
    {
        $this->actingAsParent();

        $other = $this->makeStudent();
        $reportCard = ReportCard::create([
            'student_id' => $other->id,
            'term' => 'Term 1',
            'academic_year' => '2025/2026',
            'issued_at' => '2026-02-27',
        ]);

        $this->getJson("/api/parent/report-cards/{$reportCard->id}")->assertStatus(404);
    }

    public function test_parent_can_view_grouped_coding_progress(): void
    {
        $this->actingAsParent();

        $this->getJson('/api/parent/progress')
            ->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_parent_can_list_fees_and_pay_a_pending_fee(): void
    {
        $this->actingAsParent();

        $this->getJson('/api/parent/fees')
            ->assertOk()
            ->assertJsonStructure(['data' => [['id', 'label', 'amount', 'status', 'student']]]);

        $fee = Fee::where('status', 'pending')->firstOrFail();

        $response = $this->postJson("/api/parent/fees/{$fee->id}/pay", [
            'method' => 'card',
            'reference' => 'TESTREF001',
        ])
            ->assertCreated()
            ->assertJsonStructure(['data' => ['id', 'receipt_no', 'method', 'fee']]);

        $this->assertDatabaseHas('payments', ['id' => $response->json('data.id'), 'fee_id' => $fee->id]);
        $this->assertSame('paid', $fee->fresh()->status);

        $this->getJson("/api/parent/payments/{$response->json('data.id')}")->assertOk();
    }

    public function test_parent_can_only_pay_their_own_fees(): void
    {
        $this->actingAsParent();

        $other = $this->makeStudent();
        $fee = Fee::create([
            'student_id' => $other->id,
            'label' => 'Tuition Fee',
            'amount' => 500,
            'due_date' => '2026-09-01',
            'status' => 'pending',
        ]);

        $this->postJson("/api/parent/fees/{$fee->id}/pay", ['method' => 'cash'])
            ->assertStatus(403);
    }

    public function test_parent_can_book_update_and_cancel_appointment(): void
    {
        $this->actingAsParent();

        $student = $this->parent->guardian->students()->first();

        $response = $this->postJson('/api/parent/appointments', [
            'student_id' => $student->id,
            'teacher_user_id' => $this->teacher->id,
            'scheduled_at' => now()->addDays(5)->format('Y-m-d H:i:s'),
            'duration_minutes' => 45,
            'reason' => 'Discuss progress',
            'notes' => 'Focus on Python.',
        ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending');

        $appointmentId = $response->json('data.id');

        $this->putJson("/api/parent/appointments/{$appointmentId}", ['status' => 'cancelled'])
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled');

        $this->deleteJson("/api/parent/appointments/{$appointmentId}")->assertOk();
        $this->assertDatabaseMissing('appointments', ['id' => $appointmentId]);
    }

    public function test_parent_appointments_require_future_scheduled_at(): void
    {
        $this->actingAsParent();

        $this->postJson('/api/parent/appointments', [
            'teacher_user_id' => $this->teacher->id,
            'scheduled_at' => now()->subDay()->format('Y-m-d H:i:s'),
            'reason' => 'Backdated',
        ])->assertStatus(422);
    }

    public function test_parent_notifications_can_be_read(): void
    {
        $this->actingAsParent();

        $notification = Notification::create([
            'type' => 'parent',
            'notifiable_type' => User::class,
            'notifiable_id' => $this->parent->id,
            'data' => ['title' => 'New report card', 'message' => 'Term 2 report card is ready.'],
            'read_at' => null,
        ]);

        $this->getJson('/api/parent/notifications?filter=unread')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->postJson("/api/parent/notifications/{$notification->id}/read")
            ->assertOk();

        $this->assertNotNull($notification->fresh()->read_at);

        $this->postJson('/api/parent/notifications/read-all')->assertOk();
    }

    public function test_parent_can_chat_with_teacher(): void
    {
        $this->actingAsParent();

        $conversation = Conversation::where('guardian_user_id', $this->parent->id)->firstOrFail();

        $this->getJson('/api/chat')
            ->assertOk()
            ->assertJsonStructure(['data' => [['id', 'unread_count', 'last_message']]]);

        $this->getJson("/api/chat/{$conversation->id}")
            ->assertOk()
            ->assertJsonStructure(['data' => ['conversation', 'messages']]);

        $response = $this->postJson("/api/chat/{$conversation->id}/messages", ['body' => 'Hello teacher!'])
            ->assertCreated()
            ->assertJsonPath('data.body', 'Hello teacher!');

        $this->assertDatabaseHas('messages', ['id' => $response->json('data.id')]);

        $this->postJson("/api/chat/{$conversation->id}/read")->assertOk();

        $unread = Message::where('conversation_id', $conversation->id)
            ->where('sender_user_id', '!=', $this->parent->id)
            ->whereNull('read_at')
            ->count();
        $this->assertSame(0, $unread);
    }

    public function test_parent_can_start_a_new_conversation(): void
    {
        $this->actingAsParent();

        $student = $this->parent->guardian->students()->first();

        $this->postJson('/api/chat', [
            'teacher_user_id' => $this->teacher->id,
            'student_id' => $student->id,
            'body' => 'Hi, may I ask about homework?',
        ])
            ->assertCreated()
            ->assertJsonPath('data.body', 'Hi, may I ask about homework?');
    }

    public function test_admin_can_manage_report_cards(): void
    {
        $this->actingAsAdmin();

        $student = Student::where('student_id', 'STU10001')->firstOrFail();

        $response = $this->postJson("/api/students/{$student->id}/report-cards", [
            'term' => 'Term 3',
            'academic_year' => '2025/2026',
            'issued_at' => '2026-08-01',
            'overall_grade' => 'A',
            'average_score' => 95,
            'teacher_notes' => 'Great term.',
            'items' => [
                ['subject' => 'Math', 'score' => 95, 'grade' => 'A', 'teacher_comment' => 'Excellent'],
                ['subject' => 'Coding', 'score' => 97, 'grade' => 'A+', 'teacher_comment' => 'Outstanding'],
            ],
        ])
            ->assertCreated()
            ->assertJsonCount(2, 'data.items');

        $reportCardId = $response->json('data.id');

        $this->putJson("/api/students/report-cards/{$reportCardId}", ['average_score' => 96])
            ->assertOk()
            ->assertJsonPath('data.average_score', '96.00');

        $this->deleteJson("/api/students/report-cards/{$reportCardId}")->assertOk();
        $this->assertDatabaseMissing('report_cards', ['id' => $reportCardId]);
    }

    public function test_admin_can_manage_coding_progress_and_fees(): void
    {
        $this->actingAsAdmin();

        $student = Student::where('student_id', 'STU10002')->firstOrFail();

        $progress = $this->postJson("/api/students/{$student->id}/coding-progress", [
            'skill' => 'AI Basics',
            'level' => 1,
            'progress' => 20,
            'notes' => 'Just started.',
        ])
            ->assertCreated()
            ->assertJsonPath('data.skill', 'AI Basics');

        $this->putJson("/api/students/coding-progress/{$progress->json('data.id')}", ['progress' => 40])
            ->assertOk()
            ->assertJsonPath('data.progress', 40);

        $fee = $this->postJson("/api/students/{$student->id}/fees", [
            'label' => 'Excursion Fee',
            'amount' => 60,
            'due_date' => '2026-10-01',
        ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending');

        $this->getJson("/api/students/{$student->id}/fees")->assertOk();

        $this->postJson("/api/students/fees/{$fee->json('data.id')}/payments", [
            'method' => 'bank_transfer',
            'amount' => 60,
            'reference' => 'BANK001',
        ])
            ->assertCreated();

        $this->assertSame('paid', Fee::find($fee->json('data.id'))->fresh()->status);

        $this->deleteJson("/api/students/coding-progress/{$progress->json('data.id')}")->assertOk();
    }

    public function test_admin_can_manage_appointments(): void
    {
        $this->actingAsAdmin();

        $appointment = Appointment::first();

        $this->getJson('/api/appointments')->assertOk();

        $this->putJson("/api/appointments/{$appointment->id}", ['status' => 'completed'])
            ->assertOk()
            ->assertJsonPath('data.status', 'completed');
    }

    public function test_student_cannot_access_parent_portal(): void
    {
        $studentUser = User::factory()->create()->assignRole('student');
        Sanctum::actingAs($studentUser, ['*']);

        $this->getJson('/api/parent/summary')->assertStatus(403);
        $this->getJson('/api/parent/fees')->assertStatus(403);
    }

    public function test_parent_can_make_partial_payment_on_fee(): void
    {
        $this->actingAsParent();

        $fee = Fee::where('status', 'pending')->firstOrFail();

        $response = $this->postJson("/api/parent/fees/{$fee->id}/pay", [
            'amount' => $fee->amount / 2,
            'method' => 'card',
            'reference' => 'PARTIAL001',
        ])
            ->assertCreated()
            ->assertJsonStructure(['data' => ['id', 'receipt_no', 'amount', 'method', 'fee']]);

        $this->assertEquals(number_format($fee->amount / 2, 2, '.', ''), $response->json('data.amount'));
        $this->assertSame('partial', $fee->fresh()->status);

        $paidTotal = \App\Models\Payment::where('fee_id', $fee->id)->sum('amount');
        $this->assertEquals(number_format($fee->amount / 2, 2, '.', ''), number_format((float) $paidTotal, 2, '.', ''));
    }

    public function test_second_partial_payment_completes_fee(): void
    {
        $this->actingAsParent();

        $fee = Fee::where('status', 'pending')->firstOrFail();
        $half = $fee->amount / 2;

        $this->postJson("/api/parent/fees/{$fee->id}/pay", [
            'amount' => $half,
            'method' => 'card',
        ])->assertCreated();

        $this->assertSame('partial', $fee->fresh()->status);

        $response = $this->postJson("/api/parent/fees/{$fee->id}/pay", [
            'amount' => $half,
            'method' => 'card',
        ])->assertCreated();

        $this->assertSame('paid', $fee->fresh()->status);
    }

    public function test_full_payment_without_amount_still_works(): void
    {
        $this->actingAsParent();

        $fee = Fee::where('status', 'pending')->firstOrFail();

        $response = $this->postJson("/api/parent/fees/{$fee->id}/pay", [
            'method' => 'bank_transfer',
            'reference' => 'FULLPAY001',
        ])
            ->assertCreated();

        $this->assertSame('paid', $fee->fresh()->status);
        $this->assertEquals(number_format($fee->amount, 2, '.', ''), $response->json('data.amount'));
    }

    public function test_partial_payment_rejects_amount_exceeding_balance(): void
    {
        $this->actingAsParent();

        $fee = Fee::where('status', 'pending')->firstOrFail();

        $this->postJson("/api/parent/fees/{$fee->id}/pay", [
            'amount' => $fee->amount + 1,
        ])->assertStatus(422);
    }

    public function test_partial_payment_rejects_zero_amount(): void
    {
        $this->actingAsParent();

        $fee = Fee::where('status', 'pending')->firstOrFail();

        $this->postJson("/api/parent/fees/{$fee->id}/pay", [
            'amount' => 0,
        ])->assertStatus(422);
    }

    public function test_cannot_pay_already_paid_fee(): void
    {
        $this->actingAsParent();

        $fee = Fee::where('status', 'pending')->firstOrFail();

        $this->postJson("/api/parent/fees/{$fee->id}/pay", ['method' => 'card'])->assertCreated();

        $this->postJson("/api/parent/fees/{$fee->id}/pay", ['method' => 'card'])
            ->assertStatus(422);
    }
}
