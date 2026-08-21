<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\User;
use App\Repositories\Interfaces\EmployeeRepositoryInterface;
use Illuminate\Support\Facades\Hash;

class EmployeeService
{
    public function __construct(
        private EmployeeRepositoryInterface $employeeRepository
    ) {}

    public function getAll(int $perPage = 15)
    {
        return $this->employeeRepository->paginate($perPage, ['*'], ['user', 'department', 'position']);
    }

    public function getById(int $id): ?Employee
    {
        return $this->employeeRepository->findById($id, ['*'], ['user', 'department', 'position']);
    }

    public function create(array $data): Employee
    {
        if (!empty($data['user_id'])) {
            $user = User::find($data['user_id']);
        } else {
            $user = User::create([
                'name' => $data['name'] ?? $data['email'],
                'email' => $data['email'],
                'password' => Hash::make($data['password'] ?? 'password'),
                'phone' => $data['phone'] ?? null,
                'is_active' => true,
                'email_verified_at' => now(),
            ]);

            $user->assignRole('employee');
            $data['user_id'] = $user->id;
        }

        $data['employee_id'] = $data['employee_id'] ?? $this->generateEmployeeId();
        $data['status'] = $data['status'] ?? 'active';

        $employee = $this->employeeRepository->create($data);
        return $employee->load(['user', 'department', 'position']);
    }

    public function update(int $id, array $data): Employee
    {
        return $this->employeeRepository->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return $this->employeeRepository->delete($id);
    }

    public function onboard(array $data): Employee
    {
        $employee = $this->create($data);
        $this->sendOnboardingNotifications($employee);
        return $employee;
    }

    public function offboard(int $employeeId, string $reason = 'resigned'): Employee
    {
        $employee = $this->employeeRepository->findById($employeeId);
        $statusMap = [
            'resigned' => 'resigned',
            'terminated' => 'terminated',
        ];

        $status = $statusMap[$reason] ?? 'terminated';

        $employee = $this->employeeRepository->update($employeeId, ['status' => $status]);
        $employee->user->update(['is_active' => false]);

        return $employee;
    }

    public function getDirectory(int $perPage = 15)
    {
        return $this->employeeRepository->getDirectory($perPage);
    }

    public function getByDepartment(int $departmentId, int $perPage = 15)
    {
        return $this->employeeRepository->findByDepartment($departmentId, $perPage);
    }

    public function findByUserId(string $userId): ?Employee
    {
        return $this->employeeRepository->findByUserId($userId);
    }

    public function search(?string $term, int $perPage = 15)
    {
        if ($term) {
            return $this->employeeRepository->search($term, ['employee_id'], $perPage);
        }
        return $this->getAll($perPage);
    }

    private function generateEmployeeId(): string
    {
        $lastEmployee = Employee::latest('id')->first();
        $number = $lastEmployee ? intval(substr($lastEmployee->employee_id, 3)) + 1 : 1;
        return 'EMP' . str_pad($number, 5, '0', STR_PAD_LEFT);
    }

    private function sendOnboardingNotifications(Employee $employee): void
    {
        \App\Jobs\SendNotificationJob::dispatch(
            $employee->user->id,
            'Welcome to the team!',
            'Your onboarding has been initiated. Please complete your profile.',
            'onboarding'
        );
    }
}
