<?php

namespace App\Models;

use App\Models\Concerns\HasUniqueSlug;
use App\Policies\CatalogPolicy;
use Database\Factories\DomainFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\RouteKey;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Domaine d'études (filtre « Domaine d'études » du site).
 */
#[Fillable(['slug', 'name', 'icon', 'position'])]
#[RouteKey('slug')]
#[UsePolicy(CatalogPolicy::class)]
class Domain extends Model
{
    /** @use HasFactory<DomainFactory> */
    use HasFactory, HasUniqueSlug;

    /**
     * @return HasMany<Offer, $this>
     */
    public function offers(): HasMany
    {
        return $this->hasMany(Offer::class);
    }
}
