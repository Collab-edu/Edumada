<?php

namespace App\Models;

use App\Enums\EstablishmentMemberRole;
use App\Enums\EstablishmentSector;
use App\Enums\EstablishmentStatus;
use App\Enums\OfferStatus;
use App\Enums\PlanCode;
use App\Enums\ReviewStatus;
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
use Illuminate\Validation\ValidationException;

/**
 * Fiche établissement. Le statut de publication, la vérification et l'accréditation vérifiée
 * ne sont modifiables que par un administrateur : ils ne figurent pas dans $fillable.
 */
#[Fillable([
    'slug', 'name', 'initials', 'sector', 'category_id', 'sub_category_id',
    'city', 'address', 'phone', 'email', 'website', 'description',
    'social_links', 'infrastructures', 'accreditation', 'latitude', 'longitude',
    'admission_documents', 'cover_image', 'logo', 'photos',
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
     * Fiches dont la formule en vigueur inclut cette fonctionnalité (reviews, photoGallery…).
     */
    #[Scope]
    protected function withFeature(Builder $query, string $feature): void
    {
        $plans = Plan::all()->filter(fn (Plan $plan) => $plan->hasFeature($feature));
        $freeHasIt = $plans->contains(fn (Plan $plan) => $plan->code === PlanCode::Free);

        $query->where(function (Builder $query) use ($plans, $freeHasIt): void {
            $query->whereHas('subscriptions', fn (Builder $query) => $query->current()->whereIn('plan_id', $plans->modelKeys()));
            if ($freeHasIt) {
                $query->orWhereDoesntHave('subscriptions', fn (Builder $query) => $query->current());
            }
        });
    }

    /**
     * Fiches dont la formule en vigueur est celle donnée (Gratuit = aucun abonnement payant en cours).
     */
    #[Scope]
    protected function onPlan(Builder $query, PlanCode $plan): void
    {
        if ($plan === PlanCode::Free) {
            $query->whereDoesntHave('subscriptions', fn (Builder $query) => $query->current());

            return;
        }

        $query->whereHas('subscriptions', fn (Builder $query) => $query->current()
            ->whereHas('plan', fn (Builder $query) => $query->where('code', $plan)));
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
     * Donne la gestion de la fiche à un compte. Un compte ne gère qu'un seul établissement :
     * s'il fait déjà partie de l'équipe d'une autre fiche, l'ajout est refusé.
     *
     * @throws ValidationException
     */
    public function addMember(User $user, EstablishmentMemberRole $role, string $field = 'email'): void
    {
        if ($user->establishments()->whereKeyNot($this->getKey())->exists()) {
            throw ValidationException::withMessages([$field => 'Ce compte gère déjà un autre établissement : un compte ne peut gérer qu\'un seul établissement.']);
        }

        $this->members()->syncWithoutDetaching([$user->id => ['role' => $role->value]]);
    }

    /**
     * Nombre de propriétaires : une fiche en garde toujours au moins un.
     */
    public function ownersCount(): int
    {
        return $this->members()->wherePivot('role', EstablishmentMemberRole::Owner->value)->count();
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
     * @return HasMany<Inquiry, $this>
     */
    public function inquiries(): HasMany
    {
        return $this->hasMany(Inquiry::class);
    }

    /**
     * @return HasMany<EstablishmentClaim, $this>
     */
    public function claims(): HasMany
    {
        return $this->hasMany(EstablishmentClaim::class);
    }

    /**
     * @return HasMany<Report, $this>
     */
    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }

    /**
     * @return HasMany<Invoice, $this>
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * @return HasMany<Campaign, $this>
     */
    public function campaigns(): HasMany
    {
        return $this->hasMany(Campaign::class);
    }

    /**
     * Abonnement payant en vigueur (actif ou en période de grâce), s'il existe.
     */
    public function currentSubscription(): ?Subscription
    {
        return $this->subscriptions()
            ->with('plan')
            ->current()
            ->latest('starts_at')
            ->first();
    }

    /**
     * La formule en vigueur inclut-elle cette fonctionnalité (inquiryInbox, sponsoredPlacement…) ?
     */
    public function hasFeature(string $feature): bool
    {
        return $this->currentPlan()->hasFeature($feature);
    }

    /**
     * Niveau de statistiques de la formule : none, standard ou advanced.
     */
    public function statisticsLevel(): string
    {
        return $this->currentPlan()->features['statistics'] ?? 'none';
    }

    /**
     * Formule en vigueur : celle de l'abonnement actif (ou en période de grâce), sinon Gratuit.
     * À l'expiration, l'établissement retombe sur Gratuit sans perdre sa fiche.
     */
    public function currentPlan(): Plan
    {
        return $this->currentSubscription()?->plan ?? Plan::where('code', PlanCode::Free)->firstOrFail();
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
