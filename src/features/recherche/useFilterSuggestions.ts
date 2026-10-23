'use client'
import { useMemo } from 'react'
import { useSiteData } from '@/data/site-data'
import type { Suggestion } from './components/SuggestInput'

/** Icône, exemple de saisie et libellé court de chaque filtre principal (paramètre d'URL). */
export const FILTER_UI: Record<string, { icon: string; placeholder: string; label?: string }> = {
    categorie: { icon: 'tabler:category', placeholder: 'Ex. : crèche, université…', label: 'Catégorie' },
    domaine: { icon: 'tabler:book-2', placeholder: 'Ex. : informatique, santé…' },
    ville: { icon: 'tabler:map-pin', placeholder: 'Ex. : Antananarivo…' },
    type: { icon: 'tabler:building-community', placeholder: 'Public ou privé' },
}

/**
 * Filtres principaux, connus d'avance (mêmes libellés que HeroFilterData) :
 * les champs s'affichent tout de suite, seules leurs suggestions dépendent des données.
 */
export const TOP_FILTERS = [
    { param: 'categorie', label: "Catégorie d'établissement" },
    { param: 'domaine', label: "Domaine d'études" },
    { param: 'ville', label: 'Ville / Localisation' },
    { param: 'type', label: "Type d'établissement" },
] as const

const offersLabel = (count: number) => `${count} offre${count > 1 ? 's' : ''}`

/**
 * Suggestions des filtres principaux (sous-catégorie, domaine, ville, type), avec le nombre d'offres
 * correspondantes. Partagées par la barre de l'accueil et la page /recherche.
 */
export function useFilterSuggestions() {
    const { data: filters } = useSiteData('HeroFilterData')
    const { data: formations } = useSiteData('FormationData')
    const { data: schools } = useSiteData('SchoolData')
    const { data: categories } = useSiteData('CategoryData')

    const suggestions = useMemo(() => {
        const count = (predicate: (f: (typeof formations)[number]) => boolean) => formations.filter(predicate).length
        const result: Record<string, Suggestion[]> = {}
        // Sous-catégorie de l'établissement de chaque offre.
        const subOf = new Map(schools.map((s) => [s.id, s.subCategory]))
        for (const filter of filters) {
            if (filter.param === 'categorie') {
                // Sous-catégories (Université, Crèche, Lycée…), dans l'ordre des catégories.
                // Sans offre publiée : pas proposée (aucun résultat derrière).
                result.categorie = categories
                    .flatMap((category) => category.subCategories)
                    .map((value) => ({ value, n: count((f) => subOf.get(f.schoolId) === value) }))
                    .filter(({ n }) => !formations.length || n > 0)
                    .map(({ value, n }) => ({ value, hint: formations.length ? offersLabel(n) : undefined }))
                continue
            }
            // La première option (« Toutes les… ») correspond à un champ vide.
            let values = filter.options.slice(1)
            if (filter.param === 'ville') {
                // Les villes des établissements référencés complètent la liste de départ.
                values = [...new Set([...values, ...schools.map((s) => s.city)])]
            }
            result[filter.param] = values.map((value) => {
                const n =
                    filter.param === 'domaine'
                        ? count((f) => f.domain === value)
                        : filter.param === 'ville'
                            ? count((f) => f.city === value)
                            : count((f) => f.schoolType === value)
                return { value, hint: formations.length ? offersLabel(n) : undefined }
            })
        }
        return result
    }, [filters, formations, schools, categories])

    return { filters, suggestions }
}
