<?php

namespace App\Http\Resources;

use App\Models\Domain;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Domaine d'études. `name` est la valeur du filtre « Domaine d'études » et du champ `domain` des offres.
 *
 * @mixin Domain
 */
class DomainResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->slug,
            'name' => $this->name,
            'icon' => $this->icon,
            'count' => $this->whenCounted('offers'),
        ];
    }
}
