<?php

namespace App\Services;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Spatie\Permission\Models\Role;

class RoleService
{
    public function index(array $filters = []): LengthAwarePaginator
    {
        return Role::query()
            ->with('permissions')
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('display_name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->orderBy('name')
            ->paginate($filters['per_page'] ?? 15);
    }

    public function store(array $data): Role
    {
        $role = DB::transaction(function () use ($data) {
            return Role::create([
                'name' => $data['name'],
                'guard_name' => $data['guard_name'] ?? 'web',
                'display_name' => $data['display_name'] ?? null,
                'description' => $data['description'] ?? null,
            ]);
        });

        return $role->load('permissions');
    }

    public function show(int $id): Role
    {
        return Role::with('permissions')->findOrFail($id);
    }

    public function update(int $id, array $data): Role
    {
        $role = Role::findOrFail($id);

        $role->update([
            'name' => $data['name'] ?? $role->name,
            'display_name' => $data['display_name'] ?? $role->display_name,
            'description' => $data['description'] ?? $role->description,
        ]);

        return $role->fresh('permissions');
    }

    public function destroy(int $id): bool
    {
        $role = Role::findOrFail($id);

        if ($role->name === 'super_admin') {
            throw ValidationException::withMessages([
                'role' => ['The super_admin role cannot be deleted.'],
            ]);
        }

        if ($role->users()->exists()) {
            throw ValidationException::withMessages([
                'role' => ['This role is currently assigned to users and cannot be deleted.'],
            ]);
        }

        return DB::transaction(function () use ($role) {
            $role->syncPermissions([]);

            return (bool) $role->delete();
        });
    }

    public function syncPermissions(Role $role, array $permissions): Role
    {
        $role->syncPermissions($permissions);

        return $role->fresh('permissions');
    }

    public function getPermissions(Role $role): Collection
    {
        return $role->permissions;
    }

    public function users(Role $role, int $perPage = 15): LengthAwarePaginator
    {
        return $role->users()
            ->with('roles')
            ->orderBy('name')
            ->paginate($perPage);
    }
}
