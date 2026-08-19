<?php

namespace App\Http\Resources\Inventory;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetCategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'is_active' => $this->is_active,
            'assets_count' => $this->whenCounted('assets'),
            'items_count' => $this->whenCounted('inventoryItems'),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
