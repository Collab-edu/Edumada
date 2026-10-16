'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import SuggestInput from './SuggestInput'
import { FILTER_UI, TOP_FILTERS, useFilterSuggestions } from '../useFilterSuggestions'

const HeroFilters = () => {
    const { suggestions } = useFilterSuggestions()
    // Valeur saisie par filtre (paramètre d'URL → valeur) ; vide = pas de filtre.
    const [selected, setSelected] = useState<Record<string, string>>({})

    // Seuls les filtres renseignés passent dans l'URL de la page /recherche.
    const params = new URLSearchParams()
    for (const { param } of TOP_FILTERS) {
        if (selected[param]) params.set(param, selected[param])
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
                    {TOP_FILTERS.map((filter) => (
                        <div
                            key={filter.param}
                            className='rounded-xl px-4 py-3 text-left transition-colors duration-200 focus-within:bg-offwhite hover:bg-offwhite lg:border-r lg:border-gray-100 lg:rounded-none'>
                            <SuggestInput
                                icon={FILTER_UI[filter.param].icon}
                                label={FILTER_UI[filter.param].label ?? filter.label}
                                placeholder={FILTER_UI[filter.param].placeholder}
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
