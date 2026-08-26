<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DashboardResource;
use App\Services\DashboardService;
use App\Services\TaskService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    use ApiResponse;

    public function __construct(
        private DashboardService $dashboardService,
        private TaskService $taskService
    ) {}

    public function index(): JsonResponse
    {
        $user = auth()->user();

        if ($user->hasAnyRole(['admin', 'super_admin', 'director', 'branch_manager', 'school_admin', 'accountant'])) {
            $data = $this->dashboardService->getAdminDashboard($user->id);
        } elseif ($user->hasRole('instructor')) {
            $data = $this->dashboardService->getInstructorDashboard($user->id);
        } elseif ($user->hasRole('employee')) {
            $data = $this->dashboardService->getEmployeeDashboard($user->id);
        } else {
            $data = $this->dashboardService->getStudentDashboard($user->id);
        }

        return $this->successResponse($data, 'Dashboard retrieved successfully.');
    }

    public function stats(): JsonResponse
    {
        $user = auth()->user();

        $stats = [];

        if ($user->hasAnyRole(['admin', 'super_admin', 'director', 'branch_manager', 'school_admin', 'accountant'])) {
            $stats = $this->dashboardService->getAdminStats($user->id);
        } elseif ($user->hasRole('instructor')) {
            $stats = $this->dashboardService->getInstructorStats($user->id);
        } elseif ($user->hasRole('employee')) {
            $stats = $this->dashboardService->getEmployeeStats($user->id);
            $stats['task_stats'] = $this->taskService->getDashboardStats($user->id);
        } else {
            $stats = $this->dashboardService->getStudentStats($user->id);
        }

        return $this->successResponse($stats, 'Dashboard stats retrieved successfully.');
    }
}
