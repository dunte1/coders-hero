<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'job_listing_id' => $this->job_listing_id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'resume_path' => $this->resume_path,
            'cover_letter' => $this->cover_letter,
            'portfolio_url' => $this->portfolio_url,
            'status' => $this->status,
            'job_listing' => new JobListingResource($this->whenLoaded('jobListing')),
            'created_at' => $this->created_at,
        ];
    }
}
