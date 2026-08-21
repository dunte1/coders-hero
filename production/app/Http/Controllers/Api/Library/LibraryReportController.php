<?php

namespace App\Http\Controllers\Api\Library;

use App\Http\Controllers\Controller;
use App\Services\Library\LibraryService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class LibraryReportController extends Controller
{
    use ApiResponse;

    public function __construct(
        private LibraryService $libraryService
    ) {}

    public function summary(): JsonResponse
    {
        return $this->successResponse($this->libraryService->summary(), 'Library summary retrieved.');
    }
}
