<?php

namespace App\Services\Organization;

use App\Models\SchoolContract;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;

class ContractService
{
    public function index(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return SchoolContract::query()
            ->with(['partnerSchool:id,name'])
            ->when(($filters['status'] ?? null), fn ($q, $v) => $q->where('status', $v))
            ->when(($filters['partner_school_id'] ?? null), fn ($q, $v) => $q->where('partner_school_id', $v))
            ->when(($filters['search'] ?? null), fn ($q, $v) => $q->where(function ($sub) use ($v) {
                $sub->where('contract_number', 'like', "%{$v}%")
                    ->orWhere('title', 'like', "%{$v}%");
            }))
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function store(array $data): SchoolContract
    {
        return SchoolContract::create($data);
    }

    public function show(int $id): SchoolContract
    {
        return SchoolContract::with(['partnerSchool'])->findOrFail($id);
    }

    public function update(int $id, array $data): SchoolContract
    {
        $contract = SchoolContract::findOrFail($id);
        $contract->update($data);

        return $contract->fresh()->load(['partnerSchool']);
    }

    public function destroy(int $id): bool
    {
        return (bool) SchoolContract::findOrFail($id)->delete();
    }

    public function uploadDocument(int $id, UploadedFile $file): SchoolContract
    {
        $contract = SchoolContract::findOrFail($id);

        $path = $file->store('contracts', 'public');
        $contract->update(['document_path' => $path]);

        return $contract->fresh();
    }
}
