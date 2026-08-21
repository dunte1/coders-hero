<?php

namespace App\Services\Teachers;

use App\Models\Attendance;
use App\Models\SchoolClass;
use App\Models\Student;
use Illuminate\Support\Str;

class TeacherClassService
{
    public function getAll(string $teacherUserId, array $filters = [], int $perPage = 20)
    {
        return SchoolClass::query()
            ->withCount('students')
            ->byTeacher($teacherUserId)
            ->when(!empty($filters['search']), function ($query) use ($filters) {
                return $query->where(function ($q) use ($filters) {
                    $q->where('name', 'like', "%{$filters['search']}%")
                        ->orWhere('subject', 'like', "%{$filters['search']}%");
                });
            })
            ->when(!empty($filters['status']) && $filters['status'] !== 'all', function ($query) use ($filters) {
                return $query->where('status', $filters['status']);
            })
            ->orderByDesc('updated_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getById(int $id, string $teacherUserId): ?SchoolClass
    {
        return SchoolClass::query()
            ->byTeacher($teacherUserId)
            ->with(['students' => fn ($q) => $q->active()->orderBy('first_name')])
            ->find($id);
    }

    public function create(string $teacherUserId, array $data): SchoolClass
    {
        $data['teacher_user_id'] = $teacherUserId;
        $data['color'] = $data['color'] ?? '#' . substr(md5((string) mt_rand()), 0, 6);

        $class = SchoolClass::create($data);

        if (!empty($data['student_ids'])) {
            $class->students()->syncWithPivotValues($data['student_ids'], ['enrolled_at' => now()]);
        }

        return $class->fresh('students');
    }

    public function update(int $id, string $teacherUserId, array $data): SchoolClass
    {
        $class = $this->getById($id, $teacherUserId);

        if (!$class) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Class not found.');
        }

        $class->update(collect($data)->except('student_ids')->toArray());

        if (array_key_exists('student_ids', $data)) {
            $class->students()->syncWithPivotValues($data['student_ids'] ?? [], ['enrolled_at' => now()]);
        }

        return $class->fresh('students');
    }

    public function delete(int $id, string $teacherUserId): bool
    {
        $class = $this->getById($id, $teacherUserId);

        if (!$class) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Class not found.');
        }

        return (bool) $class->delete();
    }

    public function addStudents(int $id, string $teacherUserId, array $studentIds): SchoolClass
    {
        $class = $this->getById($id, $teacherUserId);

        if (!$class) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Class not found.');
        }

        $class->students()->syncWithPivotValues($studentIds, ['enrolled_at' => now()], false);

        return $class->fresh('students');
    }

    public function removeStudent(int $id, string $teacherUserId, int $studentId): SchoolClass
    {
        $class = $this->getById($id, $teacherUserId);

        if (!$class) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Class not found.');
        }

        $class->students()->detach($studentId);

        return $class->fresh('students');
    }

    public function studentsByGrade(?string $grade = null)
    {
        return Student::query()
            ->active()
            ->when($grade && $grade !== 'all', function ($query) use ($grade) {
                return $query->where('grade', $grade);
            })
            ->orderBy('first_name')
            ->get();
    }

    public function grades(): array
    {
        return Student::query()
            ->active()
            ->select('grade')
            ->distinct()
            ->orderBy('grade')
            ->pluck('grade')
            ->filter()
            ->values()
            ->toArray();
    }

    public function roster(int $id, string $teacherUserId, string $date)
    {
        $class = $this->getById($id, $teacherUserId);

        if (!$class) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Class not found.');
        }

        $students = $class->students()->active()->orderBy('first_name')->get();

        $records = Attendance::query()
            ->forDate($date)
            ->whereIn('student_id', $students->pluck('id'))
            ->get()
            ->keyBy('student_id');

        return $students->map(function (Student $student) use ($records, $date) {
            $attendance = $records->get($student->id);

            return [
                'student' => $student,
                'attendance_date' => $date,
                'status' => $attendance?->status ?? 'unmarked',
                'check_in' => $attendance?->check_in?->format('H:i'),
                'check_out' => $attendance?->check_out?->format('H:i'),
                'note' => $attendance?->note,
                'attendance_id' => $attendance?->id,
            ];
        });
    }

    public function recordAttendance(int $id, string $teacherUserId, string $date, array $entries): array
    {
        $class = $this->getById($id, $teacherUserId);

        if (!$class) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Class not found.');
        }

        $classStudentIds = $class->students()->pluck('students.id')->all();

        $records = [];

        foreach ($entries as $entry) {
            $studentId = (int) ($entry['student_id'] ?? 0);

            if (!in_array($studentId, $classStudentIds)) {
                continue;
            }

            $status = $entry['status'] ?? 'present';
            if (!in_array($status, ['present', 'absent', 'late', 'excused'])) {
                $status = 'present';
            }

            $attendance = Attendance::where('student_id', $studentId)
                ->whereDate('attendance_date', $date)
                ->first();

            $payload = [
                'status' => $status,
                'check_in' => $entry['check_in'] ?? null,
                'check_out' => $entry['check_out'] ?? null,
                'note' => $entry['note'] ?? null,
                'recorded_by' => $teacherUserId,
            ];

            if ($attendance) {
                $attendance->update($payload);
                $records[] = $attendance->fresh('student');
            } else {
                $records[] = Attendance::create(array_merge($payload, [
                    'student_id' => $studentId,
                    'attendance_date' => $date,
                ]));
            }
        }

        return $records;
    }

    public function attendanceSummary(int $id, string $teacherUserId, ?string $month = null): array
    {
        $class = $this->getById($id, $teacherUserId);

        if (!$class) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Class not found.');
        }

        $date = $month ? \Carbon\Carbon::parse($month . '-01') : now();
        $from = $date->copy()->startOfMonth()->toDateString();
        $to = $date->copy()->endOfMonth()->toDateString();

        $studentIds = $class->students()->pluck('students.id');

        $records = Attendance::query()
            ->whereIn('student_id', $studentIds)
            ->whereDate('attendance_date', '>=', $from)
            ->whereDate('attendance_date', '<=', $to)
            ->get();

        return [
            'month' => $date->format('Y-m'),
            'present' => $records->whereIn('status', ['present', 'late'])->count(),
            'late' => $records->where('status', 'late')->count(),
            'absent' => $records->where('status', 'absent')->count(),
            'excused' => $records->where('status', 'excused')->count(),
            'total' => $records->count(),
            'rate' => $records->count() > 0
                ? round(($records->whereIn('status', ['present', 'late'])->count() / $records->count()) * 100, 1)
                : 0,
        ];
    }
}
