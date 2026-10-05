<?php

namespace App\Http\Controllers\Api\Hr;

use App\Http\Controllers\Controller;
use App\Http\Requests\Hr\ReviewLeaveRequest;
use App\Http\Requests\Hr\StoreLeaveRequest;
use App\Http\Resources\Hr\LeaveRequestResource;
use App\Services\Hr\HrService;
use App\Services\Hr\LeaveService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaveController extends Controller
{
    use ApiResponse;

    public function __construct(
        private LeaveService $leaveService,
        private HrService $hrService
    ) {}

    public function index(Request $request): JsonResponse
    {
        return $this->paginatedResponse(
            $this->leaveService->index($request->only([
                'status', 'leave_type', 'employee_id', 'from', 'to', 'search', 'per_page', 'page',
            ])),
            'Leave requests retrieved successfully.'
        );
    }

    public function show(int $id): JsonResponse
    {
        return $this->successResponse(
            new LeaveRequestResource($this->leaveService->show($id)),
            'Leave request retrieved successfully.'
        );
    }

    public function store(StoreLeaveRequest $request): JsonResponse
    {
        $data = $request->validated();

        if (empty($data['employee_id'])) {
            return $this->errorResponse('The employee id field is required.', 422);
        }

        try {
            $leave = $this->leaveService->store($data, auth()->user());
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 422);
        }

        return $this->createdResponse(
            new LeaveRequestResource($leave->load(['employee.user', 'requestedBy'])),
            'Leave request submitted successfully.'
        );
    }

    public function review(ReviewLeaveRequest $request, int $id): JsonResponse
    {
        try {
            $leave = $this->leaveService->review($id, $request->get('status'), $request->get('note'), auth()->user());
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 422);
        }

        return $this->successResponse(
            new LeaveRequestResource($leave),
            'Leave request reviewed successfully.'
        );
    }

    public function cancel(int $id): JsonResponse
    {
        try {
            $leave = $this->leaveService->cancel($id, auth()->user());
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 422);
        }

        return $this->successResponse(
            new LeaveRequestResource($leave),
            'Leave request cancelled successfully.'
        );
    }

    public function myLeaves(Request $request): JsonResponse
    {
        $user = auth()->user();
        $employee = $this->hrService->employeeForUser($user);

        if (!$employee && $user->hasAnyRole(['admin', 'super_admin'])) {
            return $this->successResponse(
                [
                    'data' => [],
                    'meta' => ['current_page' => 1, 'last_page' => 1, 'per_page' => 15, 'total' => 0, 'from' => null, 'to' => null],
                ],
                'Leave requests retrieved successfully.'
            );
        }

        if (!$employee) {
            return $this->forbiddenResponse('Only employees can access their own leave records.');
        }

        return $this->paginatedResponse(
            $this->leaveService->myLeaves($employee->id, $request->only(['status', 'per_page', 'page'])),
            'Leave requests retrieved successfully.'
        );
    }

    public function myBalance(): JsonResponse
    {
        $user = auth()->user();
        $employee = $this->hrService->employeeForUser($user);

        if (!$employee && $user->hasAnyRole(['admin', 'super_admin'])) {
            return $this->successResponse(
                ['annual' => 0, 'sick' => 0, 'casual' => 0, 'earned' => 0, 'unpaid' => 0],
                'Leave balance retrieved successfully.'
            );
        }

        if (!$employee) {
            return $this->forbiddenResponse('Only employees can access their leave balance.');
        }

        return $this->successResponse(
            $this->leaveService->myBalance($employee->id),
            'Leave balance retrieved successfully.'
        );
    }

    public function myStore(StoreLeaveRequest $request): JsonResponse
    {
        $user = auth()->user();
        $employee = $this->hrService->employeeForUser($user);

        if (!$employee && $user->hasAnyRole(['admin', 'super_admin'])) {
            return $this->forbiddenResponse('Admin users cannot submit leave requests for themselves.');
        }

        if (!$employee) {
            return $this->forbiddenResponse('Only employees can submit leave requests.');
        }

        $data = $request->validated();
        $data['employee_id'] = $employee->id;

        try {
            $leave = $this->leaveService->store($data, auth()->user());
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 422);
        }

        return $this->createdResponse(
            new LeaveRequestResource($leave->load(['employee.user', 'requestedBy'])),
            'Leave request submitted successfully.'
        );
    }

    public function myCancel(int $id): JsonResponse
    {
        $user = auth()->user();
        $employee = $this->hrService->employeeForUser($user);

        if (!$employee && $user->hasAnyRole(['admin', 'super_admin'])) {
            return $this->forbiddenResponse('Admin users cannot cancel leave requests through this endpoint.');
        }

        if (!$employee) {
            return $this->forbiddenResponse('Only employees can cancel their own leave requests.');
        }

        $leave = \App\Models\LeaveRequest::find($id);

        if (!$leave || $leave->employee_id !== $employee->id) {
            return $this->notFoundResponse('Leave request not found.');
        }

        try {
            $leave = $this->leaveService->cancel($id, auth()->user());
        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), $e->getCode() ?: 422);
        }

        return $this->successResponse(
            new LeaveRequestResource($leave),
            'Leave request cancelled successfully.'
        );
    }
}
