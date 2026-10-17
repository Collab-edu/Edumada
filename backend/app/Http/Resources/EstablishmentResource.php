<?php

namespace App\Http\Resources;

use App\Models\Establishment;
use App\Models\Offer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

/**
 * Format `SchoolType` du site (src/features/etablissements/types.ts).
 * Les `tags` (domaines enseignés) sont déduits des offres publiées.
 *
 * @mixin Establishment
 */
class EstablishmentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->slug,
            'name' => $this->name,
            'initials' => $this->initials ?: self::initialsFrom($this->name),
            'type' => $this->sector?->label(),
            'category' => $this->category->slug,
            'subCategory' => $this->subCategory?->label ?? '',
            'socialLinks' => (object) ($this->social_links ?? []),
            'infrastructures' => $this->infrastructures ?? [],
            'verification' => [
                'status' => $this->verification_status->label(),
                'date' => $this->verified_at?->toDateString(),
            ],
            'city' => $this->city,
            'address' => $this->address ?? '',
            'phone' => $this->phone ?? '',
            'email' => $this->email ?? '',
            'website' => $this->website ?? '',
            'description' => $this->description ?? '',
            'tags' => $this->whenLoaded('publishedOffers', fn () => $this->publishedOffers
                ->map(fn (Offer $offer) => $offer->domain?->name)
                ->filter()
                ->unique()
                ->values()),
            'accreditation' => $this->accreditation,
            'accreditationVerified' => $this->accreditation_verified,
            'coordinates' => $this->latitude !== null && $this->longitude !== null
                ? ['lat' => $this->latitude, 'lng' => $this->longitude]
                : null,
            'admissionDocuments' => $this->admission_documents ?? [],
            'imageSrc' => $this->cover_image ?? '',
            'photos' => $this->photos ?? [],
            'updatedAt' => $this->updated_at?->toDateString(),
        ];
    }

    /**
     * « Institut Numérique de Madagascar » → « INM ».
     */
    public static function initialsFrom(string $name): string
    {
        return Str::of($name)
            ->explode(' ')
            ->filter(fn (string $word) => mb_strlen($word) > 2 && ! in_array(mb_strtolower($word), ['les', 'des', 'pour'], true))
            ->map(fn (string $word) => mb_strtoupper(mb_substr(Str::ascii($word), 0, 1)))
            ->take(4)
            ->implode('');
    }
}
