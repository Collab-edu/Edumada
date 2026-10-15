'use client'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Icon } from '@iconify/react/dist/iconify.js'
import { useSiteData } from '@/data/site-data'
import { cn } from '@/lib/utils'
import FilterDropdown from './FilterDropdown'
import ResultCard from './ResultCard'
import SearchFiltersPanel from './SearchFiltersPanel'
import {
    EMPTY_FILTERS,
    SORT_OPTIONS,
    activeFilters,
    filtersFromParams,
    matchesFilters,
    sortFormations,
    type SearchFilters,
    type SortValue,
} from '../filters'

// Filtres principaux repris du Hero (le niveau d'études devient « Diplôme préparé » dans le panneau).
const TOP_FILTERS = [
    { param: 'domaine', icon: 'tabler:book-2' },
    { param: 'ville', icon: 'tabler:map-pin' },
    { param: 'type', icon: 'tabler:building-community' },
] as const

const SearchPage = () => {
    const searchParams = useSearchParams()
    const { data: formations, loading } = useSiteData('FormationData')
    const { data: heroFilters } = useSiteData('HeroFilterData')

    const [filters, setFilters] = useState<SearchFilters>(() => filtersFromParams(searchParams))
    const [sort, setSort] = useState<SortValue>('pertinence')
    const [favorites, setFavorites] = useState<string[]>([])
    const [panelOpen, setPanelOpen] = useState(false)

    // Bloque le défilement de la page quand le panneau mobile est ouvert.
    useEffect(() => {
        document.body.style.overflow = panelOpen ? 'hidden' : ''
        return () => {
            document.body.style.overflow = ''
        }
    }, [panelOpen])

    const results = useMemo(
        () => sortFormations(formations.filter((f) => matchesFilters(f, filters)), sort),
        [formations, filters, sort]
    )
    const chips = activeFilters(filters)
    const advancedCount = chips.filter((c) => !['q', 'domaine', 'ville', 'type'].includes(c.id)).length

    const toggleFavorite = (id: string) =>
        setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
    const reset = () => setFilters(EMPTY_FILTERS)

    return (
        <section className='pt-32 pb-20'>
            <div className='container mx-auto max-w-7xl px-4'>
                {/* En-tête */}
                <div className='mb-8 flex flex-col gap-2'>
                    <h1 className='text-3xl md:text-4xl font-bold tracking-tight text-secondary'>
                        Trouvez votre formation
                    </h1>
                    <p className='text-ink/70'>
                        Affinez votre recherche avec les filtres et comparez les formations proposées à Madagascar.
                    </p>
                </div>

                {/* Barre de recherche principale */}
                <div className='mb-8 rounded-2xl bg-white p-3 ring-1 ring-secondary/10 shadow-[0_24px_60px_-30px_rgba(15,76,92,0.45)]'>
                    <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 lg:items-center'>
                        <div className='rounded-xl px-4 py-3 lg:border-r lg:border-gray-100 lg:rounded-none'>
                            <label htmlFor='search-q' className='flex items-center gap-1.5 text-base font-medium text-gray-500'>
                                <Icon icon='tabler:search' className='text-base text-secondary' />
                                Formation ou métier
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
                        {TOP_FILTERS.map(({ param, icon }) => {
                            const filter = heroFilters.find((f) => f.param === param)
                            if (!filter) return null
                            return (
                                <div
                                    key={param}
                                    className='rounded-xl px-4 py-3 transition-colors duration-200 hover:bg-offwhite lg:border-r lg:border-gray-100 lg:rounded-none lg:last:border-r-0'>
                                    <FilterDropdown
                                        icon={icon}
                                        label={filter.label}
                                        options={filter.options}
                                        value={filters[param] || filter.options[0]}
                                        onChange={(value) =>
                                            setFilters({ ...filters, [param]: value === filter.options[0] ? '' : value })
                                        }
                                    />
                                </div>
                            )
                        })}
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
                                    className='lg:hidden rounded-full bg-black/10 p-1 hover:cursor-pointer'>
                                    <Icon icon='material-symbols:close-rounded' className='text-xl' />
                                </button>
                            </div>
                        </div>
                        <SearchFiltersPanel filters={filters} onChange={setFilters} />
                        <button
                            type='button'
                            onClick={() => setPanelOpen(false)}
                            className='mt-6 w-full rounded-lg bg-primary py-3 font-bold text-white lg:hidden hover:cursor-pointer'>
                            Voir {results.length} résultat{results.length > 1 ? 's' : ''}
                        </button>
                    </aside>

                    {/* Résultats */}
                    <div className='flex flex-col gap-5'>
                        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
                            <p className='font-semibold text-secondary' aria-live='polite'>
                                {loading
                                    ? 'Chargement des formations…'
                                    : `${results.length} formation${results.length > 1 ? 's' : ''} trouvée${results.length > 1 ? 's' : ''}`}
                            </p>
                            <div className='flex items-center gap-3'>
                                <button
                                    type='button'
                                    onClick={() => setPanelOpen(true)}
                                    className='lg:hidden inline-flex items-center gap-2 rounded-lg border border-secondary/20 bg-white px-4 py-2 font-semibold text-secondary hover:cursor-pointer'>
                                    <Icon icon='tabler:adjustments-horizontal' className='text-lg' />
                                    Filtres{advancedCount > 0 && ` (${advancedCount})`}
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
                                        isFavorite={favorites.includes(formation.id)}
                                        onToggleFavorite={() => toggleFavorite(formation.id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className='flex flex-col items-center gap-4 rounded-2xl border border-dashed border-secondary/20 bg-white px-6 py-16 text-center'>
                                <span className='flex h-16 w-16 items-center justify-center rounded-full bg-cream text-primary'>
                                    <Icon icon='tabler:search-off' className='text-3xl' />
                                </span>
                                <h2 className='text-xl font-bold'>Aucune formation ne correspond</h2>
                                <p className='max-w-md text-ink/70'>
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
