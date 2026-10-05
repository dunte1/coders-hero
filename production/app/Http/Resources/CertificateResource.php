<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CertificateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'course_id' => $this->course_id,
            'enrollment_id' => $this->enrollment_id,
            'template_id' => $this->template_id,
            'template' => new CertificateTemplateResource($this->whenLoaded('template')),
            'certificate_number' => $this->certificate_number,
            'issued_at' => $this->issued_at?->toISOString(),
            'certificate_url' => $this->cert_url,
            'verification_code' => $this->verification_code,
            'qr_code' => $this->qr_code,
            'qr_code_url' => $this->qr_code ? url('/api/certificates/qr/' . $this->verification_code) : null,
            'digital_signature' => $this->digital_signature,
            'status' => $this->status,
            'is_revoked' => $this->isRevoked(),
            'revoked_at' => $this->revoked_at?->toISOString(),
            'revoked_reason' => $this->revoked_reason,
            'user' => new UserResource($this->whenLoaded('user')),
            'course' => new CourseResource($this->whenLoaded('course')),
            'verifications_count' => $this->whenCounted('verifications'),
            'badge_name' => $this->badge_name,
            'badge_color' => $this->badge_color,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
