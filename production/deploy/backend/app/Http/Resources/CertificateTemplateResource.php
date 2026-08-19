<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CertificateTemplateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'body_html' => $this->body_html,
            'accent_color' => $this->accent_color,
            'font_family' => $this->font_family,
            'logo_url' => $this->logo_path ? url('storage/' . $this->logo_path) : null,
            'signature_name' => $this->signature_name,
            'signature_title' => $this->signature_title,
            'is_default' => $this->is_default,
            'is_active' => $this->is_active,
            'certificates_count' => $this->whenCounted('certificates'),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
