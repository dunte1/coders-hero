<?php

namespace App\Services\Robotics;

use App\Models\RoboticsProject;
use App\Models\RoboticsProjectSubmission;
use App\Models\Student;
use App\Models\User;
use Illuminate\Pagination\LengthAwarePaginator;

class RoboticsProjectService
{
    public function index(User $user, array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = RoboticsProject::query()
            ->with(['team', 'student'])
            ->withCount('submissions')
            ->byCategory($filters['category'] ?? null)
            ->byStatus($filters['status'] ?? null)
            ->search($filters['search'] ?? null)
            ->orderByDesc('created_at');

        if (!$this->isStaff($user)) {
            $student = $this->studentForUser($user);

            if (!$student) {
                return RoboticsProject::query()->whereRaw('1 = 0')->paginate($perPage);
            }

            $query->where(function ($q) use ($student) {
                $q->where('student_id', $student->id)
                    ->orWhereHas('team', fn ($team) => $team->whereHas('members', fn ($members) => $members->where('students.id', $student->id)));
            });
        }

        return $query->paginate($perPage);
    }

    public function show(User $user, int $id): RoboticsProject
    {
        $project = RoboticsProject::with(['team.members', 'student', 'submissions.submittedBy', 'submissions.reviewedBy'])
            ->findOrFail($id);

        if (!$this->isStaff($user) && !$this->canAccess($user, $project)) {
            throw new \RuntimeException('You do not have access to this project.', 403);
        }

        return $project;
    }

    public function store(User $user, array $data): RoboticsProject
    {
        if (!$this->isStaff($user)) {
            $student = $this->studentForUser($user);

            if (!$student) {
                throw new \RuntimeException('No student profile linked to your account.', 403);
            }

            if (!empty($data['team_id'])) {
                $team = \App\Models\RoboticsTeam::findOrFail($data['team_id']);
                if (!$team->hasMember($student->id)) {
                    throw new \RuntimeException('You can only create projects for teams you belong to.', 403);
                }
                $data['student_id'] = $student->id;
            } else {
                $data['student_id'] = $student->id;
                $data['team_id'] = null;
            }
        }

        return RoboticsProject::create([
            'team_id' => $data['team_id'] ?? null,
            'student_id' => $data['student_id'] ?? null,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'category' => $data['category'] ?? 'class',
            'status' => $data['status'] ?? 'planning',
            'start_date' => $data['start_date'] ?? null,
            'deadline' => $data['deadline'] ?? null,
            'goals' => $data['goals'] ?? null,
        ]);
    }

    public function update(User $user, int $id, array $data): RoboticsProject
    {
        $project = RoboticsProject::findOrFail($id);

        if (!$this->isStaff($user) && !$this->canAccess($user, $project)) {
            throw new \RuntimeException('You do not have access to this project.', 403);
        }

        if (($data['status'] ?? null) === 'completed' && !$project->completed_at) {
            $data['completed_at'] = now();
        }

        $project->update($data);

        return $project->fresh();
    }

    public function destroy(User $user, int $id): bool
    {
        $project = RoboticsProject::findOrFail($id);

        if (!$this->isStaff($user) && !$this->canAccess($user, $project)) {
            throw new \RuntimeException('You do not have access to this project.', 403);
        }

        return (bool) $project->delete();
    }

    public function submit(User $user, int $id, array $data): RoboticsProjectSubmission
    {
        $project = RoboticsProject::findOrFail($id);

        if (!$this->isStaff($user) && !$this->canAccess($user, $project)) {
            throw new \RuntimeException('You do not have access to this project.', 403);
        }

        return RoboticsProjectSubmission::create([
            'project_id' => $project->id,
            'submitted_by_user_id' => $user->id,
            'title' => $data['title'] ?? null,
            'description' => $data['description'] ?? null,
            'files' => $data['files'] ?? null,
            'repo_url' => $data['repo_url'] ?? null,
            'demo_url' => $data['demo_url'] ?? null,
            'status' => 'submitted',
            'submitted_at' => now(),
        ])->load(['submittedBy', 'reviewedBy']);
    }

    public function review(User $user, int $id, int $submissionId, array $data): RoboticsProjectSubmission
    {
        if (!$this->isStaff($user)) {
            throw new \RuntimeException('Only staff can review project submissions.', 403);
        }

        $project = RoboticsProject::findOrFail($id);
        $submission = $project->submissions()->findOrFail($submissionId);

        $submission->update([
            'status' => $data['status'],
            'score' => $data['score'] ?? null,
            'feedback' => $data['feedback'] ?? null,
            'reviewed_by_user_id' => $user->id,
            'reviewed_at' => now(),
        ]);

        if ($data['status'] === 'approved') {
            $project->update([
                'status' => 'completed',
                'completed_at' => now(),
            ]);
        }

        return $submission->fresh()->load(['submittedBy', 'reviewedBy']);
    }

    public function isStaff(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'super_admin', 'teacher', 'instructor']);
    }

    private function studentForUser(User $user): ?Student
    {
        return Student::where('user_id', $user->id)->first();
    }

    private function canAccess(User $user, RoboticsProject $project): bool
    {
        $student = $this->studentForUser($user);

        if (!$student) {
            return false;
        }

        return $project->isOwnedByStudent($student->id);
    }
}
