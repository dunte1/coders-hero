<?php

namespace App\Services\Robotics;

use App\Models\RoboticsTeam;
use App\Models\Student;
use Illuminate\Pagination\LengthAwarePaginator;

class RoboticsTeamService
{
    public function index(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return RoboticsTeam::query()
            ->withCount('members')
            ->search($filters['search'] ?? null)
            ->orderBy('name')
            ->paginate($perPage);
    }

    public function show(int $id): RoboticsTeam
    {
        return RoboticsTeam::with(['members', 'mentor', 'projects'])->findOrFail($id);
    }

    public function store(array $data): RoboticsTeam
    {
        return RoboticsTeam::create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'mentor_user_id' => $data['mentor_user_id'] ?? null,
            'status' => $data['status'] ?? 'active',
        ]);
    }

    public function update(int $id, array $data): RoboticsTeam
    {
        $team = RoboticsTeam::findOrFail($id);
        $team->update($data);

        return $team->fresh();
    }

    public function destroy(int $id): bool
    {
        $team = RoboticsTeam::findOrFail($id);

        if ($team->assignments()->whereNull('returned_at')->exists()) {
            throw new \InvalidArgumentException('Cannot delete a team with active equipment assignments.');
        }

        return (bool) $team->delete();
    }

    public function addMember(int $teamId, int $studentId, string $role = 'member'): RoboticsTeam
    {
        $team = RoboticsTeam::findOrFail($teamId);
        Student::findOrFail($studentId);

        $team->members()->syncWithoutDetaching([
            $studentId => ['role' => $role],
        ]);

        return $team->fresh()->load(['members', 'mentor']);
    }

    public function updateMemberRole(int $teamId, int $studentId, string $role): RoboticsTeam
    {
        $team = RoboticsTeam::findOrFail($teamId);

        $team->members()->updateExistingPivot($studentId, ['role' => $role]);

        return $team->fresh()->load(['members', 'mentor']);
    }

    public function removeMember(int $teamId, int $studentId): RoboticsTeam
    {
        $team = RoboticsTeam::findOrFail($teamId);
        $team->members()->detach($studentId);

        return $team->fresh()->load(['members', 'mentor']);
    }
}
