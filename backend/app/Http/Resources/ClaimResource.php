<?php

namespace App\Http\Resources;

use App\Models\EstablishmentClaim;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin EstablishmentClaim
 */
class ClaimResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'establishment' => ['id' => $this->establishment->slug, 'name' => $this->establishment->name, 'email' => $this->establishment->email],
            'user' => ['id' => $this->user->id, 'name' => $this->user->name, 'email' => $this->user->email, 'phone' => $this->user->phone],
            'message' => $this->message,
            'status' => $this->status->value,
            'statusLabel' => $this->status->label(),
            'createdAt' => $this->created_at->toIso8601String(),
        ];
    }
}
