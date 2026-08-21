<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Role\StoreRoleRequest;
use App\Http\Requests\Role\SyncRolePermissionsRequest;
use App\Http\Requests\Role\UpdateRoleRequest;
use App\Http\Resources\RoleResource;
use App\Services\RoleService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    use ApiResponse;

    public function __construct(
        private RoleService $roleService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Role::class);

        $roles = $this->roleService->index($request->only(['search', 'per_page']));

        return $this->paginatedResponse($roles, 'Roles retrieved successfully.');
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        $this->authorize('create', Role::class);

        $role = $this->roleService->store($request->validated());

        return $this->createdResponse(new RoleResource($role), 'Role created successfully.');
    }

    public function show(string $id): JsonResponse
    {
        $role = $this->roleService->show((int) $id);
        $this->authorize('view', $role);

        return $this->successResponse(
            new RoleResource($role->load('permissions')),
            'Role retrieved successfully.'
        );
    }

    public function update(UpdateRoleRequest $request, string $id): JsonResponse
    {
        $role = $this->roleService->show((int) $id);
        $this->authorize('update', $role);

        $role = $this->roleService->update((int) $id, $request->validated());

        return $this->successResponse(
            new RoleResource($role),
            'Role updated successfully.'
        );
    }

    public function destroy(string $id): JsonResponse
    {
        $role = $this->roleService->show((int) $id);
        $this->authorize('delete', $role);

        $this->roleService->destroy((int) $id);

        return $this->noContentResponse('Role deleted successfully.');
    }

    public function syncPermissions(SyncRolePermissionsRequest $request, string $id): JsonResponse
    {
        $role = $this->roleService->show((int) $id);
        $this->authorize('update', $role);

        $role = $this->roleService->syncPermissions($role, $request->permissions);

        return $this->successResponse(
            new RoleResource($role->load('permissions')),
            'Role permissions synchronized successfully.'
        );
    }

    public function getPermissions(string $id): JsonResponse
    {
        $role = $this->roleService->show((int) $id);
        $this->authorize('view', $role);

        $permissions = $this->roleService->getPermissions($role);

        return $this->successResponse(
            $permissions,
            'Role permissions retrieved successfully.'
        );
    }

    public function users(Request $request, string $id): JsonResponse
    {
        $role = $this->roleService->show((int) $id);
        $this->authorize('view', $role);

        $users = $this->roleService->users($role, $request->integer('per_page', 15));

        return $this->paginatedResponse($users, 'Role users retrieved successfully.');
    }
}
