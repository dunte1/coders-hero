<?php

namespace App\Http\Resources\Library;

use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LibraryBorrowingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'resource_id' => $this->resource_id,
            'resource' => $this->whenLoaded('resource', fn () => new LibraryResourceResource($this->resource->resource)),
            'user_id' => $this->user_id,
            'user' => $this->whenLoaded('user', fn () => new UserResource($this->user)),
            'borrowed_at' => $this->borrowed_at?->toISOString(),
            'due_at' => $this->due_at?->toISOString(),
            'returned_at' => $this->returned_at?->toISOString(),
            'status' => $this->status,
            'is_overdue' => $this->isOverdue(),
            'note' => $this->note,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
