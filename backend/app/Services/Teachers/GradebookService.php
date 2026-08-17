<?php

namespace App\Services\Teachers;

use App\Models\GradebookEntry;
use App\Models\SchoolClass;
use App\Models\Student;

class GradebookService
{
    public const COMPONENTS = ['assignment', 'exam', 'quiz', 'participation', 'homework', 'project', 'final'];

    public function entries(int $classId, string $teacherUserId, array $filters = [], int $perPage = 50)
    {
        $class = SchoolClass::byTeacher($teacherUserId)->find($classId);

        if (!$class) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Class not found.');
        }

        return GradebookEntry::query()
            ->with('student')
            ->where('class_id', $classId)
            ->when(!empty($filters['student_id']), function ($query) use ($filters) {
                return $query->where('student_id', $filters['student_id']);
            })
            ->when(!empty($filters['component']) && $filters['component'] !== 'all', function ($query) use ($filters) {
                return $query->where('component', $filters['component']);
            })
            ->orderByDesc('graded_on')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(int $classId, string $teacherUserId, array $data): GradebookEntry
    {
        $class = SchoolClass::byTeacher($teacherUserId)->find($classId);

        if (!$class) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Class not found.');
        }

        if (!$class->students()->where('students.id', $data['student_id'])->exists()) {
            throw new \InvalidArgumentException('Student is not enrolled in this class.');
        }

        return GradebookEntry::create(array_merge($data, [
            'class_id' => $classId,
            'teacher_user_id' => $teacherUserId,
        ]));
    }

    public function update(int $entryId, string $teacherUserId, array $data): GradebookEntry
    {
        $entry = $this->findOwned($entryId, $teacherUserId);
        $entry->update($data);

        return $entry->fresh('student');
    }

    public function delete(int $entryId, string $teacherUserId): bool
    {
        $entry = $this->findOwned($entryId, $teacherUserId);

        return (bool) $entry->delete();
    }

    public function bulkCreate(int $classId, string $teacherUserId, array $entries): array
    {
        $class = SchoolClass::byTeacher($teacherUserId)->find($classId);

        if (!$class) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Class not found.');
        }

        $enrolledIds = $class->students()->pluck('students.id')->all();

        $created = [];

        foreach ($entries as $entry) {
            $studentId = (int) ($entry['student_id'] ?? 0);

            if (!in_array($studentId, $enrolledIds)) {
                continue;
            }

            $created[] = GradebookEntry::create(array_merge($entry, [
                'class_id' => $classId,
                'teacher_user_id' => $teacherUserId,
                'student_id' => $studentId,
            ]));
        }

        return $created;
    }

    public function studentSummary(int $classId, string $teacherUserId, int $studentId): array
    {
        $class = SchoolClass::byTeacher($teacherUserId)->find($classId);

        if (!$class) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Class not found.');
        }

        $entries = GradebookEntry::query()
            ->where('class_id', $classId)
            ->where('student_id', $studentId)
            ->get();

        $grouped = $entries->groupBy('component');

        $components = collect(self::COMPONENTS)->mapWithKeys(function ($component) use ($grouped) {
            $items = $grouped->get($component, collect());

            return [
                $component => [
                    'count' => $items->count(),
                    'earned' => $items->sum('score'),
                    'possible' => $items->sum('max_score'),
                    'percentage' => $items->sum('max_score') > 0
                        ? round(($items->sum('score') / $items->sum('max_score')) * 100, 2)
                        : 0,
                ],
            ];
        });

        $totalWeight = 0;
        $weightedScore = 0;

        foreach ($grouped as $component => $items) {
            $componentWeight = $items->first()?->weight ?? 1;
            $totalWeight += $componentWeight;
            $percentage = $items->sum('max_score') > 0
                ? ($items->sum('score') / $items->sum('max_score')) * 100
                : 0;
            $weightedScore += $percentage * $componentWeight;
        }

        $overall = $totalWeight > 0 ? round($weightedScore / $totalWeight, 2) : 0;

        return [
            'student' => Student::find($studentId),
            'components' => $components,
            'entries_count' => $entries->count(),
            'overall_percentage' => $overall,
            'letter_grade' => $this->letterGrade($overall),
        ];
    }

    public function classSummary(int $classId, string $teacherUserId): array
    {
        $class = SchoolClass::byTeacher($teacherUserId)->with('students')->find($classId);

        if (!$class) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Class not found.');
        }

        $students = $class->students->sortBy('first_name')->values();

        $rows = $students->map(function (Student $student) use ($classId) {
            $entries = GradebookEntry::where('class_id', $classId)
                ->where('student_id', $student->id)
                ->get();

            $totalWeight = 0;
            $weightedScore = 0;

            foreach ($entries->groupBy('component') as $items) {
                $componentWeight = $items->first()?->weight ?? 1;
                $totalWeight += $componentWeight;
                $percentage = $items->sum('max_score') > 0
                    ? ($items->sum('score') / $items->sum('max_score')) * 100
                    : 0;
                $weightedScore += $percentage * $componentWeight;
            }

            $overall = $totalWeight > 0 ? round($weightedScore / $totalWeight, 2) : null;

            return [
                'student_id' => $student->id,
                'name' => $student->full_name,
                'student_code' => $student->student_id,
                'entries_count' => $entries->count(),
                'overall_percentage' => $overall,
                'letter_grade' => $overall !== null ? $this->letterGrade($overall) : '—',
            ];
        });

        $averages = $rows->filter(fn ($r) => $r['overall_percentage'] !== null);

        return [
            'class' => $class,
            'students' => $rows,
            'average' => $averages->count() > 0
                ? round($averages->avg('overall_percentage'), 2)
                : 0,
            'highest' => $averages->max('overall_percentage') ?? 0,
            'lowest' => $averages->min('overall_percentage') ?? 0,
            'passed_count' => $averages->filter(fn ($r) => $r['overall_percentage'] >= 50)->count(),
        ];
    }

    protected function findOwned(int $entryId, string $teacherUserId): GradebookEntry
    {
        $entry = GradebookEntry::where('id', $entryId)
            ->where('teacher_user_id', $teacherUserId)
            ->first();

        if (!$entry) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Gradebook entry not found.');
        }

        return $entry;
    }

    protected function letterGrade(float $percentage): string
    {
        return match (true) {
            $percentage >= 90 => 'A+',
            $percentage >= 80 => 'A',
            $percentage >= 70 => 'B',
            $percentage >= 60 => 'C',
            $percentage >= 50 => 'D',
            default => 'F',
        };
    }
}
