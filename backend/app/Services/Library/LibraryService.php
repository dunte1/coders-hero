<?php

namespace App\Services\Library;

use App\Models\LibraryBorrowing;
use App\Models\LibraryCategory;
use App\Models\LibraryReadingHistory;
use App\Models\LibraryReservation;
use App\Models\LibraryResource;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class LibraryService
{
    public function summary(): array
    {
        $activeBorrowings = LibraryBorrowing::active()->count();
        $overdue = LibraryBorrowing::active()->where('due_at', '<', now())->count();

        return [
            'total_resources' => LibraryResource::count(),
            'active_resources' => LibraryResource::active()->count(),
            'public_resources' => LibraryResource::active()->public()->count(),
            'total_categories' => LibraryCategory::active()->count(),
            'active_borrowings' => $activeBorrowings,
            'overdue_borrowings' => $overdue,
            'pending_reservations' => LibraryReservation::pending()->count(),
            'total_reads' => (int) LibraryReadingHistory::sum('times_read'),
            'resources_by_type' => LibraryResource::active()
                ->selectRaw('resource_type, count(*) as count')
                ->groupBy('resource_type')
                ->orderBy('resource_type')
                ->get()
                ->pluck('count', 'resource_type')
                ->toArray(),
        ];
    }

    public function categories(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return LibraryCategory::query()
            ->withCount('resources')
            ->search($filters['search'] ?? null)
            ->orderBy('name')
            ->paginate($perPage);
    }

    public function allCategories(): \Illuminate\Database\Eloquent\Collection
    {
        return LibraryCategory::active()->orderBy('name')->get();
    }

    public function storeCategory(array $data): LibraryCategory
    {
        $data['created_by_user_id'] = auth()->id();

        return LibraryCategory::create($data);
    }

    public function updateCategory(int $id, array $data): LibraryCategory
    {
        $category = LibraryCategory::findOrFail($id);
        $category->update($data);

        return $category->fresh();
    }

    public function destroyCategory(int $id): bool
    {
        $category = LibraryCategory::findOrFail($id);
        LibraryResource::where('category_id', $id)->update(['category_id' => null]);

        return (bool) $category->delete();
    }

    public function authors(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return \App\Models\LibraryAuthor::query()
            ->withCount('resources')
            ->search($filters['search'] ?? null)
            ->orderBy('name')
            ->paginate($perPage);
    }

    public function allAuthors(): \Illuminate\Database\Eloquent\Collection
    {
        return \App\Models\LibraryAuthor::orderBy('name')->get();
    }

    public function storeAuthor(array $data): \App\Models\LibraryAuthor
    {
        $data['created_by_user_id'] = auth()->id();

        return \App\Models\LibraryAuthor::create($data);
    }

    public function updateAuthor(int $id, array $data): \App\Models\LibraryAuthor
    {
        $author = \App\Models\LibraryAuthor::findOrFail($id);
        $author->update($data);

        return $author->fresh();
    }

    public function destroyAuthor(int $id): bool
    {
        $author = \App\Models\LibraryAuthor::findOrFail($id);
        LibraryResource::where('author_id', $id)->update(['author_id' => null]);

        return (bool) $author->delete();
    }

    public function resources(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return LibraryResource::query()
            ->with(['category', 'author'])
            ->withCount(['borrowings'])
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

    public function showResource(int $id): LibraryResource
    {
        $resource = LibraryResource::query()
            ->with(['category', 'author', 'activeBorrowing.user'])
            ->findOrFail($id);

        if ($resource->is_active && $resource->is_public) {
            $resource->increment('view_count');
            $this->recordRead(auth()->id(), $resource);
        }

        return $resource;
    }

    public function borrow(int $id, array $data): LibraryBorrowing
    {
        $resource = LibraryResource::findOrFail($id);

        if (! $resource->is_active) {
            throw new \InvalidArgumentException('This resource is not available.');
        }

        if ($resource->isBorrowed()) {
            throw new \InvalidArgumentException('This resource is currently borrowed.');
        }

        if (! auth()->user()) {
            throw new \InvalidArgumentException('Authentication required.');
        }

        return LibraryBorrowing::create([
            'resource_id' => $id,
            'user_id' => auth()->id(),
            'borrowed_at' => now(),
            'due_at' => $data['due_at'] ?? now()->addDays(14),
            'status' => 'borrowed',
            'note' => $data['note'] ?? null,
        ]);
    }

    public function findBorrowing(int $borrowingId): ?LibraryBorrowing
    {
        return LibraryBorrowing::find($borrowingId);
    }

    public function returnBorrowing(int $borrowingId): LibraryBorrowing
    {
        $borrowing = LibraryBorrowing::findOrFail($borrowingId);
        $borrowing->update([
            'returned_at' => now(),
            'status' => 'returned',
        ]);

        // Fulfil the oldest pending reservation for this resource, if any.
        $reservation = LibraryReservation::pending()
            ->where('resource_id', $borrowing->resource_id)
            ->oldest('reserved_at')
            ->first();

        if ($reservation) {
            $reservation->update(['status' => 'fulfilled', 'expires_at' => now()->addDays(7)]);
        }

        return $borrowing->fresh();
    }

    public function reserve(int $id, array $data): LibraryReservation
    {
        $resource = LibraryResource::findOrFail($id);

        if (! $resource->is_active) {
            throw new \InvalidArgumentException('This resource is not available.');
        }

        if ($resource->isBorrowed() === false && $resource->is_public) {
            throw new \InvalidArgumentException('This resource is available — borrow it directly instead of reserving.');
        }

        $existing = LibraryReservation::pending()
            ->where('resource_id', $id)
            ->where('user_id', auth()->id())
            ->first();

        if ($existing) {
            throw new \InvalidArgumentException('You already have a pending reservation for this resource.');
        }

        return LibraryReservation::create([
            'resource_id' => $id,
            'user_id' => auth()->id(),
            'reserved_at' => now(),
            'expires_at' => now()->addDays(7),
            'status' => 'pending',
            'note' => $data['note'] ?? null,
        ]);
    }

    public function cancelReservation(int $reservationId): LibraryReservation
    {
        $reservation = LibraryReservation::findOrFail($reservationId);

        if ($reservation->user_id !== auth()->id() && ! auth()->user()?->can('library.manage')) {
            throw new \InvalidArgumentException('You cannot cancel this reservation.');
        }

        $reservation->update(['status' => 'cancelled', 'expires_at' => now()]);

        return $reservation->fresh();
    }

    public function recordRead(?string $userId, LibraryResource $resource): void
    {
        if (! $userId) {
            return;
        }

        $history = LibraryReadingHistory::where('resource_id', $resource->id)
            ->where('user_id', $userId)
            ->first();

        if ($history) {
            $history->update(['read_at' => now(), 'times_read' => $history->times_read + 1]);
        } else {
            LibraryReadingHistory::create([
                'resource_id' => $resource->id,
                'user_id' => $userId,
                'read_at' => now(),
                'times_read' => 1,
            ]);
        }
    }

    public function myBorrowings(?string $userId, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return LibraryBorrowing::query()
            ->with(['resource.category', 'resource.author'])
            ->where('user_id', $userId)
            ->when(($filters['status'] ?? null) && $filters['status'] !== 'all', fn (Builder $q) => $q->where('status', $filters['status']))
            ->orderByDesc('borrowed_at')
            ->paginate($perPage);
    }

    public function myReservations(?string $userId, int $perPage = 15): LengthAwarePaginator
    {
        return LibraryReservation::query()
            ->with(['resource.category', 'resource.author'])
            ->where('user_id', $userId)
            ->orderByDesc('reserved_at')
            ->paginate($perPage);
    }

    public function myHistory(?string $userId, int $perPage = 15): LengthAwarePaginator
    {
        return LibraryReadingHistory::query()
            ->with(['resource.category', 'resource.author'])
            ->where('user_id', $userId)
            ->orderByDesc('read_at')
            ->paginate($perPage);
    }

    public function allBorrowings(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return LibraryBorrowing::query()
            ->with(['resource', 'user'])
            ->when(($filters['status'] ?? null) && $filters['status'] !== 'all', fn (Builder $q) => $q->where('status', $filters['status']))
            ->when(($filters['overdue'] ?? null) === '1', fn (Builder $q) => $q->active()->where('due_at', '<', now()))
            ->orderByDesc('borrowed_at')
            ->paginate($perPage);
    }

    public function allReservations(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return LibraryReservation::query()
            ->with(['resource', 'user'])
            ->when(($filters['status'] ?? null) && $filters['status'] !== 'all', fn (Builder $q) => $q->where('status', $filters['status']))
            ->orderByDesc('reserved_at')
            ->paginate($perPage);
    }
}
