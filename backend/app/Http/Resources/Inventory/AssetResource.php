<?php

namespace App\Http\Resources\Inventory;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'asset_code' => $this->asset_code,
            'name' => $this->name,
            'category_id' => $this->asset_category_id,
            'category' => $this->whenLoaded('category', fn () => new AssetCategoryResource($this->category)),
            'location_id' => $this->location_id,
            'location' => $this->whenLoaded('location', fn () => new LocationResource($this->location)),
            'serial_number' => $this->serial_number,
            'qr_code' => $this->qr_code,
            'status' => $this->status,
            'condition' => $this->condition,
            'purchase_date' => $this->purchase_date?->toDateString(),
            'purchase_cost' => $this->purchase_cost !== null ? (float) $this->purchase_cost : null,
            'supplier' => $this->supplier,
            'notes' => $this->notes,
            'robotics_equipment_id' => $this->robotics_equipment_id,
            'robotics_equipment' => $this->whenLoaded('roboticsEquipment', fn () => [
                'id' => $this->roboticsEquipment->id,
                'name' => $this->roboticsEquipment->name,
                'type' => $this->roboticsEquipment->type,
                'sku' => $this->roboticsEquipment->sku,
            ]),
            'active_assignment' => $this->whenLoaded('assignments', function () {
                $active = $this->assignments->firstWhere('returned_at', null);

                return $active ? new AssetAssignmentResource($active) : null;
            }),
            'assignments_count' => $this->whenCounted('assignments'),
            'maintenance_count' => $this->whenCounted('maintenanceRecords'),
            'open_maintenance_count' => $this->whenCounted('openMaintenanceRecords'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
