<?php

namespace App\Services\Competitions;

use App\Models\Competition;
use App\Models\CompetitionTeam;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class CompetitionRegistrationService
{
    use CompetitionAccess;

    public function searchStudents(?string $search, int $limit = 20): array
    {
        $query = Student::query()
            ->active()
            ->orderBy('first_name')
            ->orderBy('last_name');

        if ($search) {
            $term = trim($search);
            $query->where(function ($q) use ($term) {
                $q->where('first_name', 'like', "%{$term}%")
                    ->orWhere('last_name', 'like', "%{$term}%")
                    ->orWhere('student_id', 'like', "%{$term}%");
            });
        }

        return $query->limit($limit)
            ->get(['id', 'first_name', 'last_name', 'student_id', 'grade'])
            ->map(fn (Student $student) => [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'student_id' => $student->student_id,
                'grade' => $student->grade,
            ])
            ->values()
            ->all();
    }

    public function registerTeam(User $user, Competition $competition, array $data): CompetitionTeam
    {
        if (!$competition->isRegistrationOpen()) {
            throw new \RuntimeException('Registration is closed for this competition.', 422);
        }

        $student = $this->studentForUser($user);

        if (!$student) {
            throw new \RuntimeException('No student profile linked to your account.', 403);
        }

        if ($this->studentTeamForCompetition($student->id, $competition->id)) {
            throw new \RuntimeException('You are already registered for this competition.', 422);
        }

        return DB::transaction(function () use ($student, $competition, $data) {
            $team = CompetitionTeam::create([
                'competition_id' => $competition->id,
                'name' => $data['name'],
                'project_title' => $data['project_title'] ?? null,
                'description' => $data['description'] ?? null,
                'status' => 'registered',
                'leader_student_id' => $student->id,
            ]);

            $team->members()->attach($student->id, ['role' => 'leader']);

            return $team->load(['leader', 'members', 'competition']);
        });
    }

    public function addMember(User $user, CompetitionTeam $team, int $studentId, string $role = 'member'): CompetitionTeam
    {
        $this->assertCanManageTeam($user, $team);

        $competition = $team->competition;

        if ($competition->status === 'completed' || $competition->status === 'cancelled') {
            throw new \RuntimeException('Registration is closed for this competition.', 422);
        }

        if (!$competition->isRegistrationOpen()) {
            throw new \RuntimeException('Registration is closed for this competition.', 422);
        }

        if ($team->hasSubmitted()) {
            throw new \RuntimeException('Cannot modify a team that has already submitted.', 422);
        }

        if ($team->isFull()) {
            throw new \RuntimeException('Team has reached its maximum size.', 422);
        }

        $student = Student::findOrFail($studentId);

        if ($this->studentTeamForCompetition($student->id, $competition->id)) {
            throw new \RuntimeException('That student is already registered in another team for this competition.', 422);
        }

        $team->members()->syncWithoutDetaching([$studentId => ['role' => $role]]);

        return $team->fresh(['leader', 'members', 'competition']);
    }

    public function removeMember(User $user, CompetitionTeam $team, int $studentId): CompetitionTeam
    {
        $this->assertCanManageTeam($user, $team);

        $competition = $team->competition;

        if (!$competition->isRegistrationOpen() || $team->hasSubmitted()) {
            throw new \RuntimeException('Cannot modify this team right now.', 422);
        }

        if ($team->leader_student_id === $studentId) {
            throw new \RuntimeException('The team leader cannot be removed.', 422);
        }

        $team->members()->detach($studentId);

        return $team->fresh(['leader', 'members', 'competition']);
    }

    public function submitProject(User $user, CompetitionTeam $team, array $data): CompetitionTeam
    {
        $this->assertCanManageTeam($user, $team);

        $competition = $team->competition;

        if (!$competition->isPublished()) {
            throw new \RuntimeException('This competition is not accepting submissions.', 422);
        }

        $team->update([
            'submission_url' => $data['submission_url'],
            'project_title' => $data['project_title'] ?? $team->project_title,
            'status' => 'submitted',
        ]);

        return $team->fresh(['leader', 'members', 'competition']);
    }

    public function disqualify(User $user, CompetitionTeam $team, bool $disqualified = true): CompetitionTeam
    {
        if (!$this->canManage($user)) {
            throw new \RuntimeException('Only staff can disqualify teams.', 403);
        }

        $team->update(['status' => $disqualified ? 'disqualified' : 'registered']);

        return $team->fresh(['leader', 'members', 'competition']);
    }

    public function myRegistrations(User $user): Collection
    {
        $student = $this->studentForUser($user);

        if (!$student) {
            return collect();
        }

        return CompetitionTeam::query()
            ->with(['competition', 'leader', 'members'])
            ->withCount('members')
            ->whereHas('members', fn ($q) => $q->where('students.id', $student->id))
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (CompetitionTeam $team) => $team->setAttribute('is_leader', $team->leader_student_id === $student->id));
    }

    public function studentTeamForCompetition(int $studentId, int $competitionId): ?CompetitionTeam
    {
        return CompetitionTeam::query()
            ->where('competition_id', $competitionId)
            ->whereHas('members', fn ($q) => $q->where('students.id', $studentId))
            ->first();
    }

    private function assertCanManageTeam(User $user, CompetitionTeam $team): void
    {
        if ($this->isStaff($user)) {
            return;
        }

        $student = $this->studentForUser($user);

        if (!$student || $team->leader_student_id !== $student->id) {
            throw new \RuntimeException('Only the team leader can perform this action.', 403);
        }
    }
}
