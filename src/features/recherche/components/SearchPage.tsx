'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Icon } from '@/components/ui/icon'
import { useAuth } from '@/features/auth/AuthProvider'
import { track } from '@/lib/track'
import { cn } from '@/lib/utils'
import SuggestInput from './SuggestInput'
import ResultCard from './ResultCard'
import SearchFiltersPanel from './SearchFiltersPanel'
import {
    EMPTY_FILTERS,
    SORT_OPTIONS,
    activeFilters,
    filtersFromParams,
    type SearchFilters,
    type SortValue,
} from '../filters'
import { useOfferSearch, useSponsoredOffers } from '../useOfferSearch'
import { FILTER_UI, TOP_FILTERS, useFilterSuggestions } from '../useFilterSuggestions'


const SearchPage = () => {
    const searchParams = useSearchParams()
    const { suggestions } = useFilterSuggestions()
    const { isFavorite, toggleFavorite } = useAuth()

    const [filters, setFilters] = useState<SearchFilters>(() => filtersFromParams(searchParams))
    const [sort, setSort] = useState<SortValue>('pertinence')
    const [panelOpen, setPanelOpen] = useState(false)
    const { results, total, loading, loadingMore, hasMore, offline, loadMore } = useOfferSearch(filters, sort)
    const sponsored = useSponsoredOffers(filters)

    // Impressions des emplacements sponsorisés (statistiques Premium).
    useEffect(() => {
        sponsored.forEach((s) => track({ type: 'impression', establishment: s.offer.schoolId, offer: s.offer.id, campaign: s.campaignId }))
    }, [sponsored])

    // Bloque le défilement de la page quand le panneau mobile est ouvert.
    useEffect(() => {
        document.body.style.overflow = panelOpen ? 'hidden' : ''
        return () => {
            document.body.style.overflow = ''
        }
    }, [panelOpen])

    const chips = activeFilters(filters)
    const advancedCount = chips.filter((c) => !['q', 'categorie', 'domaine', 'ville', 'type'].includes(c.id)).length

    const reset = () => setFilters(EMPTY_FILTERS)
    // Sur mobile, Domaine / Ville / Type sont dans le panneau : on les compte dans le badge du bouton.
    const mobileCount = chips.filter((c) => c.id !== 'q').length

    const renderTopFilters = (className: string) =>
        TOP_FILTERS.map(({ param, label }) => {
            return (
                <div key={param} className={className}>
                    <SuggestInput
                        icon={FILTER_UI[param].icon}
                        label={FILTER_UI[param].label ?? label}
                        placeholder={FILTER_UI[param].placeholder}
                        suggestions={suggestions[param] ?? []}
                        value={filters[param]}
                        onChange={(value) => setFilters((prev) => ({ ...prev, [param]: value }))}
                    />
                </div>
            )
        })

    return (
        <section className='pt-24 pb-20 sm:pt-32'>
            <div className='container mx-auto max-w-7xl px-4'>
                {/* En-tête */}
                <div className='mb-6 sm:mb-8 flex flex-col gap-2'>
                    <h1 className='text-3xl md:text-4xl font-bold text-secondary'>
                        Formations, écoles et crèches
                    </h1>
                    <p className='text-black'>
                        Affinez votre recherche et comparez les offres des établissements à Madagascar, de la crèche à l’université.
                    </p>
                </div>

                {/* Barre de recherche principale */}
                <div className='mb-6 sm:mb-8 rounded-2xl bg-white p-3 ring-1 ring-secondary/10 shadow-[0_24px_60px_-30px_rgba(15,76,92,0.45)]'>
                    <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5 lg:items-center'>
                        <div className='rounded-xl px-4 py-3 lg:border-r lg:border-gray-100 lg:rounded-none'>
                            <label htmlFor='search-q' className='flex items-center gap-1.5 text-base font-medium text-gray-500'>
                                <Icon icon='tabler:search' className='text-base text-secondary' />
                                Formation, niveau, métier…
                            </label>
                            <input
                                id='search-q'
                                type='search'
                                value={filters.q}
                                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                                placeholder='Ex. : informatique, infirmier…'
                                className='mt-1 w-full bg-transparent py-1 text-base font-semibold text-ink outline-hidden placeholder:font-normal placeholder:text-ink/40'
                            />
                        </div>
                        {/* Sur mobile, ces filtres passent dans le panneau « Filtres » pour laisser la place aux résultats. */}
                        {renderTopFilters('hidden sm:block rounded-xl px-4 py-3 transition-colors duration-200 hover:bg-offwhite lg:border-r lg:border-gray-100 lg:rounded-none lg:last:border-r-0')}
                    </div>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8'>
                    {/* Filtres avancés : colonne sur ordinateur, panneau coulissant sur mobile */}
                    {panelOpen && (
                        <div className='fixed inset-0 z-40 bg-black/50 lg:hidden' onClick={() => setPanelOpen(false)} />
                    )}
                    <aside
                        className={cn(
                            'fixed inset-y-0 left-0 z-50 w-full max-w-sm overflow-y-auto bg-white p-5 shadow-lg transition-transform duration-300',
                            'lg:static lg:z-auto lg:max-w-none lg:translate-x-0 lg:self-start lg:rounded-2xl lg:border lg:border-gray-100 lg:shadow-sm lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)]',
                            panelOpen ? 'translate-x-0' : '-translate-x-full'
                        )}
                        aria-label='Filtres avancés'>
                        <div className='flex items-center justify-between pb-2'>
                            <p className='text-lg font-bold text-secondary'>Filtres</p>
                            <div className='flex items-center gap-3'>
                                {chips.length > 0 && (
                                    <button
                                        type='button'
                                        onClick={reset}
                                        className='text-sm font-semibold text-primary hover:underline hover:cursor-pointer'>
                                        Réinitialiser
                                    </button>
                                )}
                                <button
                                    type='button'
                                    onClick={() => setPanelOpen(false)}
                                    aria-label='Fermer les filtres'
                                    className='lg:hidden rounded-full bg-black/10 p-2.5 hover:cursor-pointer'>
                                    <Icon icon='material-symbols:close-rounded' className='text-xl' />
                                </button>
                            </div>
                        </div>
                        <div className='flex flex-col divide-y divide-gray-100 border-b border-gray-100 sm:hidden'>
                            {renderTopFilters('py-3')}
                        </div>
                        <SearchFiltersPanel filters={filters} onChange={setFilters} />
                        <button
                            type='button'
                            onClick={() => setPanelOpen(false)}
                            className='mt-6 w-full rounded-lg bg-primary py-3 font-bold text-white lg:hidden hover:cursor-pointer'>
                            Voir {total} résultat{total > 1 ? 's' : ''}
                        </button>
                    </aside>

                    {/* Résultats */}
                    <div className='flex flex-col gap-5'>
                        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
                            <p className='font-semibold text-secondary' aria-live='polite'>
                                {loading
                                    ? 'Chargement…'
                                    : `${total} résultat${total > 1 ? 's' : ''}`}
                            </p>
                            <div className='flex items-center gap-3'>
                                <button
                                    type='button'
                                    onClick={() => setPanelOpen(true)}
                                    className='lg:hidden inline-flex items-center gap-2 rounded-lg border border-secondary/20 bg-white px-4 py-2 font-semibold text-secondary hover:cursor-pointer'>
                                    <Icon icon='tabler:adjustments-horizontal' className='text-lg' />
                                    Filtres
                                    {mobileCount > 0 && <span className='sm:hidden'>({mobileCount})</span>}
                                    {advancedCount > 0 && <span className='hidden sm:inline'>({advancedCount})</span>}
                                </button>
                                <label className='flex items-center gap-2 text-ink/70'>
                                    <span className='hidden sm:inline'>Trier par</span>
                                    <select
                                        value={sort}
                                        onChange={(e) => setSort(e.target.value as SortValue)}
                                        className='rounded-lg border border-gray-200 bg-white px-3 py-2 text-ink outline-hidden focus:border-primary hover:cursor-pointer'>
                                        {SORT_OPTIONS.map((o) => (
                                            <option key={o.value} value={o.value}>
                                                {o.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        </div>

                        {chips.length > 0 && (
                            <div className='flex flex-wrap items-center gap-2'>
                                {chips.map((chip) => (
                                    <button
                                        key={chip.id}
                                        type='button'
                                        onClick={() => setFilters(chip.remove(filters))}
                                        aria-label={`Retirer le filtre ${chip.label}`}
                                        className='inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1.5 text-sm font-medium text-secondary transition-colors duration-200 hover:bg-primary hover:text-white hover:cursor-pointer'>
                                        {chip.label}
                                        <Icon icon='tabler:x' className='text-sm' />
                                    </button>
                                ))}
                            </div>
                        )}

                        {offline && (
                            <p className='flex items-start gap-2 rounded-xl bg-cream px-4 py-3 text-sm text-black' role='status'>
                                <Icon icon='tabler:wifi-off' className='mt-0.5 shrink-0 text-primary' />
                                Le service Edumada ne répond pas : les résultats affichés peuvent ne pas être à jour.
                            </p>
                        )}

                        {sponsored.length > 0 && !loading && (
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                {sponsored.map((item) => (
                                    <div
                                        key={item.campaignId}
                                        onClickCapture={() => track({ type: 'click', establishment: item.offer.schoolId, offer: item.offer.id, campaign: item.campaignId })}>
                                        <ResultCard
                                            formation={item.offer}
                                            sponsored
                                            isFavorite={isFavorite(item.offer.id)}
                                            onToggleFavorite={() => toggleFavorite(item.offer.id)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {loading ? (
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className='h-[460px] rounded-2xl bg-white border border-gray-100 animate-pulse' />
                                ))}
                            </div>
                        ) : results.length > 0 ? (
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                {results.map((formation) => (
                                    <ResultCard
                                        key={formation.id}
                                        formation={formation}
                                        isFavorite={isFavorite(formation.id)}
                                        onToggleFavorite={() => toggleFavorite(formation.id)}
                                    />
                                ))}
                            </div>
                        ) : null}
                        {!loading && hasMore && (
                            <button
                                type='button'
                                onClick={loadMore}
                                disabled={loadingMore}
                                className='mx-auto rounded-lg border border-primary px-6 py-3 font-semibold text-primary transition-colors duration-300 hover:bg-primary hover:text-white disabled:opacity-60 hover:cursor-pointer'>
                                {loadingMore ? 'Chargement…' : `Voir plus de résultats (${results.length} sur ${total})`}
                            </button>
                        )}
                        {loading || results.length > 0 ? null : (
                            <div className='flex flex-col items-center gap-4 rounded-2xl border border-dashed border-secondary/20 bg-white px-6 py-16 text-center'>
                                <span className='flex h-16 w-16 items-center justify-center rounded-full bg-cream text-primary'>
                                    <Icon icon='tabler:search-off' className='text-3xl' />
                                </span>
                                <h2 className='text-xl font-bold'>Aucun résultat ne correspond</h2>
                                <p className='max-w-md text-black'>
                                    Essayez de retirer quelques filtres ou d&apos;élargir votre recherche à d&apos;autres villes.
                                </p>
                                <button
                                    type='button'
                                    onClick={reset}
                                    className='rounded-lg bg-primary px-6 py-3 font-bold text-white transition-colors duration-300 hover:bg-primary/90 hover:cursor-pointer'>
                                    Réinitialiser les filtres
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SearchPage
