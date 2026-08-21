<?php

namespace App\Services\Students;

use App\Models\StudentDocument;
use Illuminate\Http\UploadedFile;

class StudentDocumentService
{
    public function list(int $studentId, array $filters = [], int $perPage = 30)
    {
        return StudentDocument::query()
            ->where('student_id', $studentId)
            ->byType($filters['type'] ?? null)
            ->latest()
            ->paginate($perPage)
            ->withQueryString();
    }

    public function store(int $studentId, string $name, string $type, UploadedFile $file, ?string $uploaderId = null): StudentDocument
    {
        $path = $file->storeAs('documents', uniqid('doc_', true) . '.' . $file->getClientOriginalExtension(), 'public');

        $document = StudentDocument::create([
            'student_id' => $studentId,
            'name' => $name,
            'document_type' => $type,
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
            'uploaded_by' => $uploaderId,
        ]);

        return $document->fresh();
    }

    public function delete(int $id): bool
    {
        $document = StudentDocument::findOrFail($id);

        \Illuminate\Support\Facades\Storage::disk('public')->delete($document->file_path);

        return $document->delete();
    }
}
