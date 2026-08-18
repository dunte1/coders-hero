<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\AssignRoleRequest;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Services\UserService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use ApiResponse;

    public function __construct(
        private UserService $userService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', \App\Models\User::class);

        $perPage = $request->get('per_page', 15);
        $search = $request->get('search');

        $users = $this->userService->search($search, $perPage);

        return $this->paginatedResponse($users, 'Users retrieved successfully.');
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $this->authorize('create', \App\Models\User::class);

        $user = $this->userService->create($request->validated());

        return $this->createdResponse(
            new UserResource($user),
            'User created successfully.'
        );
    }

    public function show(string $id): JsonResponse
    {
        $user = $this->userService->findById($id);

        if (!$user) {
            return $this->notFoundResponse('User not found.');
        }

        $this->authorize('view', $user);

        return $this->successResponse(
            new UserResource($user),
            'User retrieved successfully.'
        );
    }

    public function update(UpdateUserRequest $request, string $id): JsonResponse
    {
        $user = $this->userService->findById($id);

        if (!$user) {
            return $this->notFoundResponse('User not found.');
        }

        $this->authorize('update', $user);

        $user = $this->userService->update($id, $request->validated());

        return $this->successResponse(
            new UserResource($user),
            'User updated successfully.'
        );
    }

    public function destroy(string $id): JsonResponse
    {
        $user = $this->userService->findById($id);

        if (!$user) {
            return $this->notFoundResponse('User not found.');
        }

        $this->authorize('delete', $user);

        $this->userService->delete($id);

        return $this->noContentResponse('User deleted successfully.');
    }

    public function assignRole(AssignRoleRequest $request, string $id): JsonResponse
    {
        $user = $this->userService->findById($id);

        if (!$user) {
            return $this->notFoundResponse('User not found.');
        }

        $this->authorize('assignRole', $user);

        // Prevent non-super_admin from assigning super_admin role
        if ($request->role === 'super_admin' && !auth()->user()->hasRole('super_admin')) {
            return $this->forbiddenResponse('Only super admins can assign the super_admin role.');
        }

        $user = $this->userService->assignRoles($id, [$request->role]);

        return $this->successResponse(
            new UserResource($user),
            'Role assigned successfully.'
        );
    }

    public function removeRole(Request $request, string $id): JsonResponse
    {
        $request->validate(['role' => 'required|string|exists:roles,name']);

        $user = $this->userService->findById($id);

        if (!$user) {
            return $this->notFoundResponse('User not found.');
        }

        $this->authorize('removeRole', $user);

        $user = $this->userService->removeRole($id, $request->role);

        return $this->successResponse(
            new UserResource($user),
            'Role removed successfully.'
        );
    }

    public function toggleStatus(string $id): JsonResponse
    {
        $user = $this->userService->findById($id);

        if (!$user) {
            return $this->notFoundResponse('User not found.');
        }

        $this->authorize('toggleStatus', $user);

        $user = $this->userService->toggleStatus($id);

        return $this->successResponse(
            new UserResource($user),
            'User status toggled successfully.'
        );
    }
}
