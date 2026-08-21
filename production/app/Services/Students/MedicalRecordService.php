<?php

namespace App\Services\Students;

use App\Models\MedicalRecord;
use App\Models\Student;

class MedicalRecordService
{
    public function getForStudent(int $studentId): ?MedicalRecord
    {
        return MedicalRecord::where('student_id', $studentId)->first();
    }

    public function store(Student $student, array $data): MedicalRecord
    {
        $medical = MedicalRecord::updateOrCreate(
            ['student_id' => $student->id],
            $data
        );

        return $medical->fresh();
    }

    public function update(Student $student, array $data): MedicalRecord
    {
        $medical = MedicalRecord::firstOrNew(['student_id' => $student->id]);

        foreach ($data as $key => $value) {
            $medical->{$key} = $value;
        }

        $medical->student_id = $student->id;
        $medical->save();

        return $medical->fresh();
    }

    public function delete(int $studentId): bool
    {
        return MedicalRecord::where('student_id', $studentId)->delete() > 0;
    }
}
