<?php

namespace App\Http\Resources\Inventory;

use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetMaintenanceRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'asset_id' => $this->asset_id,
            'asset' => $this->whenLoaded('asset', fn () => new AssetResource($this->asset)),
            'maintenance_date' => $this->maintenance_date?->toDateString(),
            'description' => $this->description,
            'status' => $this->status,
            'cost' => $this->cost !== null ? (float) $this->cost : null,
            'resolved_at' => $this->resolved_at?->toISOString(),
            'note' => $this->note,
            'reported_by' => $this->whenLoaded('reportedBy', fn () => new UserResource($this->reportedBy)),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
