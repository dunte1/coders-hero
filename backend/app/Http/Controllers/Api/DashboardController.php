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

        if ($user->hasRole('admin') || $user->hasRole('super_admin')) {
            $data = $this->dashboardService->getAdminDashboard();
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

        if ($user->hasRole('admin') || $user->hasRole('super_admin')) {
            $stats = $this->dashboardService->getAdminDashboard()['overview'];
        } elseif ($user->hasRole('instructor')) {
            $stats = $this->dashboardService->getInstructorDashboard($user->id)['overview'];
        } elseif ($user->hasRole('employee')) {
            $stats = $this->dashboardService->getEmployeeDashboard($user->id)['overview'];
            $stats['task_stats'] = $this->taskService->getDashboardStats($user->id);
        } else {
            $stats = $this->dashboardService->getStudentDashboard($user->id)['overview'];
        }

        return $this->successResponse($stats, 'Dashboard stats retrieved successfully.');
    }
}
