<?php

namespace Tests\Feature;

use App\Models\Competition;
use App\Models\CompetitionCriterion;
use App\Models\CompetitionScore;
use App\Models\CompetitionTeam;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\PermissionSeeder;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CompetitionTest extends TestCase
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

    private function competition(array $overrides = []): Competition
    {
        return Competition::create(array_merge([
            'name' => 'Hackathon ' . uniqid(),
            'slug' => 'hackathon-' . uniqid(),
            'type' => 'hackathon',
            'status' => 'registration_open',
            'registration_deadline' => now()->addWeek(),
            'min_team_size' => 1,
            'max_team_size' => 5,
        ], $overrides));
    }

    private function criterion(Competition $competition, array $overrides = []): CompetitionCriterion
    {
        return CompetitionCriterion::create(array_merge([
            'competition_id' => $competition->id,
            'name' => 'Criterion ' . uniqid(),
            'max_score' => 20,
            'weight' => 1,
        ], $overrides));
    }

    private function team(Competition $competition, User $leader, array $overrides = []): CompetitionTeam
    {
        $student = Student::where('user_id', $leader->id)->firstOrFail();

        $team = CompetitionTeam::create(array_merge([
            'competition_id' => $competition->id,
            'name' => 'Team ' . uniqid(),
            'status' => 'registered',
            'leader_student_id' => $student->id,
        ], $overrides));

        $team->members()->attach($student->id, ['role' => 'leader']);

        return $team;
    }

    public function test_competition_endpoints_require_authentication(): void
    {
        $this->getJson('/api/competitions')->assertStatus(401);
        $this->getJson('/api/competitions/1')->assertStatus(401);
        $this->getJson('/api/competitions/1/leaderboard')->assertStatus(401);
        $this->getJson('/api/competitions/teams/mine')->assertStatus(401);
        $this->postJson('/api/competitions', [])->assertStatus(401);
        $this->postJson('/api/competitions/1/register', [])->assertStatus(401);
        $this->postJson('/api/competitions/1/scores', [])->assertStatus(401);
        $this->getJson('/api/competitions/students')->assertStatus(401);
    }

    public function test_authenticated_user_can_search_students(): void
    {
        Sanctum::actingAs($this->user('student'), ['*']);

        $this->studentUser();

        $response = $this->getJson('/api/competitions/students?search=STU');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.student_id', fn (string $v) => str_starts_with($v, 'STU'))
            ->assertJsonPath('data.0.full_name', 'Test Student');
    }

    public function test_staff_can_create_competition(): void
    {
        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->postJson('/api/competitions', [
            'name' => 'AI Challenge',
            'type' => 'ai_challenge',
            'max_team_size' => 4,
        ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'AI Challenge')
            ->assertJsonPath('data.status', 'draft');

        $this->assertDatabaseHas('competitions', ['name' => 'AI Challenge']);
    }

    public function test_student_cannot_create_competition(): void
    {
        Sanctum::actingAs($this->user('student'), ['*']);

        $this->postJson('/api/competitions', [
            'name' => 'Nope',
            'type' => 'hackathon',
        ])->assertStatus(403);
    }

    public function test_staff_can_update_competition(): void
    {
        $competition = $this->competition();

        Sanctum::actingAs($this->user('teacher'), ['*']);

        $this->putJson('/api/competitions/' . $competition->id, ['name' => 'Updated Name'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Updated Name');
    }

    public function test_staff_can_delete_competition(): void
    {
        $competition = $this->competition();

        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->deleteJson('/api/competitions/' . $competition->id)->assertOk();
        $this->assertSoftDeleted('competitions', ['id' => $competition->id]);
    }

    public function test_completed_competition_cannot_be_deleted(): void
    {
        $competition = $this->competition(['status' => 'completed']);

        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->deleteJson('/api/competitions/' . $competition->id)->assertStatus(422);
    }

    public function test_competition_status_transitions_are_enforced(): void
    {
        $competition = $this->competition(['status' => 'draft']);

        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->putJson('/api/competitions/' . $competition->id . '/status', ['status' => 'registration_open'])
            ->assertOk();

        $this->putJson('/api/competitions/' . $competition->id . '/status', ['status' => 'completed'])
            ->assertStatus(422);
    }

    public function test_staff_can_add_criteria_and_judges(): void
    {
        $competition = $this->competition();
        $judge = $this->user('judge');

        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->postJson('/api/competitions/' . $competition->id . '/criteria', [
            'name' => 'Originality',
            'max_score' => 25,
            'weight' => 2,
        ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Originality');

        $this->postJson('/api/competitions/' . $competition->id . '/judges', [
            'user_id' => $judge->id,
            'title' => 'Lead Judge',
        ])
            ->assertOk();

        $this->assertDatabaseHas('competition_judges', ['user_id' => $judge->id]);
    }

    public function test_criterion_with_scores_cannot_be_deleted(): void
    {
        $competition = $this->competition(['status' => 'ongoing']);
        $criterion = $this->criterion($competition);
        $judge = $this->user('judge');
        $leader = $this->studentUser();
        $team = $this->team($competition, $leader);

        $competition->judges()->attach($judge->id);
        CompetitionScore::create([
            'competition_id' => $competition->id,
            'competition_team_id' => $team->id,
            'criterion_id' => $criterion->id,
            'judge_user_id' => $judge->id,
            'score' => 10,
            'submitted_at' => now(),
        ]);

        Sanctum::actingAs($this->user('admin'), ['*']);

        $this->deleteJson('/api/competitions/criteria/' . $criterion->id)->assertStatus(422);
    }

    public function test_student_sees_only_published_competitions(): void
    {
        $this->competition(['status' => 'draft', 'name' => 'Hidden Draft']);
        $this->competition(['status' => 'registration_open', 'name' => 'Visible Open']);

        Sanctum::actingAs($this->user('student'), ['*']);

        $this->getJson('/api/competitions')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Visible Open');
    }

    public function test_student_cannot_access_draft_competition(): void
    {
        $competition = $this->competition(['status' => 'draft']);

        Sanctum::actingAs($this->user('student'), ['*']);

        $this->getJson('/api/competitions/' . $competition->id)->assertStatus(403);
    }

    public function test_judge_sees_only_assigned_competitions(): void
    {
        $assigned = $this->competition();
        $unassigned = $this->competition();
        $judge = $this->user('judge');
        $assigned->judges()->attach($judge->id);

        Sanctum::actingAs($judge, ['*']);

        $this->getJson('/api/competitions')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $assigned->id);

        $this->getJson('/api/competitions/' . $unassigned->id)->assertStatus(403);
    }

    public function test_student_can_register_a_team(): void
    {
        $competition = $this->competition();
        $student = $this->studentUser();

        Sanctum::actingAs($student, ['*']);

        $this->postJson('/api/competitions/' . $competition->id . '/register', [
            'name' => 'CodeBusters',
        ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'registered');

        $this->assertDatabaseHas('competition_teams', [
            'competition_id' => $competition->id,
            'name' => 'CodeBusters',
        ]);
    }

    public function test_student_cannot_register_twice(): void
    {
        $competition = $this->competition();
        $student = $this->studentUser();

        $this->team($competition, $student);

        Sanctum::actingAs($student, ['*']);

        $this->postJson('/api/competitions/' . $competition->id . '/register', ['name' => 'Again'])
            ->assertStatus(422);
    }

    public function test_registration_rejected_after_deadline(): void
    {
        $competition = $this->competition(['registration_deadline' => now()->subDay()]);
        $student = $this->studentUser();

        Sanctum::actingAs($student, ['*']);

        $this->postJson('/api/competitions/' . $competition->id . '/register', ['name' => 'Late Team'])
            ->assertStatus(422);
    }

    public function test_team_leader_can_add_member(): void
    {
        $competition = $this->competition();
        $leader = $this->studentUser();
        $team = $this->team($competition, $leader);
        $member = $this->studentUser();

        Sanctum::actingAs($leader, ['*']);

        $this->postJson('/api/competitions/teams/' . $team->id . '/members', [
            'student_id' => Student::where('user_id', $member->id)->firstOrFail()->id,
        ])
            ->assertOk();

        $this->assertDatabaseHas('competition_team_members', ['competition_team_id' => $team->id]);
    }

    public function test_only_leader_can_modify_team(): void
    {
        $competition = $this->competition();
        $leader = $this->studentUser();
        $team = $this->team($competition, $leader);
        $outsider = $this->studentUser();

        Sanctum::actingAs($outsider, ['*']);

        $this->postJson('/api/competitions/teams/' . $team->id . '/submit', [
            'submission_url' => 'https://example.com/project',
        ])->assertStatus(403);
    }

    public function test_team_leader_can_submit_project(): void
    {
        $competition = $this->competition();
        $leader = $this->studentUser();
        $team = $this->team($competition, $leader);

        Sanctum::actingAs($leader, ['*']);

        $this->postJson('/api/competitions/teams/' . $team->id . '/submit', [
            'submission_url' => 'https://example.com/project',
            'project_title' => 'Smart Campus',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'submitted')
            ->assertJsonPath('data.project_title', 'Smart Campus');
    }

    public function test_staff_can_disqualify_team(): void
    {
        $competition = $this->competition();
        $leader = $this->studentUser();
        $team = $this->team($competition, $leader);

        Sanctum::actingAs($this->user('teacher'), ['*']);

        $this->putJson('/api/competitions/teams/' . $team->id . '/disqualify', ['disqualified' => true])
            ->assertOk()
            ->assertJsonPath('data.status', 'disqualified');
    }

    public function test_assigned_judge_can_submit_scores(): void
    {
        $competition = $this->competition(['status' => 'ongoing']);
        $criterion = $this->criterion($competition, ['max_score' => 20]);
        $leader = $this->studentUser();
        $team = $this->team($competition, $leader);
        $judge = $this->user('judge');
        $competition->judges()->attach($judge->id);

        Sanctum::actingAs($judge, ['*']);

        $this->postJson('/api/competitions/' . $competition->id . '/scores', [
            'team_id' => $team->id,
            'scores' => [
                ['criterion_id' => $criterion->id, 'score' => 18, 'remarks' => 'Great work'],
            ],
        ])
            ->assertOk();

        $this->assertDatabaseHas('competition_scores', [
            'competition_team_id' => $team->id,
            'criterion_id' => $criterion->id,
            'judge_user_id' => $judge->id,
            'score' => 18,
        ]);
    }

    public function test_unassigned_judge_cannot_submit_scores(): void
    {
        $competition = $this->competition(['status' => 'ongoing']);
        $criterion = $this->criterion($competition);
        $leader = $this->studentUser();
        $team = $this->team($competition, $leader);
        $judge = $this->user('judge');

        Sanctum::actingAs($judge, ['*']);

        $this->postJson('/api/competitions/' . $competition->id . '/scores', [
            'team_id' => $team->id,
            'scores' => [
                ['criterion_id' => $criterion->id, 'score' => 10],
            ],
        ])->assertStatus(403);
    }

    public function test_score_exceeding_max_is_rejected(): void
    {
        $competition = $this->competition(['status' => 'ongoing']);
        $criterion = $this->criterion($competition, ['max_score' => 20]);
        $leader = $this->studentUser();
        $team = $this->team($competition, $leader);
        $judge = $this->user('judge');
        $competition->judges()->attach($judge->id);

        Sanctum::actingAs($judge, ['*']);

        $this->postJson('/api/competitions/' . $competition->id . '/scores', [
            'team_id' => $team->id,
            'scores' => [
                ['criterion_id' => $criterion->id, 'score' => 25],
            ],
        ])->assertStatus(422);
    }

    public function test_staff_can_verify_score(): void
    {
        $competition = $this->competition(['status' => 'ongoing']);
        $criterion = $this->criterion($competition);
        $leader = $this->studentUser();
        $team = $this->team($competition, $leader);
        $judge = $this->user('judge');
        $competition->judges()->attach($judge->id);

        $score = CompetitionScore::create([
            'competition_id' => $competition->id,
            'competition_team_id' => $team->id,
            'criterion_id' => $criterion->id,
            'judge_user_id' => $judge->id,
            'score' => 15,
            'submitted_at' => now(),
        ]);

        $verifier = $this->user('teacher');

        Sanctum::actingAs($verifier, ['*']);

        $this->putJson('/api/competitions/scores/' . $score->id . '/verify')
            ->assertOk()
            ->assertJsonPath('data.verified_by_user_id', $verifier->id);
    }

    public function test_leaderboard_uses_weighted_averages_and_ranks(): void
    {
        $competition = $this->competition(['status' => 'ongoing']);
        $critA = $this->criterion($competition, ['max_score' => 20, 'weight' => 2, 'sort_order' => 1]);
        $critB = $this->criterion($competition, ['max_score' => 10, 'weight' => 1, 'sort_order' => 2]);
        $judge = $this->user('judge');
        $competition->judges()->attach($judge->id);

        $team1 = $this->team($competition, $this->studentUser());
        $team2 = $this->team($competition, $this->studentUser());

        CompetitionScore::create([
            'competition_id' => $competition->id, 'competition_team_id' => $team1->id,
            'criterion_id' => $critA->id, 'judge_user_id' => $judge->id, 'score' => 20, 'submitted_at' => now(),
        ]);
        CompetitionScore::create([
            'competition_id' => $competition->id, 'competition_team_id' => $team1->id,
            'criterion_id' => $critB->id, 'judge_user_id' => $judge->id, 'score' => 5, 'submitted_at' => now(),
        ]);
        CompetitionScore::create([
            'competition_id' => $competition->id, 'competition_team_id' => $team2->id,
            'criterion_id' => $critA->id, 'judge_user_id' => $judge->id, 'score' => 10, 'submitted_at' => now(),
        ]);
        CompetitionScore::create([
            'competition_id' => $competition->id, 'competition_team_id' => $team2->id,
            'criterion_id' => $critB->id, 'judge_user_id' => $judge->id, 'score' => 8, 'submitted_at' => now(),
        ]);

        Sanctum::actingAs($this->user('teacher'), ['*']);

        $this->getJson('/api/competitions/' . $competition->id . '/leaderboard')
            ->assertOk()
            ->assertJsonPath('data.rankings.0.team.id', $team1->id)
            ->assertJsonPath('data.rankings.0.max_score', 50)
            ->assertJsonPath('data.rankings.0.total_score', 45)
            ->assertJsonPath('data.rankings.0.percentage', 90)
            ->assertJsonPath('data.rankings.1.team.id', $team2->id)
            ->assertJsonPath('data.rankings.1.total_score', 28);
    }

    public function test_disqualified_teams_excluded_from_leaderboard(): void
    {
        $competition = $this->competition(['status' => 'ongoing']);
        $criterion = $this->criterion($competition);
        $judge = $this->user('judge');
        $competition->judges()->attach($judge->id);

        $active = $this->team($competition, $this->studentUser());
        $this->team($competition, $this->studentUser(), ['status' => 'disqualified']);

        CompetitionScore::create([
            'competition_id' => $competition->id, 'competition_team_id' => $active->id,
            'criterion_id' => $criterion->id, 'judge_user_id' => $judge->id, 'score' => 10, 'submitted_at' => now(),
        ]);

        Sanctum::actingAs($this->user('teacher'), ['*']);

        $this->getJson('/api/competitions/' . $competition->id . '/leaderboard')
            ->assertOk()
            ->assertJsonCount(1, 'data.rankings');
    }

    public function test_results_hidden_until_completed(): void
    {
        $competition = $this->competition(['status' => 'ongoing']);
        $student = $this->studentUser();

        Sanctum::actingAs($student, ['*']);

        $this->getJson('/api/competitions/' . $competition->id . '/results')->assertStatus(403);

        $this->getJson('/api/competitions/' . $competition->id . '/leaderboard')->assertOk();
    }
}
