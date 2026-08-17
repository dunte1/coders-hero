<?php

namespace App\Services\Robotics;

use App\Models\RoboticsEquipment;
use BaconQrCode\Renderer\GDLibRenderer;
use BaconQrCode\Writer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Str;

class RoboticsEquipmentService
{
    public function index(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return RoboticsEquipment::query()
            ->withCount(['activeAssignments as assigned_quantity', 'openMaintenanceRecords as open_maintenance_count'])
            ->byType($filters['type'] ?? null)
            ->byStatus($filters['status'] ?? null)
            ->search($filters['search'] ?? null)
            ->orderBy('name')
            ->paginate($perPage);
    }

    public function show(int $id): RoboticsEquipment
    {
        return RoboticsEquipment::query()
            ->with([
                'activeAssignments.assignable',
                'activeAssignments.assignedBy',
                'maintenanceRecords' => fn ($q) => $q->orderByDesc('maintenance_date'),
                'pendingReservations.reservedBy',
                'pendingReservations.team',
            ])
            ->findOrFail($id);
    }

    public function store(array $data): RoboticsEquipment
    {
        $data['quantity_available'] = $data['quantity_total'];
        $data['qr_code'] = $this->generateQrCode();

        return RoboticsEquipment::create($data);
    }

    public function update(int $id, array $data): RoboticsEquipment
    {
        $equipment = RoboticsEquipment::findOrFail($id);

        $assigned = $equipment->activeAssignments()->sum('quantity');

        if (isset($data['quantity_total'])) {
            $newTotal = (int) $data['quantity_total'];
            $minTotal = $assigned + ($data['quantity_available'] ?? $equipment->quantity_available - $assigned);

            if ($newTotal < $assigned) {
                throw new \InvalidArgumentException(
                    "Cannot reduce total below the currently assigned quantity ({$assigned})."
                );
            }

            $delta = $newTotal - $equipment->quantity_total;
            $data['quantity_available'] = max(0, $equipment->quantity_available + $delta);
        }

        $equipment->update($data);

        return $equipment->fresh();
    }

    public function destroy(int $id): bool
    {
        $equipment = RoboticsEquipment::findOrFail($id);

        if ($equipment->activeAssignments()->exists()) {
            throw new \InvalidArgumentException('Cannot delete equipment that is currently assigned.');
        }

        return (bool) $equipment->delete();
    }

    public function scan(string $qrCode): RoboticsEquipment
    {
        return RoboticsEquipment::query()
            ->withCount(['activeAssignments as assigned_quantity', 'openMaintenanceRecords as open_maintenance_count'])
            ->where('qr_code', $qrCode)
            ->firstOrFail();
    }

    public function regenerateQr(int $id): RoboticsEquipment
    {
        $equipment = RoboticsEquipment::findOrFail($id);
        $equipment->update(['qr_code' => $this->generateQrCode()]);

        return $equipment->fresh();
    }

    public function summary(): array
    {
        return [
            'total_equipment' => RoboticsEquipment::count(),
            'active_equipment' => RoboticsEquipment::active()->count(),
            'retired_equipment' => RoboticsEquipment::where('status', 'retired')->count(),
            'total_units' => (int) RoboticsEquipment::sum('quantity_total'),
            'available_units' => (int) RoboticsEquipment::sum('quantity_available'),
            'assigned_units' => (int) RoboticsEquipment::query()
                ->join('robotics_equipment_assignments', 'robotics_equipment_assignments.equipment_id', '=', 'robotics_equipment.id')
                ->whereNull('robotics_equipment_assignments.returned_at')
                ->sum('robotics_equipment_assignments.quantity'),
            'by_type' => RoboticsEquipment::selectRaw('type, count(*) as count')
                ->groupBy('type')
                ->orderBy('type')
                ->get()
                ->pluck('count', 'type')
                ->toArray(),
            'open_maintenance' => (int) \App\Models\RoboticsMaintenanceRecord::where('status', '!=', 'resolved')->count(),
            'pending_reservations' => (int) \App\Models\RoboticsEquipmentReservation::where('status', 'pending')->count(),
            'teams' => (int) \App\Models\RoboticsTeam::count(),
            'projects' => (int) \App\Models\RoboticsProject::count(),
        ];
    }

    public function generateQrCode(): string
    {
        do {
            $code = 'RBT-' . Str::upper(Str::random(8));
        } while (RoboticsEquipment::where('qr_code', $code)->exists());

        return $code;
    }

    public function generateQrDataUrl(string $code): string
    {
        $writer = new Writer(new GDLibRenderer(200, 4, 'png', 9));

        return 'data:image/png;base64,' . base64_encode($writer->writeString($code));
    }
}
