<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LoginHistoryService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoginHistoryController extends Controller
{
    use ApiResponse;

    public function __construct(
        private LoginHistoryService $loginHistoryService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $history = $this->loginHistoryService->listFor($request->user(), $request->integer('per_page'));

        return $this->paginatedResponse($history, 'Login history retrieved successfully.');
    }

    public function all(Request $request): JsonResponse
    {
        $history = $this->loginHistoryService->listAll(
            $request->integer('per_page'),
            $request->get('search')
        );

        return $this->paginatedResponse($history, 'Login history retrieved successfully.');
    }

    public function show(string $id): JsonResponse
    {
        $history = $this->loginHistoryService->find((int) $id);

        if (! $history) {
            return $this->notFoundResponse('Login history record not found.');
        }

        return $this->successResponse($history, 'Login history record retrieved successfully.');
    }

    public function destroy(Request $request): JsonResponse
    {
        $deleted = $this->loginHistoryService->clearFor($request->user());

        return $this->successResponse(['deleted' => $deleted], 'Login history cleared successfully.');
    }
}
