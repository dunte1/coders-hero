<?php

namespace App\Services\Inventory;

use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\AssetMaintenanceRecord;
use App\Models\Employee;
use App\Models\RoboticsTeam;
use App\Models\Student;
use BaconQrCode\Renderer\GDLibRenderer;
use BaconQrCode\Writer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class AssetService
{
    public function index(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return Asset::query()
            ->with(['category', 'location', 'assignments'])
            ->withCount(['assignments', 'maintenanceRecords', 'openMaintenanceRecords'])
            ->byStatus($filters['status'] ?? null)
            ->byCategory($filters['category_id'] ?? null)
            ->byLocation($filters['location_id'] ?? null)
            ->search($filters['search'] ?? null)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function show(int $id): Asset
    {
        return Asset::query()
            ->with([
                'category',
                'location',
                'assignments.assignee',
                'assignments.assignedBy',
                'maintenanceRecords' => fn ($q) => $q->orderByDesc('maintenance_date'),
                'roboticsEquipment',
            ])
            ->withCount(['assignments', 'maintenanceRecords', 'openMaintenanceRecords'])
            ->findOrFail($id);
    }

    public function store(array $data): Asset
    {
        $data['asset_code'] = $this->generateAssetCode();
        $data['qr_code'] = $this->generateQrCode();
        $data['created_by_user_id'] = auth()->id();

        return Asset::create($data)->fresh();
    }

    public function update(int $id, array $data): Asset
    {
        $asset = Asset::findOrFail($id);
        $asset->update($data);

        return $this->show($asset->id);
    }

    public function destroy(int $id): bool
    {
        $asset = Asset::findOrFail($id);

        if ($asset->activeAssignment()) {
            throw new \InvalidArgumentException('Cannot delete an asset that is currently checked out.');
        }

        return (bool) $asset->delete();
    }

    // ---- Assignments (check-in / check-out) ----

    public function checkOut(int $assetId, array $data): AssetAssignment
    {
        $asset = Asset::findOrFail($assetId);

        if (!$asset->isAvailable()) {
            throw new \InvalidArgumentException('Only available assets can be checked out.');
        }

        $assignee = $this->resolveAssignee($data['assignee_type'], (int) $data['assignee_id']);

        if (!$assignee) {
            throw new \InvalidArgumentException('The selected assignee could not be found.');
        }

        $assignment = AssetAssignment::create([
            'asset_id' => $asset->id,
            'assignee_type' => $assignee->getMorphClass(),
            'assignee_id' => $assignee->id,
            'assigned_at' => now(),
            'expected_return_at' => $data['expected_return_at'] ?? null,
            'note' => $data['note'] ?? null,
            'assigned_by_user_id' => auth()->id(),
        ]);

        $asset->update(['status' => 'assigned']);

        return $assignment->load(['asset', 'assignee', 'assignedBy']);
    }

    public function checkIn(int $assetId, ?string $note = null): AssetAssignment
    {
        $asset = Asset::findOrFail($assetId);

        $active = $asset->activeAssignment();

        if (!$active) {
            throw new \InvalidArgumentException('This asset is not currently checked out.');
        }

        $active->update([
            'returned_at' => now(),
            'note' => $note ? trim($active->note . ' ' . $note) : $active->note,
        ]);

        $asset->update(['status' => 'available']);

        return $active->load(['asset', 'assignee']);
    }

    public function dispose(int $assetId, ?string $note = null): Asset
    {
        $asset = Asset::findOrFail($assetId);

        if ($asset->activeAssignment()) {
            throw new \InvalidArgumentException('Check the asset back in before disposal.');
        }

        $asset->update([
            'status' => 'disposed',
            'notes' => $note ? trim($asset->notes . ' [Disposed] ' . $note) : $asset->notes,
        ]);

        return $this->show($asset->id);
    }

    public function assignments(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return AssetAssignment::query()
            ->with(['asset', 'assignee', 'assignedBy'])
            ->when($filters['asset_id'] ?? null, fn ($q, $id) => $q->where('asset_id', $id))
            ->when($filters['status'] ?? null, function ($q, $status) {
                if ($status === 'active') {
                    $q->whereNull('returned_at');
                } elseif ($status === 'returned') {
                    $q->whereNotNull('returned_at');
                }
            })
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    // ---- Maintenance ----

    public function maintenanceRecords(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return AssetMaintenanceRecord::query()
            ->with(['asset', 'reportedBy'])
            ->when($filters['asset_id'] ?? null, fn ($q, $id) => $q->where('asset_id', $id))
            ->byStatus($filters['status'] ?? null)
            ->orderByDesc('maintenance_date')
            ->paginate($perPage);
    }

    public function showMaintenanceRecord(int $id): AssetMaintenanceRecord
    {
        return AssetMaintenanceRecord::query()->with(['asset', 'reportedBy'])->findOrFail($id);
    }

    public function storeMaintenanceRecord(array $data): AssetMaintenanceRecord
    {
        $data['reported_by_user_id'] = auth()->id();

        $record = AssetMaintenanceRecord::create($data);

        if (($data['status'] ?? 'reported') !== 'resolved') {
            Asset::where('id', $data['asset_id'])->update(['status' => 'in_maintenance']);
        }

        return $record->load(['asset', 'reportedBy']);
    }

    public function updateMaintenanceRecord(int $id, array $data): AssetMaintenanceRecord
    {
        $record = AssetMaintenanceRecord::findOrFail($id);
        $record->update($data);

        if ($record->status === 'resolved') {
            $record->update(['resolved_at' => now()]);
            // Return the asset to available only if it has no active assignment.
            $asset = $record->asset;
            if ($asset && !$asset->activeAssignment()) {
                $asset->update(['status' => 'available']);
            }
        }

        return $record->load(['asset', 'reportedBy']);
    }

    public function destroyMaintenanceRecord(int $id): bool
    {
        return (bool) AssetMaintenanceRecord::findOrFail($id)->delete();
    }

    // ---- QR codes ----

    public function scan(string $qrCode): Asset
    {
        return Asset::query()
            ->with(['category', 'location', 'assignments.assignee'])
            ->withCount(['openMaintenanceRecords as open_maintenance_count'])
            ->where('qr_code', $qrCode)
            ->firstOrFail();
    }

    public function regenerateQr(int $id): Asset
    {
        $asset = Asset::findOrFail($id);
        $asset->update(['qr_code' => $this->generateQrCode()]);

        return $asset->fresh();
    }

    public function generateQrDataUrl(string $code): string
    {
        $writer = new Writer(new GDLibRenderer(200, 4, 'png', 9));

        return 'data:image/png;base64,' . base64_encode($writer->writeString($code));
    }

    private function resolveAssignee(string $type, int $id): ?\Illuminate\Database\Eloquent\Model
    {
        return match ($type) {
            'student' => Student::find($id),
            'employee' => Employee::find($id),
            'robotics_team' => RoboticsTeam::find($id),
            default => null,
        };
    }

    private function generateAssetCode(): string
    {
        do {
            $code = 'AST-' . strtoupper(Str::random(8));
        } while (Asset::where('asset_code', $code)->exists());

        return $code;
    }

    private function generateQrCode(): string
    {
        do {
            $code = 'AST-' . strtoupper(Str::random(10));
        } while (Asset::where('qr_code', $code)->exists());

        return $code;
    }
}
