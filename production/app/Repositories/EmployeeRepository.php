<?php

namespace App\Repositories;

use App\Models\Employee;
use App\Repositories\Interfaces\EmployeeRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class EmployeeRepository extends BaseRepository implements EmployeeRepositoryInterface
{
    public function __construct(Employee $model)
    {
        parent::__construct($model);
    }

    public function findByDepartment(int $departmentId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->where('department_id', $departmentId)
            ->with(['user', 'department', 'position'])
            ->orderBy('employee_id')
            ->paginate($perPage);
    }

    public function findByStatus(string $status, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->where('status', $status)
            ->with(['user', 'department', 'position'])
            ->orderBy('employee_id')
            ->paginate($perPage);
    }

    public function getDirectory(int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->active()
            ->with(['user', 'department', 'position'])
            ->orderBy('employee_id')
            ->paginate($perPage);
    }

    public function findByUserId(string $userId): ?Employee
    {
        return $this->model->where('user_id', $userId)
            ->with(['user', 'department', 'position'])
            ->first();
    }

    public function getDepartmentStats(): Collection
    {
        return $this->model->selectRaw('department_id, COUNT(*) as employee_count, AVG(salary) as avg_salary')
            ->groupBy('department_id')
            ->with('department')
            ->get();
    }
}
