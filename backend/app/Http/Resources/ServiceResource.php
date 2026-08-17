<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'short_description' => $this->short_description,
            'icon' => $this->icon,
            'image' => $this->image,
            'image_url' => $this->image_url,
            'features' => $this->features ?? [],
            'sort_order' => $this->sort_order,
            'is_active' => $this->is_active,
            'meta' => $this->meta ?? [],
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
