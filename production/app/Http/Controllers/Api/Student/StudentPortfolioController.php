<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Student;
use App\Models\StudentProject;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class StudentPortfolioController extends Controller
{
    use ApiResponse;

    public function show(string $studentId): JsonResponse
    {
        try {
            $student = Student::with(['user', 'schoolClasses'])->find($studentId);

            if (!$student) {
                return $this->notFoundResponse('Student not found.');
            }

            $projects = StudentProject::where('student_id', $studentId)
                ->published()
                ->with('media')
                ->get();

            $certificates = Certificate::where('student_id', $studentId)
                ->latest()
                ->get();

            return $this->successResponse([
                'student' => $student,
                'projects' => $projects,
                'certificates' => $certificates,
            ], 'Portfolio retrieved successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve portfolio: ' . $e->getMessage(), 500);
        }
    }
}
