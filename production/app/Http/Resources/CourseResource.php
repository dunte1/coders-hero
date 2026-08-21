<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'objectives' => $this->objectives,
            'prerequisites' => $this->prerequisites,
            'level' => $this->level,
            'duration_hours' => (float) $this->duration_hours,
            'price' => (float) $this->price,
            'thumbnail' => $this->thumb_url,
            'status' => $this->status,
            'published_at' => $this->published_at?->toISOString(),
            'max_enrollments' => $this->max_enrollments,
            'is_featured' => $this->is_featured,
            'meta' => $this->meta,
            'enrollment_count' => $this->whenCounted('enrollments'),
            'lessons_count' => $this->whenCounted('lessons'),
            'is_enrollable' => $this->when(isset($this->resource->enrollment_count), fn () => $this->is_enrollable),
            'category' => new CategoryResource($this->whenLoaded('category')),
            'instructor' => new UserResource($this->whenLoaded('instructor')),
            'lessons' => LessonResource::collection($this->whenLoaded('lessons')),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
