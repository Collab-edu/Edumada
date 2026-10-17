'use client'
import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Icon } from '@/components/ui/icon'
import { ButtonLink } from '@/components/ui/form'
import SectionHeader from '@/components/ui/section-header'
import { CardSkeletonGrid } from '@/components/ui/card'
import { useSiteData } from '@/data/site-data'
import SuggestInput from '@/features/recherche/components/SuggestInput'
import { FILTER_UI } from '@/features/recherche/useFilterSuggestions'
import SchoolCard from './SchoolCard'
import type { SchoolType } from '../types'

const BENEFITS = [
    { icon: 'tabler:id-badge-2', title: 'Des fiches complètes', text: 'Présentation, formations proposées, conditions d’admission et pièces à fournir, au même endroit.' },
    { icon: 'tabler:rosette-discount-check', title: 'Une reconnaissance indiquée', text: 'Vérifiez sur chaque fiche le statut de vérification et la reconnaissance déclarée par l’établissement.' },
    { icon: 'tabler:message-circle', title: 'Un contact direct', text: 'Écrivez ou appelez l’établissement depuis sa fiche, sans intermédiaire.' },
]

/** Textes et périmètre de chaque variante de la page. */
const VARIANTS = {
    /** Tous les établissements, filtrés par catégorie. */
    all: {
        categoryId: null,
        eyebrow: 'Établissements',
        title: 'Trouvez l’établissement qui vous correspond',
        intro: 'Universités, écoles, crèches et centres de formation à Madagascar : consultez leur fiche, découvrez les formations qu’ils proposent, puis contactez-les directement.',
        image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=70',
        imageAlt: 'Campus d’un établissement d’enseignement',
        listTitle: 'Tous les établissements',
        firstFilter: { label: 'Catégorie', icon: FILTER_UI.categorie.icon, placeholder: FILTER_UI.categorie.placeholder },
        noun: ['établissement', 'établissements'],
        cta: { title: 'Vous dirigez un établissement ?', text: 'Présentez vos formations gratuitement et recevez les demandes des futurs élèves et étudiants.' },
    },
    /** Enseignement supérieur uniquement, filtré par filière (domaines enseignés). */
    universites: {
        categoryId: 'superieur',
        eyebrow: 'Universités',
        title: 'Trouvez votre université',
        intro: 'Universités, instituts supérieurs, écoles supérieures et grandes écoles à Madagascar : comparez les cursus après le bac, puis contactez directement l’établissement.',
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=70',
        imageAlt: 'Étudiants de l’enseignement supérieur',
        listTitle: 'Les universités et écoles supérieures',
        firstFilter: { label: 'Filière', icon: FILTER_UI.domaine.icon, placeholder: 'Ex. : informatique, droit…' },
        noun: ['établissement', 'établissements'],
        cta: { title: 'Vous dirigez une université ou une école supérieure ?', text: 'Présentez vos cursus gratuitement et recevez les demandes des futurs étudiants.' },
    },
} as const

/** Valeurs distinctes triées, avec le nombre d'établissements correspondants. */
const toSuggestions = (values: string[]) =>
    [...new Set(values.filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, 'fr'))
        .map((value) => {
            const count = values.filter((v) => v === value).length
            return { value, hint: `${count} établissement${count > 1 ? 's' : ''}` }
        })

/** Liste d'établissements filtrable : tous (par catégorie) ou les universités (par filière). */
export default function SchoolsPage({ variant = 'all' }: { variant?: keyof typeof VARIANTS }) {
    const config = VARIANTS[variant]
    const { data: allSchools, loading } = useSiteData('SchoolData')
    const { data: categories } = useSiteData('CategoryData')
    const [filters, setFilters] = useState({ kind: '', city: '' })

    const schools = useMemo(() => (config.categoryId ? allSchools.filter((s) => s.category === config.categoryId) : allSchools), [allSchools, config.categoryId])
    // Premier filtre : catégorie (tous les établissements) ou filières enseignées (universités).
    const kindsOf = useMemo(() => {
        if (config.categoryId) return (s: SchoolType) => s.tags
        const labels = new Map(categories.map((c) => [c.id, c.shortLabel]))
        return (s: SchoolType) => [labels.get(s.category) ?? '']
    }, [categories, config.categoryId])
    const kindSuggestions = useMemo(() => toSuggestions(schools.flatMap(kindsOf)), [schools, kindsOf])
    const citySuggestions = useMemo(() => toSuggestions(schools.map((s) => s.city)), [schools])
    const shown = schools.filter((s) => (!filters.kind || kindsOf(s).includes(filters.kind)) && (!filters.city || s.city === filters.city))
    const filtered = !!(filters.kind || filters.city)

    return (
        <>
            {/* En-tête de page */}
            <section className='pt-28 pb-10 sm:pt-32'>
                <div className='container mx-auto max-w-7xl px-4'>
                    <div className='grid gap-8 lg:grid-cols-2 lg:items-center'>
                        <div className='flex max-w-3xl flex-col gap-4'>
                            <p className='font-semibold uppercase tracking-wide text-primary'>{config.eyebrow}</p>
                            <h1 className='text-3xl md:text-5xl font-bold text-secondary'>{config.title}</h1>
                            <p className='text-black'>{config.intro}</p>
                            <div className='flex flex-wrap gap-3'>
                                <ButtonLink href='/recherche/'>
                                    <Icon icon='tabler:search' className='text-lg' />
                                    Rechercher une formation
                                </ButtonLink>
                                <ButtonLink href='/signup/?type=etablissement' variant='secondary'>
                                    Référencer mon établissement
                                </ButtonLink>
                            </div>
                        </div>
                        <div className='relative h-56 overflow-hidden rounded-2xl shadow-[6px_6px_0_0_rgba(15,76,92,0.22)] sm:h-72 lg:h-80'>
                            <Image src={config.image} alt={config.imageAlt} fill priority sizes='(min-width: 1024px) 50vw, 100vw' className='object-cover' />
                        </div>
                    </div>
                </div>
            </section>

            {/* Établissements */}
            <section>
                <div className='container mx-auto max-w-7xl px-4'>
                    <SectionHeader
                        title={config.listTitle}
                        description={`Filtrez par ${config.firstFilter.label.toLowerCase()} et par ville pour trouver l’établissement qui correspond à votre projet.`}
                    />
                    {/* Filtre : catégorie ou filière, et localisation */}
                    <form
                        role='search'
                        aria-label='Filtrer les établissements'
                        onSubmit={(e) => e.preventDefault()}
                        className='mb-6 grid grid-cols-1 gap-2 rounded-2xl bg-white p-3 ring-1 ring-secondary/10 shadow-[0_24px_60px_-30px_rgba(15,76,92,0.45)] sm:grid-cols-[1fr_1fr_auto] sm:items-center'>
                        {[
                            { key: 'kind' as const, ...config.firstFilter, suggestions: kindSuggestions },
                            { key: 'city' as const, label: 'Ville / Localisation', icon: FILTER_UI.ville.icon, placeholder: FILTER_UI.ville.placeholder, suggestions: citySuggestions },
                        ].map((field) => (
                            <div key={field.key} className='rounded-xl px-4 py-3 transition-colors duration-200 hover:bg-offwhite sm:rounded-none sm:border-r sm:border-gray-100'>
                                <SuggestInput
                                    icon={field.icon}
                                    label={field.label}
                                    placeholder={field.placeholder}
                                    suggestions={field.suggestions}
                                    value={filters[field.key]}
                                    onChange={(value) => setFilters((prev) => ({ ...prev, [field.key]: value }))}
                                />
                            </div>
                        ))}
                        <button
                            type='button'
                            onClick={() => setFilters({ kind: '', city: '' })}
                            disabled={!filtered}
                            className='h-11 rounded-lg px-4 text-sm font-semibold text-primary hover:underline disabled:hidden sm:disabled:block sm:disabled:invisible hover:cursor-pointer'>
                            Réinitialiser
                        </button>
                    </form>

                    {loading ? (
                        <CardSkeletonGrid count={8} className='h-[360px]' />
                    ) : shown.length === 0 ? (
                        <p className='rounded-xl bg-white p-8 text-center text-black'>
                            {filtered ? 'Aucun établissement ne correspond à ces critères.' : 'Aucun établissement publié pour le moment.'}
                        </p>
                    ) : (
                        <>
                            <p className='mb-4 text-sm text-ink/60' aria-live='polite'>
                                {shown.length} {config.noun[shown.length > 1 ? 1 : 0]}
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

            {/* Atouts */}
            <section className='pt-0'>
                <div className='container mx-auto max-w-7xl px-4'>
                    <ul className='grid gap-4 sm:grid-cols-3'>
                        {BENEFITS.map((b) => (
                            <li key={b.title} className='flex gap-4 rounded-xl bg-white p-5 border border-gray-100'>
                                <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                                    <Icon icon={b.icon} className='text-2xl' />
                                </span>
                                <div>
                                    <h2 className='text-base font-semibold text-secondary'>{b.title}</h2>
                                    <p className='text-sm text-black'>{b.text}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Appel aux établissements */}
            <section className='pb-20'>
                <div className='container mx-auto max-w-7xl px-4'>
                    <div className='flex flex-col gap-4 rounded-2xl bg-secondary p-8 text-white md:flex-row md:items-center md:justify-between'>
                        <div>
                            <h2 className='text-2xl font-bold text-white'>{config.cta.title}</h2>
                            <p className='text-white/80'>{config.cta.text}</p>
                        </div>
                        <ButtonLink href='/signup/?type=etablissement' className='shrink-0'>
                            Référencer mon établissement
                        </ButtonLink>
                    </div>
                </div>
            </section>
        </>
    )
}
