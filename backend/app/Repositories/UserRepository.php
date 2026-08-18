<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class UserRepository extends BaseRepository implements UserRepositoryInterface
{
    public function __construct(User $model)
    {
        parent::__construct($model);
    }

    public function findByEmail(string $email): ?User
    {
        return $this->model->where('email', $email)->first();
    }

    public function findWithRoles(string $id): ?User
    {
        return $this->model->with('roles.permissions', 'employee', 'employee.department', 'employee.position')->find($id);
    }

    public function syncRoles(string $userId, array $roles): bool
    {
        $user = $this->model->findOrFail($userId);
        $user->syncRoles($roles);
        return true;
    }

    public function getActiveUsers(int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->active()
            ->with('roles')
            ->orderBy('name')
            ->paginate($perPage);
    }

    public function getByDepartment(int $departmentId): Collection
    {
        return $this->model->whereHas('employee', function ($q) use ($departmentId) {
            $q->where('department_id', $departmentId);
        })->with('employee', 'roles')->get();
    }

    public function toggleStatus(string $userId): User
    {
        $user = $this->model->findOrFail($userId);
        $user->update(['is_active' => !$user->is_active]);
        return $user->fresh();
    }

    public function updateLastLogin(string $userId): void
    {
        $this->model->where('id', $userId)->update(['last_login_at' => now()]);
    }
}
