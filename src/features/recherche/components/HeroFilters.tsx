'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import { useSiteData } from '@/data/site-data'
import SuggestInput, { type Suggestion } from './SuggestInput'

// Icône et exemple de saisie de chaque filtre, selon son paramètre d'URL
const FILTER_UI: Record<string, { icon: string; placeholder: string; label?: string }> = {
    categorie: { icon: 'tabler:category', placeholder: 'Ex. : crèche, université…', label: 'Catégorie' },
    domaine: { icon: 'tabler:book-2', placeholder: 'Ex. : informatique, santé…' },
    ville: { icon: 'tabler:map-pin', placeholder: 'Ex. : Antananarivo…' },
    type: { icon: 'tabler:building-community', placeholder: 'Public ou privé' },
}

const offersLabel = (count: number) => `${count} offre${count > 1 ? 's' : ''}`

const HeroFilters = () => {
    const { data: filters } = useSiteData('HeroFilterData')
    const { data: formations } = useSiteData('FormationData')
    const { data: schools } = useSiteData('SchoolData')
    const { data: categories } = useSiteData('CategoryData')
    // Valeur saisie par filtre (paramètre d'URL → valeur) ; vide = pas de filtre.
    const [selected, setSelected] = useState<Record<string, string>>({})

    /** Suggestions de chaque filtre, avec le nombre d'offres correspondantes. */
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

    // Seuls les filtres renseignés passent dans l'URL de la page /recherche.
    const params = new URLSearchParams()
    for (const filter of filters) {
        if (selected[filter.param]) params.set(filter.param, selected[filter.param])
    }
    const query = params.toString()
    const searchHref = query ? `/recherche?${query}` : '/recherche'

    return (
        <div className='relative mx-auto max-w-6xl mt-8 sm:mt-12'>
            {/* Lueur colorée derrière la barre */}
            <div
                aria-hidden='true'
                className='pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-r from-primary/40 via-cream to-secondary/40 blur-2xl opacity-70'
            />
            <div className='relative rounded-2xl bg-white p-3 ring-1 ring-secondary/10 shadow-[0_24px_60px_-20px_rgba(15,76,92,0.45)]'>
                <div className='flex items-center justify-center gap-2 px-4 pt-2 pb-3 text-sm font-semibold text-secondary'>
                    <Icon icon='tabler:search' className='text-lg text-primary' />
                    Trouvez l&apos;établissement qui vous correspond
                </div>
                <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5 lg:items-center'>
                    {filters.map((filter) => (
                        <div
                            key={filter.param}
                            className='rounded-xl px-4 py-3 text-left transition-colors duration-200 focus-within:bg-offwhite hover:bg-offwhite lg:border-r lg:border-gray-100 lg:rounded-none'>
                            <SuggestInput
                                icon={FILTER_UI[filter.param]?.icon}
                                label={FILTER_UI[filter.param]?.label ?? filter.label}
                                placeholder={FILTER_UI[filter.param]?.placeholder ?? filter.options[0]}
                                suggestions={suggestions[filter.param] ?? []}
                                value={selected[filter.param] ?? ''}
                                onChange={(value) => setSelected((prev) => ({ ...prev, [filter.param]: value }))}
                            />
                        </div>
                    ))}
                    <div className='p-1 sm:col-span-2 lg:col-span-1'>
                        <Link
                            href={searchHref}
                            className='flex items-center justify-center gap-2 bg-primary w-full text-white font-bold py-4 px-3 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary/90 hover:shadow-primary/50 hover:-translate-y-0.5 duration-300'>
                            <Icon icon='tabler:search' className='text-xl' />
                            Rechercher
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HeroFilters
