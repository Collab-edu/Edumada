<?php

namespace App\Models;

use App\Models\Concerns\HasUniqueSlug;
use App\Policies\CatalogPolicy;
use Database\Factories\DomainFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\RouteKey;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Domaine d'études (filtre « Domaine d'études » du site).
 *
 * `categories` : catégories d'établissement (slugs) qui peuvent proposer une offre dans ce domaine ;
 * null = toutes. Une catégorie qu'aucun domaine ne cite a accès à tous les domaines.
 */
#[Fillable(['slug', 'name', 'icon', 'categories', 'position'])]
#[RouteKey('slug')]
#[UsePolicy(CatalogPolicy::class)]
class Domain extends Model
{
    /** @use HasFactory<DomainFactory> */
    use HasFactory, HasUniqueSlug;

    /**
     * Rattachement par défaut des domaines aux catégories d'établissement. La formation professionnelle
     * suit les filières du METFP (BTP, tourisme-hôtellerie, textile, TIC, agriculture, énergie…) :
     * pas de médecine, de droit ni d'ingénierie, qui relèvent du supérieur.
     *
     * @var array<string, array{categories: list<string>, icon: string}>
     */
    public const DEFAULTS = [
        'Informatique' => ['categories' => ['superieur', 'formation-pro', 'autres'], 'icon' => 'tabler:code'],
        'Médecine & Santé' => ['categories' => ['superieur', 'autres'], 'icon' => 'tabler:heart'],
        'Droit' => ['categories' => ['superieur', 'autres'], 'icon' => 'tabler:scale'],
        'Gestion & Commerce' => ['categories' => ['superieur', 'formation-pro', 'autres'], 'icon' => 'tabler:briefcase'],
        'Ingénierie' => ['categories' => ['superieur', 'autres'], 'icon' => 'tabler:settings'],
        'Agronomie' => ['categories' => ['superieur', 'autres'], 'icon' => 'tabler:plant'],
        'Lettres & Langues' => ['categories' => ['superieur', 'autres'], 'icon' => 'tabler:microphone'],
        'Tourisme & Hôtellerie' => ['categories' => ['superieur', 'formation-pro', 'autres'], 'icon' => 'tabler:send'],
        'Bâtiment & Travaux publics' => ['categories' => ['formation-pro', 'autres'], 'icon' => 'tabler:building'],
        'Électricité & Énergies renouvelables' => ['categories' => ['formation-pro', 'autres'], 'icon' => 'tabler:bolt'],
        'Mécanique & Automobile' => ['categories' => ['formation-pro', 'autres'], 'icon' => 'tabler:car'],
        'Cuisine & Restauration' => ['categories' => ['formation-pro', 'autres'], 'icon' => 'tabler:chef-hat'],
        'Textile & Couture' => ['categories' => ['formation-pro', 'autres'], 'icon' => 'tabler:needle-thread'],
        'Agriculture & Élevage' => ['categories' => ['formation-pro', 'autres'], 'icon' => 'tabler:tractor'],
        'Artisanat' => ['categories' => ['formation-pro', 'autres'], 'icon' => 'tabler:palette'],
        'Langues' => ['categories' => ['formation-pro', 'autres'], 'icon' => 'tabler:language'],
        'Beauté & Coiffure' => ['categories' => ['formation-pro', 'autres'], 'icon' => 'tabler:scissors'],
        'Petite enfance' => ['categories' => ['petite-enfance', 'autres'], 'icon' => 'tabler:baby-carriage'],
        'Enseignement général' => ['categories' => ['scolaire', 'autres'], 'icon' => 'tabler:school'],
        'Éducation spécialisée' => ['categories' => ['autres'], 'icon' => 'tabler:heart-handshake'],
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'categories' => 'array',
        ];
    }

    /**
     * @return HasMany<Offer, $this>
     */
    public function offers(): HasMany
    {
        return $this->hasMany(Offer::class);
    }

    /**
     * Domaines proposés à une catégorie d'établissement (tous si aucun domaine ne lui est rattaché).
     *
     * @param  Builder<self>  $query
     */
    #[Scope]
    protected function forCategory(Builder $query, ?string $category): void
    {
        if ($category === null || ! self::query()->whereJsonContains('categories', $category)->exists()) {
            return;
        }

        $query->where(fn (Builder $domains) => $domains->whereNull('categories')->orWhereJsonContains('categories', $category));
    }
}
