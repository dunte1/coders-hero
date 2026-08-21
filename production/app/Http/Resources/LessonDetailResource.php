<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LessonDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'course_id' => $this->course_id,
            'module_name' => $this->module_name,
            'title' => $this->title,
            'slug' => $this->slug,
            'content' => $this->content,
            'video_url' => $this->video_url,
            'duration_minutes' => $this->duration_minutes,
            'sort_order' => $this->sort_order,
            'is_free' => $this->is_free,
            'type' => $this->type,
            'quiz' => new QuizResource($this->whenLoaded('quiz')),
            'course' => new CourseResource($this->whenLoaded('course')),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}
