<?php

namespace App\Http\Resources\Library;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LibraryReadingHistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'resource_id' => $this->resource_id,
            'resource' => $this->whenLoaded('resource', fn () => new LibraryResourceResource($this->resource->resource)),
            'read_at' => $this->read_at?->toISOString(),
            'times_read' => $this->times_read,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
