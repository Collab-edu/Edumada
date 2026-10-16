<?php

namespace App\Models;

use App\Enums\CampaignStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Campagne Premium : une offre mise en avant dans des emplacements « Sponsorisé »
 * pendant une période définie, éventuellement ciblée par catégorie, domaine ou ville.
 */
#[Fillable([
    'offer_id', 'title', 'description', 'image', 'call_to_action', 'starts_on', 'ends_on',
    'target_category_id', 'target_domain_id', 'target_city', 'status',
])]
class Campaign extends Model
{
    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'status' => 'active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => CampaignStatus::class,
            'starts_on' => 'date',
            'ends_on' => 'date',
        ];
    }

    /**
     * Campagnes diffusées aujourd'hui.
     *
     * @param  Builder<self>  $query
     */
    #[Scope]
    protected function running(Builder $query): void
    {
        $today = now()->toDateString();

        $query->where('status', CampaignStatus::Active)
            ->whereDate('starts_on', '<=', $today)
            ->whereDate('ends_on', '>=', $today);
    }

    /**
     * @return BelongsTo<Establishment, $this>
     */
    public function establishment(): BelongsTo
    {
        return $this->belongsTo(Establishment::class);
    }

    /**
     * @return BelongsTo<Offer, $this>
     */
    public function offer(): BelongsTo
    {
        return $this->belongsTo(Offer::class);
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function targetCategory(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'target_category_id');
    }

    /**
     * @return BelongsTo<Domain, $this>
     */
    public function targetDomain(): BelongsTo
    {
        return $this->belongsTo(Domain::class, 'target_domain_id');
    }
}
