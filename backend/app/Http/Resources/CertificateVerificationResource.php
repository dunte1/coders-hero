<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CertificateVerificationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'certificate_id' => $this->certificate_id,
            'certificate' => new CertificateResource($this->whenLoaded('certificate')),
            'verifier_ip' => $this->verifier_ip,
            'verified_at' => $this->verified_at?->toISOString(),
            'outcome' => $this->outcome,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
