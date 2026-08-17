<?php

namespace App\Http\Resources\Library;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class LibraryResourceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $downloadUrl = null;
        $streamUrl = null;

        if ($this->file_path) {
            if ($this->download_allowed || $request->user()?->can('library.download')) {
                $downloadUrl = Storage::disk('local')->temporaryUrl(
                    $this->file_path,
                    now()->addMinutes(15),
                    ['filename' => $this->title . '.' . ($this->mime_type ? $this->extensionFromMime($this->mime_type) : 'pdf')]
                );
            }

            $streamUrl = Storage::disk('local')->temporaryUrl($this->file_path, now()->addMinutes(15));
        }

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'resource_type' => $this->resource_type,
            'category_id' => $this->category_id,
            'category' => $this->whenLoaded('category', fn () => new LibraryCategoryResource($this->category)),
            'author_id' => $this->author_id,
            'author' => $this->whenLoaded('author', fn () => new LibraryAuthorResource($this->author)),
            'file_size' => $this->file_size,
            'file_size_human' => $this->file_size ? $this->humanFileSize($this->file_size) : null,
            'mime_type' => $this->mime_type,
            'cover_image' => $this->cover_image,
            'cover_image_url' => $this->cover_image ? url('storage/' . $this->cover_image) : null,
            'language' => $this->language,
            'is_public' => $this->is_public,
            'download_allowed' => $this->download_allowed,
            'is_active' => $this->is_active,
            'view_count' => $this->view_count,
            'is_borrowed' => $this->resource->isBorrowed(),
            'active_borrowing' => $this->resource->activeBorrowing()
                ? new LibraryBorrowingResource($this->resource->activeBorrowing())
                : null,
            'download_url' => $downloadUrl,
            'stream_url' => $streamUrl,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    private function extensionFromMime(string $mime): string
    {
        return match ($mime) {
            'application/pdf' => 'pdf',
            'video/mp4' => 'mp4',
            'application/zip' => 'zip',
            'text/markdown' => 'md',
            'text/plain' => 'txt',
            default => 'pdf',
        };
    }

    private function humanFileSize(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = 0;
        while ($bytes >= 1024 && $i < count($units) - 1) {
            $bytes /= 1024;
            $i++;
        }

        return round($bytes, 1) . ' ' . $units[$i];
    }
}
