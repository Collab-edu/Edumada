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
use Carbon\CarbonInterface;
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
    'social_links', 'infrastructures', 'accreditation', 'founded_year', 'latitude', 'longitude',
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
            'founded_year' => 'integer',
            'social_links' => 'array',
            'infrastructures' => 'array',
            'admission_documents' => 'array',
            'photos' => 'array',
            'offer_locked_at' => 'datetime',
            'offer_locked_until' => 'datetime',
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
     * Après la publication, le titre, le domaine ou le diplôme restent corrigeables quelques jours (faute de frappe…).
     */
    public const OFFER_CORRECTION_DAYS = 7;

    /**
     * Verrou en cours sur l'offre publiée (formule Gratuit) : offre concernée, fin du délai de correction et fin du verrou.
     *
     * @return array{offerId: int|null, correctableUntil: CarbonInterface, until: CarbonInterface}|null
     */
    public function activeOfferLock(): ?array
    {
        if ($this->currentPlan()->limit('offerLockMonths') === null || $this->offer_locked_until === null || $this->offer_locked_until->isPast()) {
            return null;
        }

        return [
            'offerId' => $this->locked_offer_id,
            'correctableUntil' => $this->offer_locked_at->copy()->addDays(self::OFFER_CORRECTION_DAYS),
            'until' => $this->offer_locked_until,
        ];
    }

    /**
     * Formule Gratuit : pendant le verrou, on ne publie pas une autre offre et on ne change pas l'identité
     * (titre, domaine, diplôme…) de l'offre verrouillée, sauf pendant le délai de correction.
     * Le reste (description, frais, dates, programme…) reste modifiable.
     *
     * L'identité de l'offre verrouillée reste bloquée même archivée : sinon il suffirait de l'archiver, la renommer et la republier.
     *
     * @param  array{publishing: bool, identityChanged: bool, wasPublished: bool}  $change
     *
     * @throws ValidationException
     */
    public function assertOfferChangeAllowed(Offer $offer, array $change): void
    {
        $lock = $this->activeOfferLock();
        if ($lock === null) {
            return;
        }

        $isLockedOffer = $offer->exists && $offer->getKey() === $lock['offerId'];
        $publishingAnother = $change['publishing'] && ! $isLockedOffer;
        $renaming = $change['identityChanged'] && ($isLockedOffer || $change['wasPublished'])
            && ! ($isLockedOffer && $lock['correctableUntil']->isFuture());
        if (! $publishingAnother && ! $renaming) {
            return;
        }

        $date = $lock['until']->locale('fr')->isoFormat('LL');
        throw ValidationException::withMessages([
            $publishingAnother ? 'status' : 'title' => $publishingAnother
                ? "La formule Gratuit permet de changer d'offre publiée une fois par an : prochain changement possible le {$date}. Passez à Pro pour publier toutes vos offres."
                : "Le titre, le domaine et le diplôme de votre offre publiée sont verrouillés jusqu'au {$date} (formule Gratuit). Vous pouvez toujours modifier la description, les frais, les dates et le programme, ou passer à Pro.",
        ]);
    }

    /**
     * Après une publication ou un changement d'identité autorisé : démarre le verrou de la formule s'il n'y en a pas en cours.
     *
     * @param  array{publishing: bool, identityChanged: bool, wasPublished: bool}  $change
     */
    public function lockOfferIfNeeded(Offer $offer, array $change): void
    {
        $months = $this->currentPlan()->limit('offerLockMonths');
        $putsOnline = $change['publishing'] || ($change['identityChanged'] && $change['wasPublished']);
        if ($months === null || ! $putsOnline || $this->activeOfferLock() !== null) {
            return;
        }

        $this->forceFill([
            'locked_offer_id' => $offer->getKey(),
            'offer_locked_at' => now(),
            'offer_locked_until' => now()->addMonths($months),
        ])->save();
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
