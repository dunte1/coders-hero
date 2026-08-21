<?php

namespace App\Http\Controllers\Api\Hr;

use App\Http\Controllers\Controller;
use App\Http\Requests\Hr\StoreEmployeeDocumentRequest;
use App\Http\Resources\Hr\EmployeeDocumentResource;
use App\Models\EmployeeDocument;
use App\Services\Hr\HrService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DocumentController extends Controller
{
    use ApiResponse;

    public function __construct(
        private HrService $hrService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $documents = EmployeeDocument::query()
            ->with(['employee.user', 'employee.department', 'uploadedBy'])
            ->when($request->get('employee_id'), fn ($q, $id) => $q->where('employee_id', (int) $id))
            ->when($request->get('category'), fn ($q, $c) => $q->byCategory($c))
            ->when($request->get('search'), function ($q, $term) {
                $q->where('title', 'like', "%{$term}%")
                    ->orWhereHas('employee.user', fn ($u) => $u->where('name', 'like', "%{$term}%"));
            })
            ->orderByDesc('created_at');

        return $this->paginatedResponse(
            $documents->paginate((int) $request->get('per_page', 15)),
            'Documents retrieved successfully.'
        );
    }

    public function store(StoreEmployeeDocumentRequest $request): JsonResponse
    {
        $data = $request->validated();

        if (empty($data['employee_id'])) {
            return $this->errorResponse('The employee id field is required.', 422);
        }

        $file = $request->file('file');

        $path = $file->store('hr/documents', 'public');

        $document = EmployeeDocument::create([
            'employee_id' => $data['employee_id'],
            'title' => $data['title'],
            'category' => $data['category'],
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'uploaded_by_user_id' => auth()->id(),
        ]);

        return $this->createdResponse(
            new EmployeeDocumentResource($document->load(['employee.user', 'uploadedBy'])),
            'Document uploaded successfully.'
        );
    }

    public function download(int $id): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $document = EmployeeDocument::find($id);

        if (!$document || !Storage::disk('public')->exists($document->file_path)) {
            abort(404, 'Document not found.');
        }

        return response()->download(
            Storage::disk('public')->path($document->file_path),
            $document->file_name,
            ['Content-Type' => $document->mime_type]
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $document = EmployeeDocument::find($id);

        if (!$document) {
            return $this->notFoundResponse('Document not found.');
        }

        Storage::disk('public')->delete($document->file_path);
        $document->delete();

        return $this->noContentResponse('Document deleted successfully.');
    }

    public function myDocuments(Request $request): JsonResponse
    {
        $employee = $this->hrService->employeeForUser(auth()->user());

        if (!$employee) {
            return $this->forbiddenResponse('Only employees can access their own documents.');
        }

        $documents = EmployeeDocument::query()
            ->with('uploadedBy')
            ->where('employee_id', $employee->id)
            ->when($request->get('category'), fn ($q, $c) => $q->byCategory($c))
            ->orderByDesc('created_at');

        return $this->paginatedResponse(
            $documents->paginate((int) $request->get('per_page', 15)),
            'Documents retrieved successfully.'
        );
    }

    public function myStore(StoreEmployeeDocumentRequest $request): JsonResponse
    {
        $employee = $this->hrService->employeeForUser(auth()->user());

        if (!$employee) {
            return $this->forbiddenResponse('Only employees can upload their own documents.');
        }

        $data = $request->validated();
        $data['employee_id'] = $employee->id;
        $file = $request->file('file');

        $path = $file->store('hr/documents', 'public');

        $document = EmployeeDocument::create([
            'employee_id' => $data['employee_id'],
            'title' => $data['title'],
            'category' => $data['category'],
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'uploaded_by_user_id' => auth()->id(),
        ]);

        return $this->createdResponse(
            new EmployeeDocumentResource($document->load(['employee.user', 'uploadedBy'])),
            'Document uploaded successfully.'
        );
    }
}
