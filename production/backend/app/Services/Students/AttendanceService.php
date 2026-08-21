<?php

namespace App\Services\Students;

use App\Models\Attendance;
use App\Models\Student;
use Illuminate\Support\Carbon;

class AttendanceService
{
    public function getAll(array $filters = [], int $perPage = 30)
    {
        return Attendance::query()
            ->with('student')
            ->forDate($filters['date'] ?? now()->toDateString())
            ->when(!empty($filters['student_id']), function ($query) use ($filters) {
                return $query->forStudent((int) $filters['student_id']);
            })
            ->byStatus($filters['status'] ?? null)
            ->orderBy('attendance_date', 'desc')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function forStudent(int $studentId, array $filters = [], int $perPage = 30)
    {
        return Attendance::query()
            ->forStudent($studentId)
            ->when(!empty($filters['from']), function ($query) use ($filters) {
                return $query->whereDate('attendance_date', '>=', $filters['from']);
            })
            ->when(!empty($filters['to']), function ($query) use ($filters) {
                return $query->whereDate('attendance_date', '<=', $filters['to']);
            })
            ->byStatus($filters['status'] ?? null)
            ->orderByDesc('attendance_date')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function recordForStudent(Student $student, string $date, string $status, ?string $checkIn = null, ?string $checkOut = null, ?string $note = null): Attendance
    {
        $attendance = Attendance::where('student_id', $student->id)
            ->whereDate('attendance_date', $date)
            ->first();

        if ($attendance) {
            $attendance->update([
                'status' => $status,
                'check_in' => $checkIn,
                'check_out' => $checkOut,
                'note' => $note,
                'recorded_by' => auth()->id(),
            ]);

            return $attendance;
        }

        return Attendance::create([
            'student_id' => $student->id,
            'attendance_date' => $date,
            'status' => $status,
            'check_in' => $checkIn,
            'check_out' => $checkOut,
            'note' => $note,
            'recorded_by' => auth()->id(),
        ]);
    }

    public function bulkRecord(array $entries, string $date, ?string $defaultStatus = 'present'): array
    {
        $records = [];

        foreach ($entries as $entry) {
            $student = Student::find($entry['student_id'] ?? null);
            if (!$student) {
                continue;
            }

            $records[] = $this->recordForStudent(
                $student,
                $date,
                $entry['status'] ?? $defaultStatus,
                $entry['check_in'] ?? null,
                $entry['check_out'] ?? null,
                $entry['note'] ?? null
            );
        }

        return $records;
    }

    public function update(int $id, array $data): Attendance
    {
        $attendance = Attendance::findOrFail($id);
        $attendance->update($data);

        return $attendance->fresh('student');
    }

    public function delete(int $id): bool
    {
        return Attendance::findOrFail($id)->delete();
    }

    public function report(array $filters = []): array
    {
        $from = $filters['from'] ?? now()->startOfMonth()->toDateString();
        $to = $filters['to'] ?? now()->endOfMonth()->toDateString();

        $students = Student::query()
            ->with('guardian')
            ->search($filters['search'] ?? null)
            ->byStatus($filters['status'] ?? null)
            ->byGrade($filters['grade'] ?? null)
            ->get();

        $rows = [];

        foreach ($students as $student) {
            $records = Attendance::forStudent($student->id)
                ->whereDate('attendance_date', '>=', $from)
                ->whereDate('attendance_date', '<=', $to)
                ->get();

            $total = max($records->count(), 1);
            $present = $records->whereIn('status', ['present', 'late'])->count();
            $late = $records->where('status', 'late')->count();
            $absent = $records->where('status', 'absent')->count();
            $excused = $records->where('status', 'excused')->count();

            $rows[] = [
                'student_id' => $student->id,
                'student' => $student->full_name,
                'student_code' => $student->student_id,
                'grade' => $student->grade,
                'guardian' => $student->guardian?->full_name,
                'present' => $present,
                'late' => $late,
                'absent' => $absent,
                'excused' => $excused,
                'total' => $records->count(),
                'rate' => round(($present / $total) * 100, 1),
            ];
        }

        $totals = [
            'present' => array_sum(array_column($rows, 'present')),
            'late' => array_sum(array_column($rows, 'late')),
            'absent' => array_sum(array_column($rows, 'absent')),
            'excused' => array_sum(array_column($rows, 'excused')),
        ];

        return [
            'from' => $from,
            'to' => $to,
            'students' => $rows,
            'totals' => $totals,
            'records_count' => Attendance::whereDate('attendance_date', '>=', $from)->whereDate('attendance_date', '<=', $to)->count(),
        ];
    }

    public function monthlySummary(int $studentId, ?string $month = null): array
    {
        $date = $month ? Carbon::parse($month . '-01') : now();

        $records = Attendance::forStudent($studentId)
            ->whereDate('attendance_date', '>=', $date->copy()->startOfMonth()->toDateString())
            ->whereDate('attendance_date', '<=', $date->copy()->endOfMonth()->toDateString())
            ->get();

        return [
            'month' => $date->format('Y-m'),
            'present' => $records->whereIn('status', ['present', 'late'])->count(),
            'late' => $records->where('status', 'late')->count(),
            'absent' => $records->where('status', 'absent')->count(),
            'excused' => $records->where('status', 'excused')->count(),
            'total' => $records->count(),
        ];
    }
}
