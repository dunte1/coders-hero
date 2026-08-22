<?php

namespace App\Services;

use App\Models\ProjectMedia;
use App\Models\ProjectReview;
use App\Models\Student;
use App\Models\StudentProject;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class StudentProjectService
{
    public function index(Student $student)
    {
        return StudentProject::byStudent($student->id)
            ->withCount('media')
            ->latest()
            ->paginate(20);
    }

    public function store(Student $student, array $data): StudentProject
    {
        return StudentProject::create([
            'student_id' => $student->id,
            'user_id' => $student->user_id,
            'title' => $data['title'],
            'problem_statement' => $data['problem_statement'] ?? null,
            'description' => $data['description'] ?? null,
            'technologies' => $data['technologies'] ?? null,
            'repo_url' => $data['repo_url'] ?? null,
            'demo_url' => $data['demo_url'] ?? null,
            'status' => $data['status'] ?? 'planning',
        ]);
    }

    public function show(Student $student, int $id): ?StudentProject
    {
        return StudentProject::byStudent($student->id)
            ->with(['media', 'reviews.reviewer'])
            ->find($id);
    }

    public function update(Student $student, int $id, array $data): ?StudentProject
    {
        $project = StudentProject::byStudent($student->id)->find($id);

        if (!$project) {
            return null;
        }

        $project->update($data);

        return $project;
    }

    public function destroy(Student $student, int $id): bool
    {
        $project = StudentProject::byStudent($student->id)->find($id);

        if (!$project) {
            return false;
        }

        foreach ($project->media as $media) {
            Storage::disk('public')->delete($media->path);
        }

        $project->delete();

        return true;
    }

    public function publish(Student $student, int $id): ?StudentProject
    {
        $project = StudentProject::byStudent($student->id)->find($id);

        if (!$project) {
            return null;
        }

        $project->update([
            'is_published' => true,
            'published_at' => now(),
        ]);

        return $project;
    }

    public function unpublish(Student $student, int $id): ?StudentProject
    {
        $project = StudentProject::byStudent($student->id)->find($id);

        if (!$project) {
            return null;
        }

        $project->update([
            'is_published' => false,
            'published_at' => null,
        ]);

        return $project;
    }

    public function uploadMedia(Student $student, int $id, UploadedFile $file, string $type): ?ProjectMedia
    {
        $project = StudentProject::byStudent($student->id)->find($id);

        if (!$project) {
            return null;
        }

        $path = $file->store('project-media/' . $project->id, 'public');
        $maxOrder = $project->media()->max('sort_order') ?? 0;

        return $project->media()->create([
            'type' => $type,
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'sort_order' => $maxOrder + 1,
        ]);
    }

    public function deleteMedia(Student $student, int $projectId, int $mediaId): bool
    {
        $project = StudentProject::byStudent($student->id)->find($projectId);

        if (!$project) {
            return false;
        }

        $media = $project->media()->find($mediaId);

        if (!$media) {
            return false;
        }

        Storage::disk('public')->delete($media->path);
        $media->delete();

        return true;
    }

    public function review(Student $project, array $data, int $reviewerId): ProjectReview
    {
        $review = $project->reviews()->create([
            'reviewer_id' => $reviewerId,
            'score' => $data['score'],
            'feedback' => $data['feedback'] ?? null,
            'status' => $data['status'],
        ]);

        if ($data['status'] === 'approved') {
            $averageScore = $project->reviews()
                ->where('status', 'approved')
                ->avg('score');

            $project->update(['final_score' => (int) round($averageScore)]);
        }

        return $review;
    }

    public function publicIndex()
    {
        return StudentProject::published()
            ->with('user:id,name,avatar')
            ->withCount('media')
            ->latest('published_at')
            ->paginate(20);
    }
}
