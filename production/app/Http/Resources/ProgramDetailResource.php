<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProgramDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'tagline' => $this->tagline,
            'description' => $this->description,
            'long_description' => $this->long_description,
            'category' => $this->category,
            'level' => $this->level,
            'age_group' => $this->age_group,
            'duration_weeks' => $this->duration_weeks,
            'sessions_per_week' => $this->sessions_per_week,
            'price' => $this->price,
            'price_suffix' => $this->price_suffix,
            'image' => $this->image,
            'image_url' => $this->image_url,
            'curriculum' => $this->curriculum ?? [],
            'outcomes' => $this->outcomes ?? [],
            'is_featured' => $this->is_featured,
            'is_active' => $this->is_active,
            'meta' => $this->meta ?? [],
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
