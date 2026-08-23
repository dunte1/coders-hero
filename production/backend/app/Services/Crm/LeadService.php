<?php

namespace App\Services\Crm;

use App\Models\Lead;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class LeadService
{
    public function index(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return Lead::query()
            ->with(['owner:id,name'])
            ->byStatus($filters['status'] ?? null)
            ->when(($filters['search'] ?? null), fn ($q, $v) => $q->where(function ($sub) use ($v) {
                $sub->where('name', 'like', "%{$v}%")
                    ->orWhere('organization', 'like', "%{$v}%")
                    ->orWhere('email', 'like', "%{$v}%")
                    ->orWhere('phone', 'like', "%{$v}%");
            }))
            ->when(($filters['owner_id'] ?? null), fn ($q, $v) => $q->where('owner_id', $v))
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function store(array $data): Lead
    {
        return Lead::create($data);
    }

    public function show(int $id): Lead
    {
        return Lead::with(['owner:id,name'])->findOrFail($id);
    }

    public function update(int $id, array $data): Lead
    {
        $lead = Lead::findOrFail($id);
        $lead->update($data);

        return $lead->fresh()->load(['owner:id,name']);
    }

    public function destroy(int $id): bool
    {
        return (bool) Lead::findOrFail($id)->delete();
    }

    public function changeStatus(int $id, string $status): Lead
    {
        $lead = Lead::findOrFail($id);
        $lead->update(['status' => $status]);

        return $lead->fresh()->load(['owner:id,name']);
    }
}
