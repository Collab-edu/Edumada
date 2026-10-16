<?php

namespace App\Models;

use App\Enums\EstablishmentSector;
use App\Enums\EstablishmentStatus;
use App\Enums\OfferStatus;
use App\Enums\PlanCode;
use App\Enums\ReviewStatus;
use App\Enums\SubscriptionStatus;
use App\Enums\VerificationStatus;
use App\Models\Concerns\HasUniqueSlug;
use Database\Factories\EstablishmentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\RouteKey;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Fiche établissement. Le statut de publication, la vérification et l'accréditation vérifiée
 * ne sont modifiables que par un administrateur : ils ne figurent pas dans $fillable.
 */
#[Fillable([
    'slug', 'name', 'initials', 'sector', 'category_id', 'sub_category_id',
    'city', 'address', 'phone', 'email', 'website', 'description',
    'social_links', 'infrastructures', 'accreditation', 'latitude', 'longitude',
    'admission_documents', 'cover_image', 'photos',
])]
#[RouteKey('slug')]
class Establishment extends Model
{
    /** @use HasFactory<EstablishmentFactory> */
    use HasFactory, HasUniqueSlug, SoftDeletes;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sector' => EstablishmentSector::class,
            'status' => EstablishmentStatus::class,
            'verification_status' => VerificationStatus::class,
            'verified_at' => 'date',
            'accreditation_verified' => 'boolean',
            'social_links' => 'array',
            'infrastructures' => 'array',
            'admission_documents' => 'array',
            'photos' => 'array',
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }

    /**
     * Fiches visibles par le public.
     *
     * @param  Builder<self>  $query
     */
    #[Scope]
    protected function published(Builder $query): void
    {
        $query->where('status', EstablishmentStatus::Published);
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return BelongsTo<SubCategory, $this>
     */
    public function subCategory(): BelongsTo
    {
        return $this->belongsTo(SubCategory::class);
    }

    /**
     * @return HasMany<Offer, $this>
     */
    public function offers(): HasMany
    {
        return $this->hasMany(Offer::class);
    }

    /**
     * @return HasMany<Offer, $this>
     */
    public function publishedOffers(): HasMany
    {
        return $this->offers()->where('status', OfferStatus::Published);
    }

    /**
     * @return HasMany<Review, $this>
     */
    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    /**
     * @return HasMany<Review, $this>
     */
    public function publishedReviews(): HasMany
    {
        return $this->reviews()->where('status', ReviewStatus::Published);
    }

    /**
     * Personnes autorisées à gérer la fiche.
     *
     * @return BelongsToMany<User, $this>
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    /**
     * @return HasMany<Subscription, $this>
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Formule en vigueur : celle de l'abonnement actif (ou en période de grâce), sinon Gratuit.
     * À l'expiration, l'établissement retombe sur Gratuit sans perdre sa fiche.
     */
    public function currentPlan(): Plan
    {
        $subscription = $this->subscriptions()
            ->with('plan')
            ->whereIn('status', [SubscriptionStatus::Active, SubscriptionStatus::Grace])
            ->where('starts_at', '<=', now())
            ->where(function (Builder $query): void {
                $query->whereNull('ends_at')
                    ->orWhere('ends_at', '>', now())
                    ->orWhere('grace_ends_at', '>', now());
            })
            ->latest('starts_at')
            ->first();

        return $subscription?->plan ?? Plan::where('code', PlanCode::Free)->firstOrFail();
    }

    /**
     * Peut-on publier une offre de plus sans dépasser la limite de la formule ?
     */
    public function canPublishAnotherOffer(?Offer $ignoring = null): bool
    {
        $limit = $this->currentPlan()->max_published_offers;

        if ($limit === null) {
            return true;
        }

        $published = $this->publishedOffers()
            ->when($ignoring, fn (Builder $query) => $query->whereKeyNot($ignoring->getKey()))
            ->count();

        return $published < $limit;
    }
}
