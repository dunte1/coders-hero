<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Spatie\Permission\Models\Permission;

class PermissionService
{
    public function index(array $filters = []): LengthAwarePaginator
    {
        return Permission::query()
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('display_name', 'like', "%{$search}%");
                });
            })
            ->when($filters['group'] ?? null, function ($query, string $group) {
                $query->where('group', $group);
            })
            ->orderBy('group')
            ->orderBy('name')
            ->paginate($filters['per_page'] ?? 15);
    }

    public function show(int $id): Permission
    {
        return Permission::findOrFail($id);
    }

    public function groups(): array
    {
        return Permission::query()
            ->orderBy('group')
            ->orderBy('name')
            ->get()
            ->groupBy('group')
            ->map(fn ($group) => $group->map(fn (Permission $permission) => [
                'id' => $permission->id,
                'name' => $permission->name,
                'display_name' => $permission->display_name,
                'description' => $permission->description,
                'group' => $permission->group,
            ])->values())
            ->toArray();
    }

    public function syncUserPermissions(User $user, array $permissions): User
    {
        $user->syncPermissions($permissions);

        return $user->fresh('permissions');
    }
}
