<?php

namespace App\Repositories\Interfaces;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface UserRepositoryInterface extends BaseRepositoryInterface
{
    public function findByEmail(string $email): ?User;

    public function findWithRoles(string $id): ?User;

    public function syncRoles(string $userId, array $roles): bool;

    public function getActiveUsers(int $perPage = 15): LengthAwarePaginator;

    public function getByDepartment(int $departmentId): Collection;

    public function toggleStatus(string $userId): User;

    public function updateLastLogin(string $userId): void;
}
