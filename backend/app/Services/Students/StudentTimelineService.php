<?php

namespace App\Services\Students;

use App\Models\StudentTimelineEntry;

class StudentTimelineService
{
    public function list(int $studentId, array $filters = [], int $perPage = 30)
    {
        return StudentTimelineEntry::query()
            ->where('student_id', $studentId)
            ->byType($filters['type'] ?? null)
            ->when(!empty($filters['from']), function ($query) use ($filters) {
                return $query->where('occurred_on', '>=', $filters['from']);
            })
            ->when(!empty($filters['to']), function ($query) use ($filters) {
                return $query->where('occurred_on', '<=', $filters['to']);
            })
            ->orderByDesc('occurred_on')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function store(int $studentId, array $data): StudentTimelineEntry
    {
        return StudentTimelineEntry::create([
            'student_id' => $studentId,
            'event_type' => $data['event_type'] ?? 'note',
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'occurred_on' => $data['occurred_on'] ?? now()->toDateString(),
            'meta' => $data['meta'] ?? null,
        ]);
    }

    public function delete(int $id): bool
    {
        return StudentTimelineEntry::findOrFail($id)->delete();
    }

    public function log(int $studentId, string $eventType, string $title, ?string $description = null, ?string $occurredOn = null, ?array $meta = null): StudentTimelineEntry
    {
        return $this->store($studentId, [
            'event_type' => $eventType,
            'title' => $title,
            'description' => $description,
            'occurred_on' => $occurredOn ?? now()->toDateString(),
            'meta' => $meta,
        ]);
    }
}
