<?php

namespace Tests\Feature;

use App\Models\RoboticsEquipment;
use App\Models\RoboticsEquipmentAssignment;
use App\Models\RoboticsEquipmentReservation;
use App\Models\RoboticsMaintenanceRecord;
use App\Models\RoboticsProject;
use App\Models\RoboticsProjectSubmission;
use App\Models\RoboticsTeam;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RoboticsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);
        $this->seed(PermissionSeeder::class);
    }

    private function user(string $role = 'student'): User
    {
        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    private function studentUser(): User
    {
        $user = $this->user('student');

        Student::create([
            'student_id' => 'STU' . uniqid(),
            'user_id' => $user->id,
            'first_name' => 'Test',
            'last_name' => 'Student',
            'gender' => 'female',
            'status' => 'active',
        ]);

        return $user;
    }

    private function equipment(array $overrides = []): RoboticsEquipment
    {
        return RoboticsEquipment::create(array_merge([
            'name' => 'Arduino Uno',
            'type' => 'arduino_board',
            'sku' => 'A000066',
            'quantity_total' => 5,
            'quantity_available' => 5,
            'location' => 'Lab A',
            'condition' => 'good',
            'status' => 'active',
            'qr_code' => 'RBT-TEST' . uniqid(),
        ], $overrides));
    }

    private function team(User $owner, ?Student $leader = null): RoboticsTeam
    {
        $team = RoboticsTeam::create([
            'name' => 'Team ' . uniqid(),
            'status' => 'active',
        ]);

        $member = $leader ?? Student::where('user_id', $owner->id)->first()
            ?? Student::create([
                'student_id' => 'STU' . uniqid(),
                'user_id' => $owner->id,
                'first_name' => 'Owner',
                'last_name' => 'Student',
                'status' => 'active',
            ]);

        $team->members()->attach($member->id, ['role' => 'leader']);

        return $team;
    }

    public function test_robotics_endpoints_require_authentication(): void
    {
        $this->getJson('/api/robotics/equipment')->assertStatus(401);
        $this->getJson('/api/robotics/teams')->assertStatus(401);
        $this->getJson('/api/robotics/projects')->assertStatus(401);
        $this->getJson('/api/robotics/summary')->assertStatus(401);
        $this->postJson('/api/robotics/equipment', [])->assertStatus(401);
        $this->postJson('/api/robotics/reservations', [])->assertStatus(401);
    }

    public function test_student_can_view_equipment_inventory(): void
    {
        $this->equipment(['name' => 'Arduino Mega']);
        $this->equipment(['name' => 'Servo Motor', 'type' => 'component']);

        Sanctum::actingAs($this->user('student'), ['*']);

        $this->getJson('/api/robotics/equipment')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_only_staff_can_create_equipment(): void
    {
        Sanctum::actingAs($this->user('student'), ['*']);

        $this->postJson('/api/robotics/equipment', [
            'name' => 'Raspberry Pi',
            'type' => 'microcontroller',
            'quantity_total' => 3,
        ])->assertStatus(403);
    }

    public function test_staff_can_create_equipment_and_scan_by_qr_code(): void
    {
        $admin = $this->user('admin');
        Sanctum::actingAs($admin, ['*']);

        $response = $this->postJson('/api/robotics/equipment', [
            'name' => 'Ultrasonic Sensor',
            'type' => 'sensor',
            'sku' => 'HC-SR04',
            'manufacturer' => 'Generic',
            'quantity_total' => 12,
            'location' => 'Bin 1',
            'condition' => 'new',
        ])->assertCreated()
            ->assertJsonPath('data.quantity_available', 12);

        $qrCode = $response->json('data.qr_code');

        $this->assertNotEmpty($qrCode);

        Sanctum::actingAs($this->user('student'), ['*']);

        $this->getJson("/api/robotics/equipment/scan/{$qrCode}")
            ->assertOk()
            ->assertJsonPath('data.name', 'Ultrasonic Sensor')
            ->assertJsonPath('data.type', 'sensor');
    }

    public function test_scan_with_unknown_qr_code_returns_404(): void
    {
        Sanctum::actingAs($this->user('student'), ['*']);

        $this->getJson('/api/robotics/equipment/scan/RBT-NOTREAL')
            ->assertStatus(404);
    }

    public function test_assigning_equipment_decrements_availability_and_return_restores_it(): void
    {
        $admin = $this->user('admin');
        Sanctum::actingAs($admin, ['*']);

        $equipment = $this->equipment(['quantity_total' => 5, 'quantity_available' => 5]);
        $student = Student::where('user_id', $this->studentUser()->id)->first();

        $response = $this->postJson("/api/robotics/equipment/{$equipment->id}/assign", [
            'assignable_type' => 'student',
            'assignable_id' => $student->id,
            'quantity' => 2,
            'expected_return_at' => now()->addWeek()->toDateString(),
        ])->assertCreated();

        $assignmentId = $response->json('data.id');

        $this->assertDatabaseHas('robotics_equipment_assignments', ['id' => $assignmentId]);
        $this->assertDatabaseHas('robotics_equipment', [
            'id' => $equipment->id,
            'quantity_available' => 3,
        ]);

        $this->putJson("/api/robotics/assignments/{$assignmentId}/return")
            ->assertOk();

        $this->assertDatabaseHas('robotics_equipment_assignments', [
            'id' => $assignmentId,
        ]);
        $this->assertNotNull(RoboticsEquipmentAssignment::find($assignmentId)->returned_at);

        $this->assertDatabaseHas('robotics_equipment', [
            'id' => $equipment->id,
            'quantity_available' => 5,
        ]);
    }

    public function test_cannot_assign_more_than_available(): void
    {
        $admin = $this->user('admin');
        Sanctum::actingAs($admin, ['*']);

        $equipment = $this->equipment(['quantity_total' => 1, 'quantity_available' => 1]);
        $student = Student::where('user_id', $this->studentUser()->id)->first();

        $this->postJson("/api/robotics/equipment/{$equipment->id}/assign", [
            'assignable_type' => 'student',
            'assignable_id' => $student->id,
            'quantity' => 5,
        ])->assertStatus(422);
    }

    public function test_student_cannot_assign_equipment(): void
    {
        Sanctum::actingAs($this->user('student'), ['*']);

        $equipment = $this->equipment();
        $student = Student::where('user_id', $this->studentUser()->id)->first();

        $this->postJson("/api/robotics/equipment/{$equipment->id}/assign", [
            'assignable_type' => 'student',
            'assignable_id' => $student->id,
            'quantity' => 1,
        ])->assertStatus(403);
    }

    public function test_student_can_create_and_cancel_reservation(): void
    {
        $user = $this->studentUser();
        Sanctum::actingAs($user, ['*']);

        $equipment = $this->equipment(['quantity_total' => 4, 'quantity_available' => 4]);

        $response = $this->postJson('/api/robotics/reservations', [
            'equipment_id' => $equipment->id,
            'quantity' => 1,
            'start_at' => now()->addDay()->toDateTimeString(),
            'end_at' => now()->addDays(2)->toDateTimeString(),
            'purpose' => 'Building a sumobot',
        ])->assertCreated()
            ->assertJsonPath('data.status', 'pending');

        $reservationId = $response->json('data.id');

        $this->putJson("/api/robotics/reservations/{$reservationId}/cancel")
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled');
    }

    public function test_staff_can_approve_reservation(): void
    {
        $user = $this->studentUser();
        Sanctum::actingAs($user, ['*']);

        $equipment = $this->equipment();

        $response = $this->postJson('/api/robotics/reservations', [
            'equipment_id' => $equipment->id,
            'quantity' => 1,
            'start_at' => now()->addDay()->toDateTimeString(),
            'end_at' => now()->addDays(2)->toDateTimeString(),
        ])->assertCreated();

        $reservationId = $response->json('data.id');

        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->putJson("/api/robotics/reservations/{$reservationId}/approve")
            ->assertOk()
            ->assertJsonPath('data.status', 'approved');

        $this->getJson('/api/robotics/reservations')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_student_cannot_approve_reservations(): void
    {
        $user = $this->studentUser();
        Sanctum::actingAs($user, ['*']);

        $equipment = $this->equipment();

        $response = $this->postJson('/api/robotics/reservations', [
            'equipment_id' => $equipment->id,
            'quantity' => 1,
            'start_at' => now()->addDay()->toDateTimeString(),
            'end_at' => now()->addDays(2)->toDateTimeString(),
        ])->assertCreated();

        $reservationId = $response->json('data.id');

        $this->putJson("/api/robotics/reservations/{$reservationId}/approve")
            ->assertStatus(403);
    }

    public function test_staff_can_record_and_resolve_maintenance(): void
    {
        $admin = $this->user('admin');
        Sanctum::actingAs($admin, ['*']);

        $equipment = $this->equipment();

        $response = $this->postJson('/api/robotics/maintenance', [
            'equipment_id' => $equipment->id,
            'type' => 'repair',
            'issue_description' => 'Broken servo mount',
            'status' => 'reported',
        ])->assertCreated()
            ->assertJsonPath('data.status', 'reported');

        $recordId = $response->json('data.id');

        $this->putJson("/api/robotics/maintenance/{$recordId}/resolve", [
            'resolution' => 'Replaced the mount bracket.',
            'cost' => 15.5,
        ])->assertOk()
            ->assertJsonPath('data.status', 'resolved')
            ->assertJsonPath('data.cost', '15.50');

        $this->getJson('/api/robotics/maintenance')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_staff_can_create_team_and_manage_members(): void
    {
        $admin = $this->user('admin');
        Sanctum::actingAs($admin, ['*']);

        $response = $this->postJson('/api/robotics/teams', [
            'name' => 'RoboWarriors',
            'description' => 'Competition team',
        ])->assertCreated()
            ->assertJsonPath('data.name', 'RoboWarriors');

        $teamId = $response->json('data.id');

        $student = Student::where('user_id', $this->studentUser()->id)->first();

        $this->postJson("/api/robotics/teams/{$teamId}/members", [
            'student_id' => $student->id,
            'role' => 'leader',
        ])->assertOk()
            ->assertJsonCount(1, 'data.members');

        $this->deleteJson("/api/robotics/teams/{$teamId}/members/{$student->id}")
            ->assertOk()
            ->assertJsonCount(0, 'data.members');
    }

    public function test_student_can_create_project_for_own_team(): void
    {
        $user = $this->studentUser();
        Sanctum::actingAs($user, ['*']);

        $team = $this->team($user);

        $this->postJson('/api/robotics/projects', [
            'team_id' => $team->id,
            'title' => 'Line Follower',
            'category' => 'competition',
            'description' => 'Robot that follows a black line.',
        ])->assertCreated()
            ->assertJsonPath('data.title', 'Line Follower')
            ->assertJsonPath('data.team_id', $team->id);
    }

    public function test_student_cannot_create_project_for_another_team(): void
    {
        $user = $this->studentUser();
        Sanctum::actingAs($user, ['*']);

        $otherOwner = $this->studentUser();
        $otherTeam = $this->team($otherOwner);

        $this->postJson('/api/robotics/projects', [
            'team_id' => $otherTeam->id,
            'title' => 'Sneaky Project',
            'category' => 'class',
        ])->assertStatus(403);
    }

    public function test_student_can_submit_project_and_staff_can_review(): void
    {
        $user = $this->studentUser();
        Sanctum::actingAs($user, ['*']);

        $team = $this->team($user);

        $projectResponse = $this->postJson('/api/robotics/projects', [
            'team_id' => $team->id,
            'title' => 'Sumobot',
            'category' => 'competition',
        ])->assertCreated();

        $projectId = $projectResponse->json('data.id');

        $submissionResponse = $this->postJson("/api/robotics/projects/{$projectId}/submit", [
            'title' => 'Final Build',
            'description' => 'Ready for competition.',
            'repo_url' => 'https://github.com/example/sumobot',
        ])->assertCreated()
            ->assertJsonPath('data.status', 'submitted');

        $submissionId = $submissionResponse->json('data.id');

        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->getJson("/api/robotics/projects/{$projectId}/submissions")
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->putJson("/api/robotics/projects/{$projectId}/submissions/{$submissionId}/review", [
            'status' => 'approved',
            'score' => 92,
            'feedback' => 'Excellent work!',
        ])->assertOk()
            ->assertJsonPath('data.status', 'approved')
            ->assertJsonPath('data.score', 92);

        $this->assertDatabaseHas('robotics_projects', [
            'id' => $projectId,
            'status' => 'completed',
        ]);
    }

    public function test_student_cannot_review_submissions(): void
    {
        $user = $this->studentUser();
        Sanctum::actingAs($user, ['*']);

        $team = $this->team($user);

        $project = RoboticsProject::create([
            'team_id' => $team->id,
            'title' => 'Maze Solver',
            'category' => 'class',
            'status' => 'in_progress',
        ]);

        $submission = RoboticsProjectSubmission::create([
            'project_id' => $project->id,
            'submitted_by_user_id' => $user->id,
            'title' => 'V1',
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        $this->putJson("/api/robotics/projects/{$project->id}/submissions/{$submission->id}/review", [
            'status' => 'approved',
            'score' => 100,
        ])->assertStatus(403);
    }

    public function test_student_cannot_view_another_teams_project(): void
    {
        $user = $this->studentUser();
        Sanctum::actingAs($user, ['*']);

        $otherOwner = $this->studentUser();
        $otherTeam = $this->team($otherOwner);

        $project = RoboticsProject::create([
            'team_id' => $otherTeam->id,
            'title' => 'Secret Project',
            'category' => 'class',
        ]);

        $this->getJson("/api/robotics/projects/{$project->id}")
            ->assertStatus(403);
    }

    public function test_student_sees_only_own_projects_in_list(): void
    {
        $user = $this->studentUser();
        Sanctum::actingAs($user, ['*']);

        $team = $this->team($user);

        RoboticsProject::create([
            'team_id' => $team->id,
            'title' => 'My Project',
            'category' => 'class',
        ]);

        $otherOwner = $this->studentUser();
        $otherTeam = $this->team($otherOwner);

        RoboticsProject::create([
            'team_id' => $otherTeam->id,
            'title' => 'Their Project',
            'category' => 'class',
        ]);

        $this->getJson('/api/robotics/projects')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'My Project');
    }

    public function test_summary_returns_counts(): void
    {
        $this->equipment(['type' => 'arduino_board']);
        $this->equipment(['type' => 'sensor']);

        Sanctum::actingAs($this->user('student'), ['*']);

        $this->getJson('/api/robotics/summary')
            ->assertOk()
            ->assertJsonPath('data.total_equipment', 2)
            ->assertJsonCount(2, 'data.by_type');
    }
}
