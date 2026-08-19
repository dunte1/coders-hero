<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlogPostDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'content' => $this->content,
            'category' => $this->category,
            'tags' => $this->tags ?? [],
            'cover_image' => $this->cover_image,
            'cover_url' => $this->cover_url,
            'status' => $this->status,
            'is_featured' => $this->is_featured,
            'published_at' => $this->published_at?->toISOString(),
            'author' => $this->whenLoaded('author', fn () => [
                'id' => $this->author?->id,
                'name' => trim(($this->author?->first_name ?? '') . ' ' . ($this->author?->last_name ?? '')),
                'avatar' => $this->author?->avatar,
            ]),
            'views' => $this->views,
            'reading_minutes' => $this->reading_minutes,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'meta' => $this->meta ?? [],
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
