<?php

namespace App\Services\Teachers;

use App\Models\Exam;
use App\Models\ExamResult;

class ExamService
{
    public function getAll(string $teacherUserId, array $filters = [], int $perPage = 20)
    {
        return Exam::query()
            ->with('schoolClass')
            ->withCount('results')
            ->byTeacher($teacherUserId)
            ->when(!empty($filters['class_id']), function ($query) use ($filters) {
                return $query->where('class_id', $filters['class_id']);
            })
            ->when(!empty($filters['type']) && $filters['type'] !== 'all', function ($query) use ($filters) {
                return $query->where('type', $filters['type']);
            })
            ->when(!empty($filters['status']) && $filters['status'] !== 'all', function ($query) use ($filters) {
                return $query->where('status', $filters['status']);
            })
            ->when(!empty($filters['search']), function ($query) use ($filters) {
                return $query->where('title', 'like', "%{$filters['search']}%");
            })
            ->orderByDesc('scheduled_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getById(int $id, string $teacherUserId): ?Exam
    {
        return Exam::query()
            ->byTeacher($teacherUserId)
            ->with(['schoolClass', 'course', 'results.student'])
            ->find($id);
    }

    public function create(string $teacherUserId, array $data): Exam
    {
        $data['teacher_user_id'] = $teacherUserId;
        $data['status'] = $data['status'] ?? 'draft';

        $exam = Exam::create($data);

        if (!empty($data['results'])) {
            $this->syncResults($exam, $teacherUserId, $data['results']);
        }

        return $exam->fresh('results');
    }

    public function update(int $id, string $teacherUserId, array $data): Exam
    {
        $exam = $this->getById($id, $teacherUserId);

        if (!$exam) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Exam not found.');
        }

        $exam->update(collect($data)->except('results')->toArray());

        if (array_key_exists('results', $data)) {
            $this->syncResults($exam, $teacherUserId, $data['results']);
        }

        return $exam->fresh(['results.student', 'schoolClass']);
    }

    public function delete(int $id, string $teacherUserId): bool
    {
        $exam = $this->getById($id, $teacherUserId);

        if (!$exam) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Exam not found.');
        }

        return (bool) $exam->delete();
    }

    public function changeStatus(int $id, string $teacherUserId, string $status): Exam
    {
        return $this->update($id, $teacherUserId, ['status' => $status]);
    }

    public function gradeResults(int $id, string $teacherUserId, array $entries): Exam
    {
        $exam = $this->getById($id, $teacherUserId);

        if (!$exam) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Exam not found.');
        }

        $results = [];

        foreach ($entries as $entry) {
            $studentId = (int) ($entry['student_id'] ?? 0);

            if ($studentId <= 0) {
                continue;
            }

            $marks = isset($entry['marks_obtained']) ? (float) $entry['marks_obtained'] : null;
            $status = $entry['status'] ?? ($marks === null ? 'absent' : 'attempted');

            $result = ExamResult::updateOrCreate(
                ['exam_id' => $id, 'student_id' => $studentId],
                [
                    'marks_obtained' => $marks,
                    'percentage' => $marks !== null && $exam->total_marks > 0
                        ? round(($marks / $exam->total_marks) * 100, 2)
                        : null,
                    'grade' => $marks !== null ? $this->letterGrade($marks, $exam->total_marks) : null,
                    'remarks' => $entry['remarks'] ?? null,
                    'status' => $status,
                    'graded_by' => $teacherUserId,
                    'graded_at' => now(),
                ]
            );

            $results[] = $result;
        }

        if ($exam->status === 'scheduled' || $exam->status === 'in_progress') {
            $exam->update(['status' => 'completed']);
        }

        return $exam->fresh(['results.student']);
    }

    public function syncResults(Exam $exam, string $teacherUserId, array $entries): void
    {
        $this->gradeResults($exam->id, $teacherUserId, $entries);
    }

    public function letterGrade(float $marks, float $total): string
    {
        $percentage = $total > 0 ? ($marks / $total) * 100 : 0;

        return match (true) {
            $percentage >= 90 => 'A+',
            $percentage >= 80 => 'A',
            $percentage >= 70 => 'B',
            $percentage >= 60 => 'C',
            $percentage >= 50 => 'D',
            default => 'F',
        };
    }

    public function markResultAbsent(int $id, string $teacherUserId, array $studentIds): Exam
    {
        $exam = $this->getById($id, $teacherUserId);

        if (!$exam) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Exam not found.');
        }

        foreach ($studentIds as $studentId) {
            ExamResult::updateOrCreate(
                ['exam_id' => $id, 'student_id' => (int) $studentId],
                [
                    'marks_obtained' => null,
                    'percentage' => null,
                    'grade' => 'AB',
                    'status' => 'absent',
                    'graded_by' => $teacherUserId,
                    'graded_at' => now(),
                ]
            );
        }

        return $exam->fresh('results');
    }

    public function resultSummary(Exam $exam): array
    {
        $results = $exam->results;

        $attempted = $results->whereIn('status', ['attempted', 'graded']);
        $graded = $results->where('status', 'graded');

        return [
            'total_students' => $results->count(),
            'graded' => $graded->count(),
            'absent' => $results->where('status', 'absent')->count(),
            'average' => $attempted->whereNotNull('percentage')->avg('percentage')
                ? round($attempted->whereNotNull('percentage')->avg('percentage'), 2)
                : 0,
            'highest' => $attempted->whereNotNull('marks_obtained')->max('marks_obtained') ?? 0,
            'lowest' => $attempted->whereNotNull('marks_obtained')->min('marks_obtained') ?? 0,
            'passed' => $attempted->filter(fn ($r) => $r->percentage !== null && $r->percentage >= ($exam->passing_marks && $exam->total_marks > 0 ? ($exam->passing_marks / $exam->total_marks) * 100 : 50))->count(),
        ];
    }
}
