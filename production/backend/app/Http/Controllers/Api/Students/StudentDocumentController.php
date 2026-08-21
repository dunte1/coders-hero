<?php

namespace App\Http\Controllers\Api\Students;

use App\Http\Controllers\Controller;
use App\Models\StudentDocument;
use App\Services\Students\StudentDocumentService;
use App\Services\Students\StudentService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentDocumentController extends Controller
{
    use ApiResponse;

    public function __construct(
        private StudentDocumentService $documentService,
        private StudentService $studentService
    ) {}

    public function index(Request $request, int $studentId): JsonResponse
    {
        $student = $this->studentService->getById($studentId);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('view', $student);

        $documents = $this->documentService->list(
            $studentId,
            $request->only(['type']),
            (int) $request->get('per_page', 30)
        );

        return $this->paginatedResponse($documents, 'Documents retrieved successfully.');
    }

    public function store(Request $request, int $studentId): JsonResponse
    {
        $student = $this->studentService->getById($studentId);

        if (!$student) {
            return $this->notFoundResponse('Student not found.');
        }

        $this->authorize('update', $student);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'document_type' => ['required', 'string', 'max:100'],
            'file' => ['required', 'file', 'max:10240'],
        ]);

        $document = $this->documentService->store(
            $studentId,
            $validated['name'],
            $validated['document_type'],
            $request->file('file'),
            $request->user()?->id
        );

        return $this->createdResponse($document, 'Document uploaded successfully.');
    }

    public function destroy(int $documentId): JsonResponse
    {
        $document = StudentDocument::find($documentId);

        if (!$document) {
            return $this->notFoundResponse('Document not found.');
        }

        $this->authorize('delete', $document);

        $this->documentService->delete($documentId);

        return $this->noContentResponse('Document deleted successfully.');
    }
}
