'use client'
import { useState } from 'react'
import Link, { useT } from '@/i18n/client'
import { Icon } from '@/components/ui/icon'
import HeroSearchFields, { EMPTY_HERO_SEARCH, heroSearchHref } from './HeroSearchFields'
import { useFilterSuggestions } from '../useFilterSuggestions'

/** Barre de recherche de l'accueil (grand écran) : que recherchez-vous, quelle formation, où. */
const HeroFilters = () => {
    const t = useT()
    const { suggestions } = useFilterSuggestions()
    const [search, setSearch] = useState(EMPTY_HERO_SEARCH)
    const searchHref = heroSearchHref(search, (suggestions.domaine ?? []).map((s) => s.value))

    return (
        <div className='relative mx-auto mt-8 hidden max-w-5xl sm:mt-12 sm:block'>
            {/* Lueur colorée derrière la barre */}
            <div
                aria-hidden='true'
                className='pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-r from-primary/40 via-cream to-secondary/40 blur-2xl opacity-70'
            />
            <div className='relative rounded-2xl bg-white p-2 ring-1 ring-secondary/10 shadow-[0_24px_60px_-20px_rgba(15,76,92,0.45)]'>
                <div className='flex items-center justify-center gap-2 px-4 pt-1.5 pb-1 text-xs font-semibold text-secondary'>
                    <Icon icon='tabler:search' className='text-base text-primary' />
                    {t('Trouvez l’établissement qui vous correspond')}
                </div>
                <div className='grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-4 lg:items-center'>
                    <HeroSearchFields
                        search={search}
                        onChange={setSearch}
                        fieldClassName='rounded-xl px-4 py-2 text-left transition-colors duration-200 focus-within:bg-offwhite hover:bg-offwhite lg:border-r lg:border-gray-100 lg:rounded-none'
                    />
                    <div className='p-1 sm:col-span-3 lg:col-span-1'>
                        <Link
                            href={searchHref}
                            className='flex items-center justify-center gap-2 bg-primary w-full text-white font-bold py-3 px-3 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary/90 hover:shadow-primary/50 hover:-translate-y-0.5 duration-300'>
                            <Icon icon='tabler:search' className='text-xl' />
                            {t('Rechercher')}
                            <Icon icon='tabler:arrow-right' className='text-xl' />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HeroFilters
