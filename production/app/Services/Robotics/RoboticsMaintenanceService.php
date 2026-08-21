<?php

namespace App\Services\Robotics;

use App\Models\RoboticsMaintenanceRecord;
use Illuminate\Pagination\LengthAwarePaginator;

class RoboticsMaintenanceService
{
    public function index(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = RoboticsMaintenanceRecord::query()
            ->with(['equipment', 'recordedBy'])
            ->orderByDesc('maintenance_date');

        if (($filters['status'] ?? null) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        if ($filters['equipment_id'] ?? null) {
            $query->where('equipment_id', $filters['equipment_id']);
        }

        return $query->paginate($perPage);
    }

    public function store(array $data): RoboticsMaintenanceRecord
    {
        return RoboticsMaintenanceRecord::create([
            'equipment_id' => $data['equipment_id'],
            'recorded_by_user_id' => $data['recorded_by_user_id'] ?? auth()->id(),
            'type' => $data['type'],
            'issue_description' => $data['issue_description'] ?? null,
            'resolution' => $data['resolution'] ?? null,
            'status' => $data['status'] ?? 'reported',
            'cost' => $data['cost'] ?? null,
            'maintenance_date' => $data['maintenance_date'] ?? now(),
        ])->load(['equipment', 'recordedBy']);
    }

    public function update(int $id, array $data): RoboticsMaintenanceRecord
    {
        $record = RoboticsMaintenanceRecord::findOrFail($id);

        $record->update($data);

        return $record->fresh()->load(['equipment', 'recordedBy']);
    }

    public function resolve(int $id, array $data): RoboticsMaintenanceRecord
    {
        $record = RoboticsMaintenanceRecord::findOrFail($id);

        $record->update([
            'resolution' => $data['resolution'] ?? $record->resolution,
            'status' => 'resolved',
            'resolved_at' => now(),
            'cost' => $data['cost'] ?? $record->cost,
        ]);

        return $record->fresh()->load(['equipment', 'recordedBy']);
    }

    public function destroy(int $id): bool
    {
        return (bool) RoboticsMaintenanceRecord::findOrFail($id)->delete();
    }
}
