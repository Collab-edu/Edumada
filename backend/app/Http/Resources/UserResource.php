<?php

namespace App\Http\Resources;

use App\Models\Establishment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Compte connecté.
 *
 * @mixin User
 */
class UserResource extends JsonResource
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
            'emailVerified' => $this->email_verified_at !== null,
            'role' => $this->role->value,
            'phone' => $this->phone,
            'city' => $this->city,
            'studyLevel' => $this->study_level,
            'establishments' => $this->whenLoaded('establishments', fn () => $this->establishments->map(fn (Establishment $establishment) => [
                'id' => $establishment->slug,
                'name' => $establishment->name,
                'role' => $establishment->pivot->role,
            ])),
        ];
    }
}
