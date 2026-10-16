<?php

namespace App\Models;

use App\Enums\PlanCode;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Formule établissement (Gratuit, Pro, Premium). `max_published_offers` null = illimité.
 *
 * `features` :
 * - inquiryInbox : boîte de réception centralisée des demandes et candidatures ;
 * - statistics : 'none' | 'standard' | 'advanced' ;
 * - sponsoredPlacement : mise en avant dans les emplacements promus ;
 * - prioritySupport : accompagnement prioritaire.
 */
#[Fillable(['code', 'name', 'monthly_price', 'yearly_price', 'max_published_offers', 'features', 'position'])]
class Plan extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'code' => PlanCode::class,
            'features' => 'array',
            'monthly_price' => 'integer',
            'yearly_price' => 'integer',
            'max_published_offers' => 'integer',
        ];
    }

    public function hasFeature(string $feature): bool
    {
        return (bool) ($this->features[$feature] ?? false);
    }

    /**
     * @return HasMany<Subscription, $this>
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }
}
