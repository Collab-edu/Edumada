<?php

namespace App\Http\Resources;

use App\Models\InternshipApplication;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin InternshipApplication
 */
class InternshipApplicationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'phone' => $this->phone,
            'cvName' => $this->cv_name,
            'letterName' => $this->letter_name,
            'createdAt' => $this->created_at->toIso8601String(),
            'internship' => ['id' => $this->internship->slug, 'title' => $this->internship->title, 'companyName' => $this->internship->company_name],
            'applicant' => $this->whenLoaded('user', fn () => ['name' => $this->user->name, 'email' => $this->user->email]),
        ];
    }
}
