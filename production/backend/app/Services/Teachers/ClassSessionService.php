<?php

namespace App\Services\Teachers;

use App\Models\ClassSession;
use App\Models\SchoolClass;
use App\Models\Student;

class ClassSessionService
{
    public function index(array $filters = [], int $perPage = 20): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        $user = auth()->user();
        $query = ClassSession::query()
            ->with(['schoolClass', 'teacher'])
            ->when(!empty($filters['class_id']), fn ($q) => $q->where('class_id', $filters['class_id']))
            ->when(!empty($filters['status']) && $filters['status'] !== 'all', fn ($q) => $q->where('status', $filters['status']))
            ->when(!empty($filters['type']) && $filters['type'] !== 'all', fn ($q) => $q->where('type', $filters['type']))
            ->when(!empty($filters['search']), fn ($q) => $q->where('title', 'like', "%{$filters['search']}%"));

        if ($user->hasAnyRole(['teacher', 'instructor'])) {
            $query->where('teacher_id', $user->id);
        } elseif ($user->hasRole('student')) {
            $student = Student::where('user_id', $user->id)->first();
            if ($student) {
                $classIds = $student->schoolClasses()->pluck('classes.id')->all();
                $query->whereIn('class_id', $classIds);
            } else {
                $query->whereRaw('0 = 1');
            }
        }

        return $query->orderByDesc('scheduled_at')->paginate($perPage)->withQueryString();
    }

    public function teacherIndex(array $filters = [], int $perPage = 20): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        $userId = auth()->id();

        return ClassSession::query()
            ->with(['schoolClass', 'teacher'])
            ->where('teacher_id', $userId)
            ->when(!empty($filters['class_id']), fn ($q) => $q->where('class_id', $filters['class_id']))
            ->when(!empty($filters['status']) && $filters['status'] !== 'all', fn ($q) => $q->where('status', $filters['status']))
            ->when(!empty($filters['type']) && $filters['type'] !== 'all', fn ($q) => $q->where('type', $filters['type']))
            ->when(!empty($filters['search']), fn ($q) => $q->where('title', 'like', "%{$filters['search']}%"))
            ->orderByDesc('scheduled_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function studentIndex(array $filters = [], int $perPage = 20): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        $user = auth()->user();
        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return ClassSession::query()
                ->whereRaw('0 = 1')
                ->paginate($perPage);
        }

        $classIds = $student->schoolClasses()->pluck('classes.id')->all();

        return ClassSession::query()
            ->with(['schoolClass', 'teacher'])
            ->whereIn('class_id', $classIds)
            ->when(!empty($filters['class_id']), fn ($q) => $q->where('class_id', $filters['class_id']))
            ->when(!empty($filters['status']) && $filters['status'] !== 'all', fn ($q) => $q->where('status', $filters['status']))
            ->when(!empty($filters['type']) && $filters['type'] !== 'all', fn ($q) => $q->where('type', $filters['type']))
            ->when(!empty($filters['search']), fn ($q) => $q->where('title', 'like', "%{$filters['search']}%"))
            ->orderByDesc('scheduled_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function show(int $id): ?ClassSession
    {
        $user = auth()->user();

        $session = ClassSession::with(['schoolClass', 'teacher'])->find($id);

        if (!$session) {
            return null;
        }

        if ($user->hasAnyRole(['teacher', 'instructor']) && $session->teacher_id !== $user->id) {
            return null;
        }

        if ($user->hasRole('student')) {
            $student = Student::where('user_id', $user->id)->first();
            if (!$student || !$student->schoolClasses()->where('classes.id', $session->class_id)->exists()) {
                return null;
            }
        }

        return $session;
    }

    public function store(array $data): ClassSession
    {
        $data['teacher_id'] = auth()->id();

        return ClassSession::create($data);
    }

    public function update(int $id, array $data): ClassSession
    {
        $session = ClassSession::where('teacher_id', auth()->id())->findOrFail($id);
        $session->update($data);

        return $session->fresh(['schoolClass', 'teacher']);
    }

    public function destroy(int $id): bool
    {
        $session = ClassSession::where('teacher_id', auth()->id())->findOrFail($id);

        return (bool) $session->delete();
    }
}
