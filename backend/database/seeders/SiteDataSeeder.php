<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Domain;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Importe les référentiels du site (public/data/data.json) : catégories et domaines.
 * Aucun établissement, offre ni avis : ils sont saisis depuis le back-office.
 */
class SiteDataSeeder extends Seeder
{
    public function run(): void
    {
        $site = $this->readJson('data.json');

        $this->seedCategories($site['CategoryData']);
        $this->seedDomains($site);
    }

    /**
     * @param  list<array<string, mixed>>  $items
     * @return array<string, Category>
     */
    private function seedCategories(array $items): array
    {
        $categories = [];

        foreach ($items as $position => $item) {
            $category = Category::updateOrCreate(['slug' => $item['id']], [
                'label' => $item['label'],
                'short_label' => $item['shortLabel'],
                'icon' => $item['icon'],
                'offers_label' => $item['offersLabel'],
                'fields' => $item['fields'],
                'position' => $position,
            ]);

            foreach ($item['subCategories'] as $subPosition => $label) {
                $category->subCategories()->updateOrCreate(['label' => $label], ['position' => $subPosition]);
            }

            $categories[$item['id']] = $category;
        }

        return $categories;
    }

    /**
     * Les domaines sont les options du filtre « Domaine d'études » ; l'icône vient des cartes de l'accueil.
     *
     * @param  array<string, mixed>  $site
     * @return array<string, Domain>
     */
    private function seedDomains(array $site): array
    {
        $filter = collect($site['HeroFilterData'])->firstWhere('param', 'domaine');
        $names = array_values(array_filter($filter['options'], fn (string $option) => $option !== 'Tous les domaines'));
        $icons = collect($site['DomainData'])->groupBy('searchDomain')->map(fn ($cards) => $cards->first()['icon']);

        // Domaines du filtre du site, puis ceux propres à une catégorie (formation professionnelle…).
        $names = array_values(array_unique([...$names, ...array_keys(Domain::DEFAULTS)]));

        $domains = [];
        foreach ($names as $position => $name) {
            $domains[$name] = Domain::updateOrCreate(['name' => $name], [
                'slug' => Str::slug($name),
                'icon' => $icons[$name] ?? Domain::DEFAULTS[$name]['icon'] ?? null,
                'categories' => Domain::DEFAULTS[$name]['categories'] ?? null,
                'position' => $position,
            ]);
        }

        return $domains;
    }

    /**
     * @return array<mixed>
     */
    private function readJson(string $file): array
    {
        $path = rtrim(config('edumada.site_data_path'), '/\\').DIRECTORY_SEPARATOR.$file;

        if (! is_file($path)) {
            throw new RuntimeException("Fichier de données du site introuvable : {$path} (voir EDUMADA_SITE_DATA_PATH).");
        }

        return json_decode(file_get_contents($path), true, flags: JSON_THROW_ON_ERROR);
    }
}
