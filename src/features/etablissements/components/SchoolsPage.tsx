'use client'
import { useMemo, useState } from 'react'
import { CardSkeletonGrid } from '@/components/ui/card'
import { useSiteData } from '@/data/site-data'
import SuggestInput from '@/features/recherche/components/SuggestInput'
import { FILTER_UI } from '@/features/recherche/useFilterSuggestions'
import SchoolCard from './SchoolCard'

/** Valeurs distinctes triées, avec le nombre d'établissements correspondants. */
const toSuggestions = (values: string[]) =>
    [...new Set(values.filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, 'fr'))
        .map((value) => {
            const count = values.filter((v) => v === value).length
            return { value, hint: `${count} établissement${count > 1 ? 's' : ''}` }
        })

/** Liste de tous les établissements, filtrable par catégorie et par ville. */
export default function SchoolsPage() {
    const { data: schools, loading } = useSiteData('SchoolData')
    const { data: categories } = useSiteData('CategoryData')
    const [filters, setFilters] = useState({ category: '', city: '' })

    const categoryLabel = useMemo(() => {
        const labels = new Map(categories.map((c) => [c.id, c.shortLabel]))
        return (id: string) => labels.get(id) ?? ''
    }, [categories])
    const categorySuggestions = useMemo(() => toSuggestions(schools.map((s) => categoryLabel(s.category))), [schools, categoryLabel])
    const citySuggestions = useMemo(() => toSuggestions(schools.map((s) => s.city)), [schools])
    const shown = schools.filter(
        (s) => (!filters.category || categoryLabel(s.category) === filters.category) && (!filters.city || s.city === filters.city)
    )
    const filtered = !!(filters.category || filters.city)

    return (
        <section className='pt-28 pb-20 sm:pt-32'>
            <div className='container mx-auto max-w-7xl px-4'>
                <div className='mb-6 flex max-w-3xl flex-col gap-2 sm:mb-8'>
                    <h1 className='text-3xl md:text-4xl font-bold text-secondary'>Les établissements</h1>
                    <p className='text-ink/70'>
                        Universités, écoles, crèches et centres de formation à Madagascar : consultez leur fiche et découvrez les formations qu&apos;ils
                        proposent.
                    </p>
                </div>

                {/* Filtre : catégorie et localisation */}
                <form
                    role='search'
                    aria-label='Filtrer les établissements'
                    onSubmit={(e) => e.preventDefault()}
                    className='mb-6 grid grid-cols-1 gap-2 rounded-2xl bg-white p-3 ring-1 ring-secondary/10 shadow-[0_24px_60px_-30px_rgba(15,76,92,0.45)] sm:grid-cols-[1fr_1fr_auto] sm:items-center'>
                    {[
                        { key: 'category' as const, ui: FILTER_UI.categorie, label: 'Catégorie', suggestions: categorySuggestions },
                        { key: 'city' as const, ui: FILTER_UI.ville, label: 'Ville / Localisation', suggestions: citySuggestions },
                    ].map((field) => (
                        <div key={field.key} className='rounded-xl px-4 py-3 transition-colors duration-200 hover:bg-offwhite sm:rounded-none sm:border-r sm:border-gray-100'>
                            <SuggestInput
                                icon={field.ui.icon}
                                label={field.label}
                                placeholder={field.ui.placeholder}
                                suggestions={field.suggestions}
                                value={filters[field.key]}
                                onChange={(value) => setFilters((prev) => ({ ...prev, [field.key]: value }))}
                            />
                        </div>
                    ))}
                    <button
                        type='button'
                        onClick={() => setFilters({ category: '', city: '' })}
                        disabled={!filtered}
                        className='h-11 rounded-lg px-4 text-sm font-semibold text-primary hover:underline disabled:hidden sm:disabled:block sm:disabled:invisible hover:cursor-pointer'>
                        Réinitialiser
                    </button>
                </form>

                {loading ? (
                    <CardSkeletonGrid count={8} className='h-[360px]' />
                ) : shown.length === 0 ? (
                    <p className='rounded-xl bg-white p-8 text-center text-ink/70'>
                        {filtered ? 'Aucun établissement ne correspond à ces critères.' : 'Aucun établissement publié pour le moment.'}
                    </p>
                ) : (
                    <>
                        <p className='mb-4 text-sm text-ink/60' aria-live='polite'>
                            {shown.length} établissement{shown.length > 1 ? 's' : ''}
                        </p>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                            {shown.map((school) => (
                                <SchoolCard key={school.id} school={school} compact />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    )
}
