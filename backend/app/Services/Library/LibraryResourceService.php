<?php

namespace App\Services\Library;

use App\Models\LibraryResource;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class LibraryResourceService
{
    public function index(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return LibraryResource::query()
            ->with(['category', 'author'])
            ->withCount('borrowings')
            ->search($filters['search'] ?? null)
            ->byType($filters['type'] ?? null)
            ->byCategory(isset($filters['category_id']) ? (int) $filters['category_id'] : null)
            ->when(($filters['borrowed'] ?? null) === '1', fn (Builder $q) => $q->whereHas('borrowings', fn ($b) => $b->active()))
            ->when(($filters['mine'] ?? null) === '1' && auth()->user(), fn (Builder $q) => $q->where('created_by_user_id', auth()->id()))
            ->when(! ($filters['include_inactive'] ?? false), fn (Builder $q) => $q->active())
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function catalog(array $filters = [], int $perPage = 12): LengthAwarePaginator
    {
        return LibraryResource::query()
            ->with(['category', 'author'])
            ->active()
            ->public()
            ->search($filters['search'] ?? null)
            ->byType($filters['type'] ?? null)
            ->byCategory(isset($filters['category_id']) ? (int) $filters['category_id'] : null)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function show(int $id): LibraryResource
    {
        $resource = LibraryResource::query()
            ->with(['category', 'author'])
            ->findOrFail($id);

        $resource->increment('view_count');

        if ($resource->is_active && $resource->is_public && auth()->user()) {
            $history = \App\Models\LibraryReadingHistory::where('resource_id', $resource->id)
                ->where('user_id', auth()->id())
                ->first();

            if ($history) {
                $history->update(['read_at' => now(), 'times_read' => $history->times_read + 1]);
            } else {
                \App\Models\LibraryReadingHistory::create([
                    'resource_id' => $resource->id,
                    'user_id' => auth()->id(),
                    'read_at' => now(),
                    'times_read' => 1,
                ]);
            }
        }

        return $resource;
    }

    public function store(array $data, Request $request): LibraryResource
    {
        $file = $request->file('file');
        $cover = $request->file('cover_image');

        if ($file) {
            $path = $file->store('library', 'local');
            $data['file_path'] = $path;
            $data['file_size'] = $file->getSize();
            $data['mime_type'] = $file->getMimeType();
        }

        if ($cover) {
            $data['cover_image'] = $cover->store('library/covers', 'public');
        }

        $data['created_by_user_id'] = auth()->id();
        $data['slug'] = Str::slug($data['title'] ?? 'resource') . '-' . Str::lower(Str::random(6));

        return LibraryResource::create($data);
    }

    public function update(int $id, array $data, Request $request): LibraryResource
    {
        $resource = LibraryResource::findOrFail($id);

        $file = $request->file('file');
        $cover = $request->file('cover_image');

        if ($file) {
            if ($resource->file_path) {
                Storage::disk('local')->delete($resource->file_path);
            }
            $path = $file->store('library', 'local');
            $data['file_path'] = $path;
            $data['file_size'] = $file->getSize();
            $data['mime_type'] = $file->getMimeType();
        }

        if ($cover) {
            if ($resource->cover_image) {
                Storage::disk('public')->delete($resource->cover_image);
            }
            $data['cover_image'] = $cover->store('library/covers', 'public');
        }

        $resource->update($data);

        return $resource->fresh();
    }

    public function destroy(int $id): bool
    {
        $resource = LibraryResource::findOrFail($id);

        if ($resource->file_path) {
            Storage::disk('local')->delete($resource->file_path);
        }
        if ($resource->cover_image) {
            Storage::disk('public')->delete($resource->cover_image);
        }

        return (bool) $resource->delete();
    }
}
