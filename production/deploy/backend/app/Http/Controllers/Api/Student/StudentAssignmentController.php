<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\Student;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class StudentAssignmentController extends Controller
{
    use ApiResponse;

    public function index(Request $request): JsonResponse
    {
        $user = auth()->user();
        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return $this->forbiddenResponse('No student profile found.');
        }

        $classIds = $student->schoolClasses()->pluck('classes.id');

        $query = Assignment::published()
            ->whereIn('class_id', $classIds)
            ->with(['teacher', 'schoolClass', 'course']);

        if ($request->filled('course_id')) {
            $query->where('course_id', $request->course_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $assignments = $query->orderBy('due_at', 'desc')
            ->paginate((int) $request->get('per_page', 20));

        $assignments->getCollection()->transform(function ($assignment) use ($student) {
            $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
                ->where('student_id', $student->id)
                ->first();

            return [
                'id' => $assignment->id,
                'title' => $assignment->title,
                'description' => $assignment->description,
                'type' => $assignment->type,
                'max_score' => $assignment->max_score,
                'due_at' => $assignment->due_at,
                'status' => $assignment->status,
                'is_overdue' => $assignment->is_overdue,
                'teacher' => $assignment->teacher?->only(['id', 'name']),
                'class' => $assignment->schoolClass?->only(['id', 'name']),
                'course' => $assignment->course?->only(['id', 'title']),
                'submission' => $submission ? [
                    'id' => $submission->id,
                    'status' => $submission->status,
                    'score' => $submission->score,
                    'submitted_at' => $submission->submitted_at,
                ] : null,
            ];
        });

        return $this->paginatedResponse($assignments, 'Assignments retrieved successfully.');
    }

    public function show(int $id): JsonResponse
    {
        $user = auth()->user();
        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return $this->forbiddenResponse('No student profile found.');
        }

        $classIds = $student->schoolClasses()->pluck('classes.id');

        $assignment = Assignment::published()
            ->whereIn('class_id', $classIds)
            ->with(['teacher', 'schoolClass', 'course'])
            ->find($id);

        if (!$assignment) {
            return $this->notFoundResponse('Assignment not found.');
        }

        $submission = AssignmentSubmission::where('assignment_id', $assignment->id)
            ->where('student_id', $student->id)
            ->first();

        $data = [
            'id' => $assignment->id,
            'title' => $assignment->title,
            'description' => $assignment->description,
            'instructions' => $assignment->instructions,
            'type' => $assignment->type,
            'max_score' => $assignment->max_score,
            'due_at' => $assignment->due_at,
            'status' => $assignment->status,
            'is_overdue' => $assignment->is_overdue,
            'attachments' => $assignment->attachments,
            'teacher' => $assignment->teacher?->only(['id', 'name']),
            'class' => $assignment->schoolClass?->only(['id', 'name']),
            'course' => $assignment->course?->only(['id', 'title']),
            'submission' => $submission ? [
                'id' => $submission->id,
                'content' => $submission->content,
                'file_name' => $submission->file_name,
                'status' => $submission->status,
                'score' => $submission->score,
                'feedback' => $submission->feedback,
                'is_late' => $submission->is_late,
                'submitted_at' => $submission->submitted_at,
                'graded_at' => $submission->graded_at,
            ] : null,
        ];

        return $this->successResponse($data, 'Assignment retrieved successfully.');
    }

    public function submit(Request $request, int $id): JsonResponse
    {
        $user = auth()->user();
        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return $this->forbiddenResponse('No student profile found.');
        }

        $classIds = $student->schoolClasses()->pluck('classes.id');

        $assignment = Assignment::published()
            ->whereIn('class_id', $classIds)
            ->find($id);

        if (!$assignment) {
            return $this->notFoundResponse('Assignment not found.');
        }

        if ($assignment->due_at && $assignment->due_at->isPast()) {
            return $this->errorResponse('This assignment is past its due date.', 422);
        }

        $existing = AssignmentSubmission::where('assignment_id', $id)
            ->where('student_id', $student->id)
            ->first();

        if ($existing && $existing->status === 'graded') {
            return $this->errorResponse('This submission has already been graded.', 422);
        }

        $request->validate([
            'content' => 'required_without:file|max:10000',
            'file' => 'file|max:10240|mimes:pdf,doc,docx,txt,zip',
        ]);

        $filePath = null;
        $fileName = null;

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $fileName = $file->getClientOriginalName();
            $filePath = $file->store('assignments/' . $id, 'public');
        }

        $isLate = $assignment->due_at && now()->isAfter($assignment->due_at);

        if ($existing) {
            $existing->update([
                'content' => $request->input('content', $existing->content),
                'file_path' => $filePath ?? $existing->file_path,
                'file_name' => $fileName ?? $existing->file_name,
                'status' => 'submitted',
                'is_late' => $isLate,
                'submitted_at' => now(),
                'score' => null,
                'feedback' => null,
            ]);
            $submission = $existing;
        } else {
            $submission = AssignmentSubmission::create([
                'assignment_id' => $id,
                'student_id' => $student->id,
                'content' => $request->input('content'),
                'file_path' => $filePath,
                'file_name' => $fileName,
                'status' => 'submitted',
                'is_late' => $isLate,
                'submitted_at' => now(),
            ]);
        }

        return $this->createdResponse($submission, 'Assignment submitted successfully.');
    }

    public function mySubmissions(Request $request): JsonResponse
    {
        $user = auth()->user();
        $student = Student::where('user_id', $user->id)->first();

        if (!$student) {
            return $this->forbiddenResponse('No student profile found.');
        }

        $query = AssignmentSubmission::where('student_id', $student->id)
            ->with(['assignment.teacher', 'assignment.course']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $submissions = $query->orderBy('submitted_at', 'desc')
            ->paginate((int) $request->get('per_page', 20));

        return $this->paginatedResponse($submissions, 'Submissions retrieved successfully.');
    }
}
