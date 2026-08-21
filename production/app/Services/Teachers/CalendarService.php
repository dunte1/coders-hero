<?php

namespace App\Services\Teachers;

use App\Models\CalendarEvent;
use Carbon\Carbon;

class CalendarService
{
    public function events(string $userId, array $filters = []): array
    {
        $from = $filters['from'] ?? Carbon::now()->startOfMonth()->toDateTimeString();
        $to = $filters['to'] ?? Carbon::now()->endOfMonth()->toDateTimeString();

        $query = CalendarEvent::query()
            ->with('schoolClass')
            ->where('user_id', $userId)
            ->between($from, $to);

        if (!empty($filters['class_id'])) {
            $query->where('class_id', $filters['class_id']);
        }

        if (!empty($filters['event_type']) && $filters['event_type'] !== 'all') {
            $query->where('event_type', $filters['event_type']);
        }

        return $query->orderBy('starts_at')->get()->toArray();
    }

    public function create(string $userId, array $data): CalendarEvent
    {
        return CalendarEvent::create(array_merge($data, ['user_id' => $userId]));
    }

    public function getById(int $id, string $userId): ?CalendarEvent
    {
        return CalendarEvent::where('id', $id)->where('user_id', $userId)->with('schoolClass')->first();
    }

    public function update(int $id, string $userId, array $data): CalendarEvent
    {
        $event = $this->getById($id, $userId);

        if (!$event) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Event not found.');
        }

        $event->update($data);

        return $event->fresh('schoolClass');
    }

    public function delete(int $id, string $userId): bool
    {
        $event = $this->getById($id, $userId);

        if (!$event) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Event not found.');
        }

        return (bool) $event->delete();
    }
}
