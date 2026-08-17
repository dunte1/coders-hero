<?php

namespace App\Services\Students;

use App\Models\Admission;
use Illuminate\Support\Str;

class AdmissionService
{
    public function __construct(
        private StudentService $studentService
    ) {}

    public function getAll(array $filters = [], int $perPage = 15)
    {
        return Admission::query()
            ->search($filters['search'] ?? null)
            ->byStatus($filters['status'] ?? null)
            ->when(isset($filters['grade']) && $filters['grade'] !== 'all', function ($query) use ($filters) {
                return $query->where('grade', $filters['grade']);
            })
            ->orderByDesc('applied_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getById(int $id): ?Admission
    {
        return Admission::with('student')->find($id);
    }

    public function create(array $data): Admission
    {
        $data['application_number'] = $data['application_number'] ?? $this->generateApplicationNumber();
        $data['applied_at'] = $data['applied_at'] ?? now()->toDateString();
        $data['status'] = $data['status'] ?? 'new';

        return Admission::create($data);
    }

    public function update(int $id, array $data): Admission
    {
        $admission = Admission::findOrFail($id);
        $admission->update($data);

        return $admission->fresh('student');
    }

    public function delete(int $id): bool
    {
        return Admission::findOrFail($id)->delete();
    }

    public function admit(int $id): Admission
    {
        $admission = Admission::findOrFail($id);

        if ($admission->isAdmitted()) {
            return $admission->fresh('student');
        }

        $student = $this->studentService->create([
            'guardian_id' => null,
            'first_name' => $admission->first_name,
            'last_name' => $admission->last_name,
            'gender' => $admission->gender,
            'date_of_birth' => $admission->date_of_birth,
            'grade' => $admission->grade,
            'branch' => $admission->preferred_branch,
            'admission_date' => now()->toDateString(),
            'status' => 'active',
        ]);

        $admission->update([
            'student_id' => $student->id,
            'status' => 'admitted',
            'decided_at' => now()->toDateString(),
        ]);

        return $admission->fresh('student');
    }

    public function reject(int $id): Admission
    {
        $admission = Admission::findOrFail($id);
        $admission->update([
            'status' => 'rejected',
            'decided_at' => now()->toDateString(),
        ]);

        return $admission->fresh('student');
    }

    public function generateApplicationNumber(): string
    {
        $lastAdmission = Admission::withTrashed()->latest('id')->first();
        $number = $lastAdmission ? intval(substr($lastAdmission->application_number, 3)) + 1 : 1;

        return 'APP' . str_pad((string) $number, 6, '0', STR_PAD_LEFT);
    }
}
