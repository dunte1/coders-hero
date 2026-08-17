<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Permission\SyncUserPermissionsRequest;
use App\Http\Resources\PermissionResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\PermissionService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    use ApiResponse;

    public function __construct(
        private PermissionService $permissionService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Permission::class);

        $permissions = $this->permissionService->index($request->only(['search', 'group', 'per_page']));

        return $this->paginatedResponse($permissions, 'Permissions retrieved successfully.');
    }

    public function show(string $id): JsonResponse
    {
        $permission = $this->permissionService->show((int) $id);

        $this->authorize('view', $permission);

        return $this->successResponse(
            new PermissionResource($permission),
            'Permission retrieved successfully.'
        );
    }

    public function groups(): JsonResponse
    {
        $this->authorize('viewAny', Permission::class);

        return $this->successResponse(
            $this->permissionService->groups(),
            'Permission groups retrieved successfully.'
        );
    }

    public function syncUserPermissions(SyncUserPermissionsRequest $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $this->authorize('update', $user);

        $user = $this->permissionService->syncUserPermissions($user, $request->permissions ?? []);

        return $this->successResponse(
            new UserResource($user->load('roles')),
            'User permissions synchronized successfully.'
        );
    }
}
