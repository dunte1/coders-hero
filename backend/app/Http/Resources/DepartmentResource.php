<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepartmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'manager_id' => $this->manager_id,
            'parent_id' => $this->parent_id,
            'is_active' => $this->is_active,
            'manager' => new UserResource($this->whenLoaded('manager')),
            'parent' => new DepartmentResource($this->whenLoaded('parent')),
            'children' => DepartmentResource::collection($this->whenLoaded('children')),
            'employees_count' => $this->whenCounted('employees'),
            'positions_count' => $this->whenCounted('positions'),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
