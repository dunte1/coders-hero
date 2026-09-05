<?php

namespace App\Http\Controllers\Api\Library;

use App\Http\Controllers\Controller;
use App\Http\Requests\Library\BorrowLibraryResourceRequest;
use App\Http\Resources\Library\LibraryBorrowingResource;
use App\Services\Library\LibraryService;
use App\Traits\ApiResponse;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LibraryBorrowingController extends Controller
{
    use ApiResponse;

    public function __construct(
        private LibraryService $libraryService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $borrowings = $this->libraryService->allBorrowings(
            $request->only(['status', 'overdue']),
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse(
            LibraryBorrowingResource::collection($borrowings),
            'Borrowings retrieved successfully.'
        );
    }

    public function my(Request $request): JsonResponse
    {
        $borrowings = $this->libraryService->myBorrowings(
            $request->user()?->id,
            $request->only(['status']),
            (int) $request->get('per_page', 15)
        );

        return $this->paginatedResponse(
            LibraryBorrowingResource::collection($borrowings),
            'Your borrowings retrieved successfully.'
        );
    }

    public function store(BorrowLibraryResourceRequest $request, int $id): JsonResponse
    {
        try {
            $borrowing = $this->libraryService->borrow($id, $request->validated());
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Resource not found.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        }

        return $this->createdResponse(
            new LibraryBorrowingResource($borrowing->load(['resource', 'user'])),
            'Resource borrowed.'
        );
    }

    public function returnBorrowing(int $borrowingId): JsonResponse
    {
        try {
            $borrowing = $this->libraryService->returnBorrowing($borrowingId);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Borrowing record not found.');
        }

        return $this->successResponse(
            new LibraryBorrowingResource($borrowing->load(['resource', 'user'])),
            'Resource returned.'
        );
    }

    public function returnMyBorrowing(Request $request, int $borrowingId): JsonResponse
    {
        $borrowing = $this->libraryService->findBorrowing($borrowingId);

        if (!$borrowing) {
            return $this->notFoundResponse('Borrowing record not found.');
        }

        if ((int) $borrowing->user_id !== (int) $request->user()?->id) {
            return $this->forbiddenResponse('You can only return your own borrowings.');
        }

        try {
            $borrowing = $this->libraryService->returnBorrowing($borrowingId);
        } catch (ModelNotFoundException) {
            return $this->notFoundResponse('Borrowing record not found.');
        }

        return $this->successResponse(
            new LibraryBorrowingResource($borrowing->load(['resource', 'user'])),
            'Resource returned.'
        );
    }
}
