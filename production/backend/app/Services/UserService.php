<?php

namespace App\Services;

use App\Jobs\SendWelcomeEmailJob;
use App\Models\User;
use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function __construct(
        private UserRepositoryInterface $userRepository
    ) {}

    public function getAll(int $perPage = 15)
    {
        return $this->userRepository->paginate($perPage, ['*'], ['roles.permissions']);
    }

    public function findById(string $id): ?User
    {
        return $this->userRepository->findWithRoles($id);
    }

    public function create(array $data): User
    {
        $user = $this->userRepository->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'phone' => $data['phone'] ?? null,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        if (!empty($data['role'])) {
            $user->assignRole($data['role']);
        }

        SendWelcomeEmailJob::dispatch($user);

        return $user->load('roles.permissions');
    }

    public function update(string $id, array $data): User
    {
        $user = $this->userRepository->update($id, $data);
        return $user->load('roles.permissions');
    }

    public function delete(string $id): bool
    {
        return $this->userRepository->delete($id);
    }

    public function assignRoles(string $userId, array $roles): User
    {
        $this->userRepository->syncRoles($userId, $roles);
        return $this->userRepository->findWithRoles($userId);
    }

    public function removeRole(string $userId, string $role): User
    {
        $user = $this->userRepository->findById($userId);
        $user->removeRole($role);
        return $user->fresh()->load('roles.permissions');
    }

    public function toggleStatus(string $userId): User
    {
        return $this->userRepository->toggleStatus($userId);
    }

    public function search(?string $term, int $perPage = 15)
    {
        if ($term) {
            return $this->userRepository->search($term, ['name', 'email', 'phone'], $perPage);
        }
        return $this->userRepository->paginate($perPage, ['*'], ['roles.permissions']);
    }

    public function getDashboardData(): array
    {
        $model = app(User::class);

        return [
            'total_users' => $model->count(),
            'active_users' => $model->active()->count(),
            'inactive_users' => $model->inactive()->count(),
            'recent_users' => $model->latest()->take(5)->with('roles.permissions')->get(),
            'users_by_role' => $model->withCount('roles.permissions')->get()->groupBy(function ($user) {
                return $user->roles->first()->name ?? 'no_role';
            })->map(function ($group) {
                return $group->count();
            }),
        ];
    }
}
