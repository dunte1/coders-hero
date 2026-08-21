<?php

namespace App\Services\Teachers;

use App\Models\LessonNote;

class LessonNoteService
{
    public function getAll(string $teacherUserId, array $filters = [], int $perPage = 20)
    {
        return LessonNote::query()
            ->with(['lesson', 'schoolClass'])
            ->byTeacher($teacherUserId)
            ->when(!empty($filters['class_id']), function ($query) use ($filters) {
                return $query->where('class_id', $filters['class_id']);
            })
            ->when(!empty($filters['lesson_id']), function ($query) use ($filters) {
                return $query->where('lesson_id', $filters['lesson_id']);
            })
            ->when(!empty($filters['from']), function ($query) use ($filters) {
                return $query->whereDate('note_date', '>=', $filters['from']);
            })
            ->when(!empty($filters['to']), function ($query) use ($filters) {
                return $query->whereDate('note_date', '<=', $filters['to']);
            })
            ->when(!empty($filters['search']), function ($query) use ($filters) {
                return $query->where('title', 'like', "%{$filters['search']}%");
            })
            ->orderByDesc('note_date')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getById(int $id, string $teacherUserId): ?LessonNote
    {
        return LessonNote::query()
            ->byTeacher($teacherUserId)
            ->with(['lesson', 'schoolClass'])
            ->find($id);
    }

    public function create(string $teacherUserId, array $data): LessonNote
    {
        $data['teacher_user_id'] = $teacherUserId;
        $data['note_date'] = $data['note_date'] ?? now()->toDateString();

        return LessonNote::create($data);
    }

    public function update(int $id, string $teacherUserId, array $data): LessonNote
    {
        $note = $this->getById($id, $teacherUserId);

        if (!$note) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Lesson note not found.');
        }

        $note->update($data);

        return $note->fresh(['lesson', 'schoolClass']);
    }

    public function delete(int $id, string $teacherUserId): bool
    {
        $note = $this->getById($id, $teacherUserId);

        if (!$note) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Lesson note not found.');
        }

        return (bool) $note->delete();
    }

    public function attachFile(int $id, string $teacherUserId, $file): LessonNote
    {
        $note = $this->getById($id, $teacherUserId);

        if (!$note) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Lesson note not found.');
        }

        $attachments = $note->attachments ?? [];
        $attachments[] = [
            'path' => $file->store('lesson-notes', 'public'),
            'name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
        ];

        $note->update(['attachments' => $attachments]);

        return $note->fresh();
    }
}
