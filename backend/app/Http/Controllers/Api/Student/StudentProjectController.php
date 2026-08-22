<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProjectReviewRequest;
use App\Http\Requests\StoreStudentProjectRequest;
use App\Http\Requests\UpdateStudentProjectRequest;
use App\Models\ProjectReview;
use App\Models\Student;
use App\Services\StudentProjectService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentProjectController extends Controller
{
    use ApiResponse;

    public function __construct(
        private StudentProjectService $projectService
    ) {}

    public function index(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->first();

            if (!$student) {
                return $this->forbiddenResponse('No student profile found.');
            }

            $projects = $this->projectService->index($student);

            return $this->paginatedResponse($projects, 'Projects retrieved successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve projects: ' . $e->getMessage(), 500);
        }
    }

    public function store(StoreStudentProjectRequest $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->first();

            if (!$student) {
                return $this->forbiddenResponse('No student profile found.');
            }

            $project = $this->projectService->store($student, $request->validated());

            return $this->createdResponse($project, 'Project created successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create project: ' . $e->getMessage(), 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->first();

            if (!$student) {
                return $this->forbiddenResponse('No student profile found.');
            }

            $project = $this->projectService->show($student, $id);

            if (!$project) {
                return $this->notFoundResponse('Project not found.');
            }

            return $this->successResponse($project, 'Project retrieved successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve project: ' . $e->getMessage(), 500);
        }
    }

    public function update(UpdateStudentProjectRequest $request, int $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->first();

            if (!$student) {
                return $this->forbiddenResponse('No student profile found.');
            }

            $project = $this->projectService->update($student, $id, $request->validated());

            if (!$project) {
                return $this->notFoundResponse('Project not found.');
            }

            return $this->successResponse($project, 'Project updated successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update project: ' . $e->getMessage(), 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->first();

            if (!$student) {
                return $this->forbiddenResponse('No student profile found.');
            }

            $deleted = $this->projectService->destroy($student, $id);

            if (!$deleted) {
                return $this->notFoundResponse('Project not found.');
            }

            return $this->noContentResponse('Project deleted successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete project: ' . $e->getMessage(), 500);
        }
    }

    public function publish(int $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->first();

            if (!$student) {
                return $this->forbiddenResponse('No student profile found.');
            }

            $project = $this->projectService->publish($student, $id);

            if (!$project) {
                return $this->notFoundResponse('Project not found.');
            }

            return $this->successResponse($project, 'Project published successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to publish project: ' . $e->getMessage(), 500);
        }
    }

    public function unpublish(int $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->first();

            if (!$student) {
                return $this->forbiddenResponse('No student profile found.');
            }

            $project = $this->projectService->unpublish($student, $id);

            if (!$project) {
                return $this->notFoundResponse('Project not found.');
            }

            return $this->successResponse($project, 'Project unpublished successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to unpublish project: ' . $e->getMessage(), 500);
        }
    }

    public function uploadMedia(Request $request, int $id): JsonResponse
    {
        try {
            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->first();

            if (!$student) {
                return $this->forbiddenResponse('No student profile found.');
            }

            $request->validate([
                'file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,mp4', 'max:20480'],
                'type' => ['required', 'in:image,video'],
            ]);

            $media = $this->projectService->uploadMedia(
                $student,
                $id,
                $request->file('file'),
                $request->input('type')
            );

            if (!$media) {
                return $this->notFoundResponse('Project not found.');
            }

            return $this->createdResponse($media, 'Media uploaded successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->validationErrorResponse($e->errors(), 'Validation failed.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to upload media: ' . $e->getMessage(), 500);
        }
    }

    public function deleteMedia(int $id, int $mediaId): JsonResponse
    {
        try {
            $user = Auth::user();
            $student = Student::where('user_id', $user->id)->first();

            if (!$student) {
                return $this->forbiddenResponse('No student profile found.');
            }

            $deleted = $this->projectService->deleteMedia($student, $id, $mediaId);

            if (!$deleted) {
                return $this->notFoundResponse('Media not found.');
            }

            return $this->noContentResponse('Media deleted successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete media: ' . $e->getMessage(), 500);
        }
    }

    public function review(ProjectReviewRequest $request, int $projectId): JsonResponse
    {
        try {
            $this->authorize('viewAny', ProjectReview::class);

            $user = Auth::user();

            $project = \App\Models\StudentProject::with('student')->find($projectId);

            if (!$project) {
                return $this->notFoundResponse('Project not found.');
            }

            $review = $this->projectService->review($project, $request->validated(), $user->id);

            return $this->createdResponse($review, 'Review submitted successfully.');
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return $this->forbiddenResponse('You are not authorized to review projects.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to submit review: ' . $e->getMessage(), 500);
        }
    }

    public function publicIndex(Request $request): JsonResponse
    {
        try {
            $projects = $this->projectService->publicIndex();

            return $this->paginatedResponse($projects, 'Published projects retrieved successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve projects: ' . $e->getMessage(), 500);
        }
    }
}
