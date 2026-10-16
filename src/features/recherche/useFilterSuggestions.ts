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

const offersLabel = (count: number) => `${count} offre${count > 1 ? 's' : ''}`

/**
 * Suggestions des filtres principaux (catégorie, domaine, ville, type), avec le nombre d'offres
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
        for (const filter of filters) {
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
                            : filter.param === 'type'
                                ? count((f) => f.schoolType === value)
                                : count((f) => categories.find((c) => c.id === f.category)?.shortLabel === value)
                return { value, hint: formations.length ? offersLabel(n) : undefined }
            })
        }
        return result
    }, [filters, formations, schools, categories])

    return { filters, suggestions }
}
