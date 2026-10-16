<?php

namespace App\Models;

use App\Models\Concerns\HasUniqueSlug;
use App\Policies\CatalogPolicy;
use Database\Factories\CategoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\RouteKey;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Catégorie d'établissement (université, crèche, formation pro, primaire/secondaire, autres).
 */
#[Fillable(['slug', 'label', 'short_label', 'icon', 'offers_label', 'fields', 'position'])]
#[RouteKey('slug')]
#[UsePolicy(CatalogPolicy::class)]
class Category extends Model
{
    /** @use HasFactory<CategoryFactory> */
    use HasFactory, HasUniqueSlug;

    /**
     * Sections affichées sur les fiches : valeur par défaut quand un champ manque.
     *
     * @var array<string, bool>
     */
    public const DEFAULT_FIELDS = [
        'diplomas' => true,
        'programme' => true,
        'level' => true,
        'childAge' => true,
        'duration' => true,
        'careers' => true,
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fields' => 'array',
        ];
    }

    /**
     * @return HasMany<SubCategory, $this>
     */
    public function subCategories(): HasMany
    {
        return $this->hasMany(SubCategory::class)->orderBy('position');
    }

    /**
     * @return HasMany<Establishment, $this>
     */
    public function establishments(): HasMany
    {
        return $this->hasMany(Establishment::class);
    }
}
