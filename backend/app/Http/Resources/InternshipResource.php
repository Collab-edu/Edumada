<?php

namespace App\Http\Resources;

use App\Models\Internship;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Internship
 */
class InternshipResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->slug,
            'companyName' => $this->company_name,
            'companyLogo' => $this->company_logo,
            'title' => $this->title,
            'domain' => $this->domain?->name,
            'city' => $this->city,
            'durationMonths' => $this->duration_months,
            'modality' => $this->modality,
            'registration' => $this->registration,
            'startDate' => $this->starts_on?->toDateString(),
            'deadline' => $this->deadline?->toDateString(),
            'description' => $this->description,
            'missions' => $this->missions,
            'profile' => $this->profile,
            'benefits' => $this->benefits,
            'allowance' => $this->allowance,
            'acceptsApplications' => $this->acceptsApplications(),
            'applicationsCount' => $this->whenCounted('applications'),
            'createdAt' => $this->created_at?->toIso8601String(),
            'status' => $this->status->value,
            'statusLabel' => $this->status->label(),
        ];
    }
}
