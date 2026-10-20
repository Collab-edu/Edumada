<?php

namespace App\Http\Resources;

use App\Models\Establishment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Compte vu par un administrateur.
 *
 * @mixin User
 */
class AdminUserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role->value,
            'roleLabel' => $this->role->label(),
            'phone' => $this->phone,
            'city' => $this->city,
            'studyLevel' => $this->study_level,
            'createdAt' => $this->created_at->toIso8601String(),
            'establishments' => $this->whenLoaded('establishments', fn () => $this->establishments->map(fn (Establishment $establishment) => [
                'id' => $establishment->slug,
                'name' => $establishment->name,
                'role' => $establishment->pivot->role,
            ])),
            'inquiriesCount' => $this->whenCounted('inquiries'),
        ];
    }
}
