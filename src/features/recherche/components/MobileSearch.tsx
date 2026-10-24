'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { Icon } from '@/components/ui/icon'
import HeroSearchFields, { EMPTY_HERO_SEARCH, heroSearchHref } from './HeroSearchFields'
import { useFilterSuggestions } from '../useFilterSuggestions'

/** Raccourcis vers les catégories les plus cherchées. */
const SHORTCUTS = [
    { label: 'Université', categorie: 'Enseignement supérieur' },
    { label: 'Formation pro', categorie: 'Formation professionnelle' },
    { label: 'Lycée', categorie: 'Primaire et secondaire' },
    { label: 'Crèche', categorie: 'Petite enfance' },
]

/**
 * Recherche sur mobile : un seul grand champ, juste sous le titre, qui ouvre un panneau plein écran
 * avec les champs de la recherche rapide (que recherchez-vous, quelle formation, où). Sur grand écran, HeroFilters prend le relais.
 */
export default function MobileSearch() {
    const { suggestions } = useFilterSuggestions()
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState(EMPTY_HERO_SEARCH)
    const searchHref = heroSearchHref(search, (suggestions.domaine ?? []).map((s) => s.value))
    const summary = [search.categorie, search.formation, search.age && `${search.age === '0.5' ? 'moins d’un an' : `${search.age} an${search.age === '1' ? '' : 's'}`}`, search.ville]
        .filter(Boolean)
        .join(' · ')

    return (
        <div className='sm:hidden'>
            <button
                type='button'
                onClick={() => setOpen(true)}
                className='flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-4 text-left shadow-[0_18px_40px_-16px_rgba(15,76,92,0.45)] ring-1 ring-secondary/10 hover:cursor-pointer'>
                <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white'>
                    <Icon icon='tabler:search' className='text-xl' />
                </span>
                <span className='flex min-w-0 flex-col'>
                    <span className='font-semibold text-secondary'>Que cherchez-vous ?</span>
                    <span className='truncate text-sm text-ink/60'>{summary || 'Formation, école, ville…'}</span>
                </span>
            </button>

            <div className='mt-3 flex flex-wrap justify-center gap-2'>
                {SHORTCUTS.map((s) => (
                    <Link
                        key={s.label}
                        href={`/recherche?categorie=${encodeURIComponent(s.categorie)}`}
                        className='rounded-full bg-white/80 px-3 py-1.5 text-sm font-medium text-secondary ring-1 ring-secondary/15 backdrop-blur hover:bg-white'>
                        {s.label}
                    </Link>
                ))}
            </div>

            <Dialog open={open} onClose={() => setOpen(false)} className='relative z-50 sm:hidden'>
                <DialogPanel className='fixed inset-0 flex flex-col overflow-y-auto bg-offwhite'>
                    <div className='sticky top-0 z-10 flex items-center gap-2 border-b border-gray-100 bg-white px-2 py-3'>
                        <button
                            type='button'
                            onClick={() => setOpen(false)}
                            aria-label='Fermer la recherche'
                            className='flex h-11 w-11 items-center justify-center rounded-full text-secondary hover:bg-offwhite hover:cursor-pointer'>
                            <Icon icon='tabler:arrow-left' className='text-2xl' />
                        </button>
                        <DialogTitle className='text-lg font-bold text-secondary'>Rechercher</DialogTitle>
                    </div>

                    <div className='flex flex-col gap-3 p-4'>
                        <HeroSearchFields
                            search={search}
                            onChange={setSearch}
                            fieldClassName='rounded-2xl bg-white px-4 py-3 ring-1 ring-gray-100 focus-within:ring-2 focus-within:ring-primary/30'
                        />

                        <Link
                            href={searchHref}
                            onClick={() => setOpen(false)}
                            className='mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary/90'>
                            <Icon icon='tabler:search' className='text-xl' />
                            Rechercher
                        </Link>
                        <p className='text-center text-sm text-ink/60'>Laissez un champ vide pour ne pas filtrer dessus.</p>
                    </div>
                </DialogPanel>
            </Dialog>
        </div>
    )
}
