<?php

namespace App\Http\Resources\Hr;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeDocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_id' => $this->employee_id,
            'title' => $this->title,
            'category' => $this->category,
            'file_path' => $this->file_path,
            'file_name' => $this->file_name,
            'mime_type' => $this->mime_type,
            'size' => $this->size,
            'size_human' => $this->size ? round($this->size / 1024, 1) . ' KB' : null,
            'uploaded_by_user_id' => $this->uploaded_by_user_id,
            'employee' => new \App\Http\Resources\EmployeeResource($this->whenLoaded('employee')),
            'uploaded_by' => new \App\Http\Resources\UserResource($this->whenLoaded('uploadedBy')),
            'created_at' => $this->created_at->toISOString(),
        ];
    }
}
