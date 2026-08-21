<?php

namespace App\Services\Students;

use App\Models\Guardian;

class GuardianService
{
    public function getAll(array $filters = [], int $perPage = 15)
    {
        return Guardian::query()
            ->when(!empty($filters['search']), function ($query) use ($filters) {
                $term = $filters['search'];
                $query->where(function ($q) use ($term) {
                    $q->where('first_name', 'like', "%{$term}%")
                        ->orWhere('last_name', 'like', "%{$term}%")
                        ->orWhere('email', 'like', "%{$term}%")
                        ->orWhere('phone', 'like', "%{$term}%");
                });
            })
            ->orderBy('first_name')
            ->withCount('students')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getById(int $id): ?Guardian
    {
        return Guardian::with('students')->find($id);
    }

    public function create(array $data): Guardian
    {
        return Guardian::create($data);
    }

    public function update(int $id, array $data): Guardian
    {
        $guardian = Guardian::findOrFail($id);
        $guardian->update($data);

        return $guardian->fresh('students');
    }

    public function delete(int $id): bool
    {
        return Guardian::findOrFail($id)->delete();
    }

    public function all(): \Illuminate\Database\Eloquent\Collection
    {
        return Guardian::orderBy('first_name')->get();
    }
}
