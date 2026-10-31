<?php

namespace App\Models;

use App\Enums\OfferStatus;
use App\Enums\RegistrationStatus;
use App\Models\Concerns\HasUniqueSlug;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\RouteKey;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

/**
 * Offre de stage d'une société, publiée uniquement par l'administration Edumada.
 */
#[Fillable([
    'company_name', 'company_logo', 'title', 'domain_id', 'city', 'duration_months',
    'modality', 'registration', 'starts_on', 'deadline', 'description', 'missions',
    'profile', 'benefits', 'allowance', 'status',
])]
#[RouteKey('slug')]
class Internship extends Model
{
    use HasUniqueSlug;

    protected static function booted(): void
    {
        // Les candidatures partent avec l'offre (clé étrangère) : leurs documents aussi.
        static::deleting(function (Internship $internship): void {
            $internship->applications->each(fn (InternshipApplication $application) => Storage::disk('local')->deleteDirectory($application->directory()));
        });
    }

    /**
     * Candidatures ouvertes et date limite non dépassée, pour une offre publiée.
     */
    public function acceptsApplications(): bool
    {
        return $this->status === OfferStatus::Published
            && $this->registration === RegistrationStatus::Open->label()
            && ($this->deadline === null || ! $this->deadline->isPast() || $this->deadline->isToday());
    }

    /**
     * @return HasMany<InternshipApplication, $this>
     */
    public function applications(): HasMany
    {
        return $this->hasMany(InternshipApplication::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => OfferStatus::class,
            'starts_on' => 'date',
            'deadline' => 'date',
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
