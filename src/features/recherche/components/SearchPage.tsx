'use client'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Icon } from '@/components/ui/icon'
import { Button } from '@/components/ui/form'
import { useAuth } from '@/features/auth/AuthProvider'
import { track } from '@/lib/track'
import { cn } from '@/lib/utils'
import CityPicker from './CityPicker'
import SuggestInput from './SuggestInput'
import { MY_POSITION, placePosition } from '../places'
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
import { useT } from '@/i18n/client'


const SearchPage = () => {
    const t = useT()
    const searchParams = useSearchParams()
    const { suggestions } = useFilterSuggestions()
    const { isFavorite, toggleFavorite } = useAuth()

    const [filters, setFilters] = useState<SearchFilters>(() => filtersFromParams(searchParams))
    // Champs de la barre en cours de saisie : appliqués aux résultats au clic sur « Rechercher ».
    const [draft, setDraft] = useState<SearchFilters>(filters)
    const [sort, setSort] = useState<SortValue>('pertinence')
    const [panelOpen, setPanelOpen] = useState(false)
    const { results, total, loading, loadingMore, hasMore, offline, loadMore, near, placeNotFound } = useOfferSearch(filters, sort)
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

    const chips = activeFilters(filters, t)
    const advancedCount = chips.filter((c) => !['q', 'categorie', 'domaine', 'ville', 'type'].includes(c.id)).length

    // Filtres appliqués tout de suite (filtres avancés, pastilles) : la saisie en cours de la barre est conservée.
    const applyNow = (next: SearchFilters) => {
        setFilters(next)
        setDraft((d) => ({ ...next, q: d.q, categorie: d.categorie, domaine: d.domaine, ville: d.ville, pos: d.pos, type: d.type }))
    }
    const reset = () => {
        setFilters(EMPTY_FILTERS)
        setDraft(EMPTY_FILTERS)
    }
    // Sur mobile, Domaine / Ville / Type sont dans le panneau : on les compte dans le badge du bouton.
    const mobileCount = chips.filter((c) => c.id !== 'q').length

    // « Rechercher » : applique la barre, ferme le clavier et descend aux résultats.
    const resultsRef = useRef<HTMLDivElement>(null)
    const submitSearch = (e?: React.FormEvent) => {
        e?.preventDefault()
        setFilters((prev) => ({ ...prev, q: draft.q, categorie: draft.categorie, domaine: draft.domaine, ville: draft.ville, pos: draft.pos, type: draft.type }))
        setPanelOpen(false)
        ;(document.activeElement as HTMLElement | null)?.blur()
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    const renderTopFilters = (className: string) =>
        TOP_FILTERS.map(({ param, label }) => {
            return (
                <div key={param} className={className}>
                    {param === 'ville' ? (
                        <CityPicker
                            label={label}
                            placeholder='Ex. : Antananarivo, Toamasina…'
                            suggestions={suggestions.ville ?? []}
                            value={draft.ville}
                            onChange={(value, place) => setDraft((prev) => ({ ...prev, ville: value, pos: placePosition(place) }))}
                        />
                    ) : (
                    <SuggestInput
                        icon={FILTER_UI[param].icon}
                        label={FILTER_UI[param].label ?? label}
                        placeholder={FILTER_UI[param].placeholder}
                        suggestions={suggestions[param] ?? []}
                        value={draft[param]}
                        onChange={(value) => setDraft((prev) => ({ ...prev, [param]: value }))}
                    />
                    )}
                </div>
            )
        })

    return (
        <section className='pt-24 pb-20 sm:pt-32'>
            <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                {/* En-tête */}
                <div className='mobile-center mb-6 sm:mb-8 flex flex-col gap-2'>
                    <h1 className='text-3xl md:text-4xl font-bold text-secondary'>
                        {t('Formations, écoles et crèches')}
                    </h1>
                    <p className='text-black'>
                        {t('Affinez votre recherche et comparez les offres des établissements à Madagascar, de la crèche à l’université.')}
                    </p>
                </div>

                {/* Barre de recherche principale */}
                <form
                    role='search'
                    aria-label='Rechercher une formation'
                    onSubmit={submitSearch}
                    className='mb-6 sm:mb-8 rounded-2xl bg-white p-3 ring-1 ring-secondary/10 shadow-[0_24px_60px_-30px_rgba(15,76,92,0.45)]'>
                    <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 lg:items-center'>
                        <div className='rounded-xl px-4 py-3 sm:col-span-2 lg:col-span-3 lg:rounded-none'>
                            <label htmlFor='search-q' className='flex items-center gap-1.5 text-base font-medium text-gray-500'>
                                <Icon icon='tabler:search' className='text-base text-secondary' />
                                {t('Formation, niveau, métier…')}
                            </label>
                            <input
                                id='search-q'
                                type='search'
                                value={draft.q}
                                onChange={(e) => setDraft({ ...draft, q: e.target.value })}
                                placeholder={t('Ex. : informatique, infirmier…')}
                                className='mt-1 w-full bg-transparent py-1 text-base font-semibold text-ink outline-hidden placeholder:font-normal placeholder:text-ink/40'
                            />
                        </div>
                        {/* Sur mobile, ces filtres passent dans le panneau « Filtres » pour laisser la place aux résultats. */}
                        {renderTopFilters('hidden sm:block rounded-xl px-4 py-3 transition-colors duration-200 hover:bg-offwhite lg:order-last lg:rounded-none lg:border-r lg:border-t lg:border-gray-100 lg:[&:nth-last-child(2)]:border-r-0')}
                        {/* Sur ordinateur : champ principal et bouton en haut, les quatre filtres dessous. */}
                        <Button type='submit' className='h-12 sm:col-span-2 lg:col-span-1'>
                            <Icon icon='tabler:search' className='text-lg' />
                            Rechercher
                        </Button>
                    </div>
                </form>

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
                        aria-label={t('Filtres avancés')}>
                        <div className='flex items-center justify-between pb-2'>
                            <p className='text-lg font-bold text-secondary'>{t('Filtres')}</p>
                            <div className='flex items-center gap-3'>
                                {chips.length > 0 && (
                                    <button
                                        type='button'
                                        onClick={reset}
                                        className='text-sm font-semibold text-primary hover:underline hover:cursor-pointer'>
                                        {t('Réinitialiser')}
                                    </button>
                                )}
                                <button
                                    type='button'
                                    onClick={() => setPanelOpen(false)}
                                    aria-label={t('Fermer les filtres')}
                                    className='lg:hidden rounded-full bg-black/10 p-2.5 hover:cursor-pointer'>
                                    <Icon icon='material-symbols:close-rounded' className='text-xl' />
                                </button>
                            </div>
                        </div>
                        <div className='flex flex-col divide-y divide-gray-100 border-b border-gray-100 sm:hidden'>
                            {renderTopFilters('py-3')}
                        </div>
                        <SearchFiltersPanel filters={filters} onChange={applyNow} />
                        <button
                            type='button'
                            onClick={() => submitSearch()}
                            className='mt-6 w-full rounded-lg bg-primary py-3 font-bold text-white lg:hidden hover:cursor-pointer'>
                            Rechercher
                        </button>
                    </aside>

                    {/* Résultats */}
                    <div ref={resultsRef} className='flex scroll-mt-28 flex-col gap-5'>
                        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
                            <p className='font-semibold text-secondary' aria-live='polite'>
                                {loading
                                    ? t('Chargement…')
                                    : t(total > 1 ? `${total} résultats` : `${total} résultat`)}
                            </p>
                            <div className='flex items-center gap-3'>
                                <button
                                    type='button'
                                    onClick={() => setPanelOpen(true)}
                                    className='lg:hidden inline-flex items-center gap-2 rounded-lg border border-secondary/20 bg-white px-4 py-2 font-semibold text-secondary hover:cursor-pointer'>
                                    <Icon icon='tabler:adjustments-horizontal' className='text-lg' />
                                    {t('Filtres')}
                                    {mobileCount > 0 && <span className='sm:hidden'>({mobileCount})</span>}
                                    {advancedCount > 0 && <span className='hidden sm:inline'>({advancedCount})</span>}
                                </button>
                                <label className='flex items-center gap-2 text-ink/70'>
                                    <span className='hidden sm:inline'>{t('Trier par')}</span>
                                    <select
                                        value={sort}
                                        onChange={(e) => setSort(e.target.value as SortValue)}
                                        className='rounded-lg border border-gray-200 bg-white px-3 py-2 text-ink outline-hidden focus:border-primary hover:cursor-pointer'>
                                        {SORT_OPTIONS.map((o) => (
                                            <option key={o.value} value={o.value}>
                                                {t(o.label)}
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
                                        onClick={() => {
                                            const next = chip.remove(filters)
                                            setFilters(next)
                                            setDraft((d) => chip.remove(d))
                                        }}
                                        aria-label={t('Retirer le filtre {label}', { label: chip.label })}
                                        className='inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1.5 text-sm font-medium text-secondary transition-colors duration-200 hover:bg-primary hover:text-white hover:cursor-pointer'>
                                        {chip.label}
                                        <Icon icon='tabler:x' className='text-sm' />
                                    </button>
                                ))}
                            </div>
                        )}

                        {!loading && near && (
                            <p className='flex items-start gap-2 rounded-xl border border-secondary/15 bg-white px-4 py-3 text-sm text-black' role='status'>
                                <Icon icon='tabler:current-location' className='mt-0.5 shrink-0 text-lg text-primary' />
                                <span>
                                    {near.place === MY_POSITION ? (
                                        <>{t('Voici les formations les plus proches de')} <strong>{t('votre position')}</strong>{t(', de la plus près à la plus loin.')}</>
                                    ) : (
                                        <>
                                            {t('Aucune formation à')} <strong>{near.place}</strong> {t('pour le moment. Voici les plus proches, de la plus près à la plus loin.')}
                                        </>
                                    )}
                                </span>
                            </p>
                        )}
                        {!loading && placeNotFound && (
                            <p className='flex items-start gap-2 rounded-xl bg-cream px-4 py-3 text-sm text-black' role='status'>
                                <Icon icon='tabler:map-pin-off' className='mt-0.5 shrink-0 text-lg text-primary' />
                                <span>
                                    {t('Lieu')} « <strong>{filters.ville}</strong> » {t('introuvable à Madagascar. Vérifiez l’orthographe ou choisissez une ville proposée.')}
                                </span>
                            </p>
                        )}

                        {offline && (
                            <p className='flex items-start gap-2 rounded-xl bg-cream px-4 py-3 text-sm text-black' role='status'>
                                <Icon icon='tabler:wifi-off' className='mt-0.5 shrink-0 text-primary' />
                                {t('Le service Edumada ne répond pas : les résultats affichés peuvent ne pas être à jour.')}
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
                            <div className='flex flex-col gap-4' role='status' aria-live='polite'>
                                <p className='flex items-center gap-2 font-medium text-secondary'>
                                    <span className='h-5 w-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary' aria-hidden='true' />
                                    {t('Recherche des formations…')}
                                </p>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className='h-[460px] rounded-2xl bg-white border border-gray-100 animate-pulse' />
                                    ))}
                                </div>
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
                                {loadingMore ? t('Chargement…') : t('Voir plus de résultats ({shown} sur {total})', { shown: results.length, total })}
                            </button>
                        )}
                        {loading || results.length > 0 ? null : (
                            <div className='flex flex-col items-center gap-4 rounded-2xl border border-dashed border-secondary/20 bg-white px-6 py-16 text-center'>
                                <span className='flex h-16 w-16 items-center justify-center rounded-full bg-cream text-primary'>
                                    <Icon icon='tabler:search-off' className='text-3xl' />
                                </span>
                                <h2 className='text-xl font-bold'>{t('Aucun résultat ne correspond')}</h2>
                                <p className='max-w-md text-black'>
                                    {t('Essayez de retirer quelques filtres ou d’élargir votre recherche à d’autres villes.')}
                                </p>
                                <button
                                    type='button'
                                    onClick={reset}
                                    className='rounded-lg bg-primary px-6 py-3 font-bold text-white transition-colors duration-300 hover:bg-primary/90 hover:cursor-pointer'>
                                    {t('Réinitialiser les filtres')}
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
