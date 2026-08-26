<?php

namespace App\Services\Teachers;

use App\Models\Assignment;
use App\Models\AssignmentSubmission;
use App\Models\SchoolClass;
use Illuminate\Support\Facades\Storage;

class AssignmentService
{
    public function getAll(string $teacherUserId, array $filters = [], int $perPage = 20)
    {
        return Assignment::query()
            ->with('schoolClass')
            ->withCount('submissions')
            ->byTeacher($teacherUserId)
            ->when(!empty($filters['class_id']), function ($query) use ($filters) {
                return $query->where('class_id', $filters['class_id']);
            })
            ->when(!empty($filters['course_id']), function ($query) use ($filters) {
                return $query->where('course_id', $filters['course_id']);
            })
            ->when(!empty($filters['status']) && $filters['status'] !== 'all', function ($query) use ($filters) {
                return $query->where('status', $filters['status']);
            })
            ->when(!empty($filters['search']), function ($query) use ($filters) {
                return $query->where('title', 'like', "%{$filters['search']}%");
            })
            ->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function getById(int $id, string $teacherUserId): ?Assignment
    {
        return Assignment::query()
            ->byTeacher($teacherUserId)
            ->with(['schoolClass', 'course'])
            ->find($id);
    }

    public function create(string $teacherUserId, array $data): Assignment
    {
        $data['teacher_user_id'] = $teacherUserId;
        $data['published_at'] = ($data['status'] ?? 'draft') === 'published' ? now() : null;

        return Assignment::create($data);
    }

    public function update(int $id, string $teacherUserId, array $data): Assignment
    {
        $assignment = $this->getById($id, $teacherUserId);

        if (!$assignment) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Assignment not found.');
        }

        if (array_key_exists('status', $data) && $data['status'] === 'published' && !$assignment->published_at) {
            $data['published_at'] = now();
        }

        $assignment->update($data);

        return $assignment->fresh(['schoolClass', 'course']);
    }

    public function delete(int $id, string $teacherUserId): bool
    {
        $assignment = $this->getById($id, $teacherUserId);

        if (!$assignment) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Assignment not found.');
        }

        return (bool) $assignment->delete();
    }

    public function publish(int $id, string $teacherUserId): Assignment
    {
        return $this->update($id, $teacherUserId, ['status' => 'published']);
    }

    public function close(int $id, string $teacherUserId): Assignment
    {
        return $this->update($id, $teacherUserId, ['status' => 'closed']);
    }

    public function submissions(int $assignmentId, string $teacherUserId, array $filters = [], int $perPage = 20)
    {
        $assignment = $this->getById($assignmentId, $teacherUserId);

        if (!$assignment) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Assignment not found.');
        }

        return AssignmentSubmission::query()
            ->where('assignment_id', $assignmentId)
            ->with('student')
            ->when(!empty($filters['status']) && $filters['status'] !== 'all', function ($query) use ($filters) {
                return $query->where('status', $filters['status']);
            })
            ->when(!empty($filters['search']), function ($query) use ($filters) {
                return $query->whereHas('student', function ($q) use ($filters) {
                    $q->where('first_name', 'like', "%{$filters['search']}%")
                        ->orWhere('last_name', 'like', "%{$filters['search']}%")
                        ->orWhere('student_id', 'like', "%{$filters['search']}%");
                });
            })
            ->orderByRaw('CASE WHEN status = \'submitted\' THEN 0 ELSE 1 END')
            ->orderByDesc('submitted_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function gradeSubmission(int $submissionId, string $teacherUserId, array $data): AssignmentSubmission
    {
        $submission = AssignmentSubmission::with('assignment')->findOrFail($submissionId);

        if ($submission->assignment->teacher_user_id !== $teacherUserId) {
            throw new \Illuminate\Auth\Access\AuthorizationException('You cannot grade this submission.');
        }

        $submission->update([
            'score' => $data['score'] ?? null,
            'feedback' => $data['feedback'] ?? null,
            'status' => 'graded',
            'graded_by' => $teacherUserId,
            'graded_at' => now(),
        ]);

        if ($submission->assignment->class_id) {
            $submission->assignment->schoolClass?->gradebookEntries()->updateOrCreate(
                [
                    'student_id' => $submission->student_id,
                    'course_id' => $submission->assignment->course_id,
                    'component' => 'assignment',
                    'title' => $submission->assignment->title,
                ],
                [
                    'teacher_user_id' => $teacherUserId,
                    'score' => $submission->score ?? 0,
                    'max_score' => $submission->assignment->max_score,
                    'weight' => $submission->assignment->weight ?? 1.0,
                    'graded_on' => now()->toDateString(),
                ]
            );
        }

        return $submission->fresh(['student', 'assignment']);
    }

    public function missingList(int $assignmentId, string $teacherUserId): array
    {
        $assignment = $this->getById($assignmentId, $teacherUserId);

        if (!$assignment) {
            throw new \Illuminate\Database\Eloquent\ModelNotFoundException('Assignment not found.');
        }

        $class = $assignment->class_id ? SchoolClass::find($assignment->class_id) : null;

        if (!$class) {
            return [];
        }

        $submittedIds = $assignment->submissions()->pluck('student_id')->all();

        return $class->students()
            ->active()
            ->whereNotIn('students.id', $submittedIds)
            ->orderBy('first_name')
            ->get()
            ->toArray();
    }

    public function uploadAttachment($file, ?string $existingPath = null): ?string
    {
        if ($file) {
            $path = $file->store('assignments', 'public');
            if ($existingPath) {
                Storage::disk('public')->delete($existingPath);
            }
            return $path;
        }

        return $existingPath;
    }
}
