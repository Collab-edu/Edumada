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

/** Mots courants qui mènent à chaque catégorie (on tape « crèche », on trouve « Petite enfance »). */
const CATEGORY_KEYWORDS: Record<string, string[]> = {
    'Enseignement supérieur': ['Université', 'Faculté', 'Institut', 'École supérieure', 'Licence', 'Master', 'BTS', 'Doctorat'],
    'Petite enfance': ['Crèche', 'Garderie', 'Jardin d’enfants', 'Maternelle'],
    'Formation professionnelle': ['CFP', 'Centre de formation', 'Métier', 'Apprentissage', 'Formation courte'],
    'Primaire et secondaire': ['École primaire', 'EPP', 'Collège', 'CEG', 'Lycée', 'BEPC', 'Baccalauréat'],
    'Autres établissements': ['Langues', 'Musique', 'Soutien scolaire'],
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
                return { value, hint: formations.length ? offersLabel(n) : undefined, keywords: filter.param === 'categorie' ? CATEGORY_KEYWORDS[value] : undefined }
            })
        }
        return result
    }, [filters, formations, schools, categories])

    return { filters, suggestions }
}
