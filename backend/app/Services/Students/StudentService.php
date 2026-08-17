<?php

namespace App\Services\Students;

use App\Models\Attendance;
use App\Models\Student;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class StudentService
{
    public function __construct(
        private StudentTimelineService $timelineService
    ) {}

    public function getAll(array $filters = [], int $perPage = 15)
    {
        return Student::query()
            ->with('guardian')
            ->search($filters['search'] ?? null)
            ->byStatus($filters['status'] ?? null)
            ->byGrade($filters['grade'] ?? null)
            ->when(isset($filters['branch']) && $filters['branch'] !== 'all', function ($query) use ($filters) {
                return $query->where('branch', $filters['branch']);
            })
            ->when(isset($filters['guardian_id']) && $filters['guardian_id'], function ($query) use ($filters) {
                return $query->where('guardian_id', $filters['guardian_id']);
            })
            ->orderBy('student_id')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getById(int $id): ?Student
    {
        return Student::with(['guardian', 'medicalRecord'])->find($id);
    }

    public function create(array $data): Student
    {
        $data['student_id'] = $data['student_id'] ?? $this->generateStudentId();
        $data['qr_code'] = $data['qr_code'] ?? $this->generateQrCode($data['student_id']);
        $data['status'] = $data['status'] ?? 'pending';

        $student = Student::create($data);

        $this->timelineService->log(
            $student->id,
            'admission',
            'Student admitted',
            'Student record created with ID ' . $student->student_id . '.',
            $data['admission_date'] ?? now()->toDateString(),
            ['status' => $student->status]
        );

        return $student->fresh('guardian');
    }

    public function update(int $id, array $data): Student
    {
        $student = Student::findOrFail($id);
        $student->update($data);

        return $student->fresh('guardian');
    }

    public function delete(int $id): bool
    {
        return Student::findOrFail($id)->delete();
    }

    public function uploadPhoto(Student $student, UploadedFile|string $photo): Student
    {
        if ($photo instanceof UploadedFile) {
            $path = $photo->storeAs('students', Str::uuid() . '.' . $photo->getClientOriginalExtension(), 'public');
        } else {
            $path = $this->storeBase64Photo($photo);
        }

        if (!$path) {
            throw new \InvalidArgumentException('Could not store photo.');
        }

        if ($student->photo) {
            Storage::disk('public')->delete($student->photo);
        }

        $student->update(['photo' => $path]);

        return $student->fresh('guardian');
    }

    public function promote(Student $student, ?string $newGrade = null): Student
    {
        $previousGrade = $student->grade;
        $newGrade = $newGrade ?? $this->nextGrade($previousGrade);

        $student->update(['grade' => $newGrade, 'status' => 'active']);

        $this->timelineService->log(
            $student->id,
            'promotion',
            'Promoted to ' . ($newGrade ?: 'next level'),
            'Promoted from "' . ($previousGrade ?: 'unassigned') . '" to "' . ($newGrade ?: 'next level') . '".',
            now()->toDateString(),
            ['previous_grade' => $previousGrade, 'new_grade' => $newGrade]
        );

        return $student->fresh('guardian');
    }

    public function transfer(Student $student, string $newBranch, ?string $note = null): Student
    {
        $previousBranch = $student->branch;

        $student->update(['branch' => $newBranch, 'status' => 'active']);

        $this->timelineService->log(
            $student->id,
            'transfer',
            'Transferred to ' . $newBranch,
            $note ?: 'Transferred from "' . ($previousBranch ?: 'unassigned') . '" to "' . $newBranch . '".',
            now()->toDateString(),
            ['previous_branch' => $previousBranch, 'new_branch' => $newBranch]
        );

        return $student->fresh('guardian');
    }

    public function graduate(Student $student, ?string $graduationDate = null): Student
    {
        $student->update([
            'status' => 'graduated',
            'graduation_date' => $graduationDate ?: now()->toDateString(),
        ]);

        $this->timelineService->log(
            $student->id,
            'graduation',
            'Graduated',
            $student->full_name . ' has graduated successfully.',
            now()->toDateString(),
            ['grade' => $student->grade]
        );

        return $student->fresh('guardian');
    }

    public function overview(): array
    {
        $students = Student::query();

        return [
            'total_students' => (clone $students)->count(),
            'active_students' => (clone $students)->where('status', 'active')->count(),
            'pending_students' => (clone $students)->where('status', 'pending')->count(),
            'graduated_students' => (clone $students)->where('status', 'graduated')->count(),
            'transferred_students' => (clone $students)->where('status', 'transferred')->count(),
            'suspended_students' => (clone $students)->where('status', 'suspended')->count(),
            'status_breakdown' => (clone $students)->selectRaw('status, COUNT(*) as count')
                ->groupBy('status')
                ->orderBy('count', 'desc')
                ->get()
                ->map(fn ($row) => ['status' => $row->status, 'count' => (int) $row->count]),
            'gender_breakdown' => (clone $students)->selectRaw('gender, COUNT(*) as count')
                ->groupBy('gender')
                ->get()
                ->map(fn ($row) => ['gender' => $row->gender ?? 'unspecified', 'count' => (int) $row->count]),
            'grade_breakdown' => (clone $students)->whereNotNull('grade')
                ->selectRaw('grade, COUNT(*) as count')
                ->groupBy('grade')
                ->orderBy('grade')
                ->get()
                ->map(fn ($row) => ['grade' => $row->grade, 'count' => (int) $row->count]),
            'admitted_this_month' => (clone $students)->where('admission_date', '>=', now()->startOfMonth())->count(),
            'today_attendance' => [
                'present' => Attendance::forDate(now()->toDateString())->whereIn('status', ['present', 'late'])->count(),
                'absent' => Attendance::forDate(now()->toDateString())->where('status', 'absent')->count(),
                'late' => Attendance::forDate(now()->toDateString())->where('status', 'late')->count(),
                'excused' => Attendance::forDate(now()->toDateString())->where('status', 'excused')->count(),
            ],
        ];
    }

    public function distinctGrades(): array
    {
        return Student::query()
            ->whereNotNull('grade')
            ->distinct()
            ->orderBy('grade')
            ->pluck('grade')
            ->all();
    }

    public function distinctBranches(): array
    {
        return Student::query()
            ->whereNotNull('branch')
            ->distinct()
            ->orderBy('branch')
            ->pluck('branch')
            ->all();
    }

    public function generateStudentId(): string
    {
        $lastStudent = Student::withTrashed()->latest('id')->first();
        $number = $lastStudent ? intval(substr($lastStudent->student_id, 3)) + 1 : 1;

        return 'STU' . str_pad((string) $number, 5, '0', STR_PAD_LEFT);
    }

    public function generateQrCode(string $studentId): string
    {
        return 'CH|' . $studentId . '|' . Str::uuid()->toString();
    }

    private function nextGrade(?string $grade): ?string
    {
        if ($grade && preg_match('/^(\D*)(\d+)(\D*)$/', $grade, $matches)) {
            return $matches[1] . ((int) $matches[2] + 1) . $matches[3];
        }

        return $grade;
    }

    private function storeBase64Photo(string $data): string
    {
        if (!Str::startsWith($data, 'data:image')) {
            throw new \InvalidArgumentException('Invalid image data.');
        }

        $parts = explode(',', $data, 2);
        $decoded = base64_decode($parts[1] ?? '', true);

        if ($decoded === false || $decoded === '') {
            throw new \InvalidArgumentException('Could not decode image data.');
        }

        $extension = 'png';
        if (preg_match('/data:image\/([a-zA-Z0-9]+)/', $parts[0], $matches) && in_array($matches[1], ['png', 'jpg', 'jpeg', 'webp'])) {
            $extension = $matches[1];
        }

        $filename = 'students/' . Str::uuid() . '.' . $extension;
        Storage::disk('public')->put($filename, $decoded);

        return $filename;
    }
}
