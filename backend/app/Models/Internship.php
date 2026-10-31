<?php

namespace App\Models;

use App\Enums\OfferStatus;
use App\Models\Concerns\HasUniqueSlug;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\RouteKey;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Offre de stage d'une société, publiée uniquement par l'administration Edumada.
 */
#[Fillable([
    'company_name', 'company_logo', 'title', 'domain_id', 'city', 'duration_months',
    'modality', 'registration', 'starts_on', 'contact', 'description', 'status',
])]
#[RouteKey('slug')]
class Internship extends Model
{
    use HasUniqueSlug;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => OfferStatus::class,
            'starts_on' => 'date',
            'duration_months' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Domain, $this>
     */
    public function domain(): BelongsTo
    {
        return $this->belongsTo(Domain::class);
    }
}
