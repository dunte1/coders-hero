<?php

namespace App\Repositories\Interfaces;

use App\Models\Employee;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface EmployeeRepositoryInterface extends BaseRepositoryInterface
{
    public function findByDepartment(int $departmentId, int $perPage = 15): LengthAwarePaginator;

    public function findByStatus(string $status, int $perPage = 15): LengthAwarePaginator;

    public function getDirectory(int $perPage = 15): LengthAwarePaginator;

    public function findByUserId(string $userId): ?Employee;

    public function getDepartmentStats(): Collection;
}
