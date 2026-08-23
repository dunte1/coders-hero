<?php

namespace App\Http\Controllers\Api\Student;

use App\Http\Controllers\Controller;
use App\Services\Teachers\ClassSessionService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentClassSessionController extends Controller
{
    use ApiResponse;

    public function __construct(
        private ClassSessionService $classSessionService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $sessions = $this->classSessionService->studentIndex(
            $request->only(['class_id', 'status', 'type', 'search']),
            (int) $request->get('per_page', 20)
        );

        return $this->paginatedResponse($sessions, 'Class sessions retrieved successfully.');
    }
}
