<?php

namespace App\Http\Resources\Inventory;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InventoryItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'sku' => $this->sku,
            'category_id' => $this->asset_category_id,
            'category' => $this->whenLoaded('category', fn () => new AssetCategoryResource($this->category)),
            'location_id' => $this->location_id,
            'location' => $this->whenLoaded('location', fn () => new LocationResource($this->location)),
            'quantity' => $this->quantity,
            'unit' => $this->unit,
            'reorder_level' => $this->reorder_level,
            'unit_cost' => $this->unit_cost !== null ? (float) $this->unit_cost : null,
            'supplier' => $this->supplier,
            'notes' => $this->notes,
            'is_active' => $this->is_active,
            'is_low_stock' => $this->isLowStock(),
            'movements_count' => $this->whenCounted('movements'),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
