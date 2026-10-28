'use client'
import { useMemo, useState, useRef } from 'react'
import Image from 'next/image'
import { Icon } from '@/components/ui/icon'
import { Button, ButtonLink } from '@/components/ui/form'
import SectionHeader from '@/components/ui/section-header'
import { CardSkeletonGrid } from '@/components/ui/card'
import { ShowMoreButton, useShowMore } from '@/components/ui/show-more'
import { useSiteData } from '@/data/site-data'
import CityPicker from '@/features/recherche/components/CityPicker'
import SuggestInput from '@/features/recherche/components/SuggestInput'
import { MY_POSITION, filterByPlace, placePosition } from '@/features/recherche/places'
import { FILTER_UI } from '@/features/recherche/useFilterSuggestions'
import SchoolCard from './SchoolCard'
import type { SchoolType } from '../types'
import { useT } from '@/i18n/client'

const BENEFITS = [
    { icon: 'tabler:id-badge-2', title: 'Des fiches complètes', text: 'Présentation, formations proposées, conditions d’admission et pièces à fournir, au même endroit.' },
    { icon: 'tabler:rosette-discount-check', title: 'Une reconnaissance indiquée', text: 'Vérifiez sur chaque fiche le statut de vérification et la reconnaissance déclarée par l’établissement.' },
    { icon: 'tabler:message-circle', title: 'Un contact direct', text: 'Écrivez ou appelez l’établissement depuis sa fiche, sans intermédiaire.' },
]

/** Textes et périmètre de chaque variante de la page. */
const VARIANTS = {
    /** Tous les établissements, filtrés par type (sous-catégorie). */
    all: {
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
} as const

/** Valeurs distinctes triées. */
const toSuggestions = (values: string[]) =>
    [...new Set(values.filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, 'fr'))
        .map((value) => ({ value }))

/** Liste de tous les établissements, filtrable par catégorie et par ville. */
export default function SchoolsPage({ variant = 'all' }: { variant?: keyof typeof VARIANTS }) {
    const t = useT()
    const config = VARIANTS[variant]
    const { data: allSchools, loading } = useSiteData('SchoolData')
    const { data: categories } = useSiteData('CategoryData')
    const [filters, setFilters] = useState({ kind: '', city: '', pos: '' })
    // Saisie en cours : appliquée aux résultats au clic sur « Rechercher ».
    const [draft, setDraft] = useState(filters)

    const schools = allSchools
    // Premier filtre : sous-catégorie (Université, Crèche…), sinon la catégorie de l'établissement.
    const kindsOf = useMemo(() => {
        const labels = new Map(categories.map((c) => [c.id, c.shortLabel]))
        return (s: SchoolType) => [s.subCategory || (labels.get(s.category) ?? '')]
    }, [categories])
    const kindSuggestions = useMemo(() => toSuggestions(schools.flatMap(kindsOf)), [schools, kindsOf])
    const citySuggestions = useMemo(() => toSuggestions(schools.map((s) => s.city)), [schools])
    // Ville exacte, sinon établissements les plus proches du lieu choisi (ou de ma position).
    const byPlace = filterByPlace(
        schools.filter((s) => !filters.kind || kindsOf(s).includes(filters.kind)),
        filters.city,
        filters.pos,
        (s) => s.city,
        (s) => s.coordinates
    )
    const shown = byPlace.items
    const filtered = !!(filters.kind || filters.city || draft.kind || draft.city)
    const page = useShowMore(shown, JSON.stringify(filters))
    // « Rechercher » : applique la saisie, ferme le clavier et descend aux résultats.
    const resultsRef = useRef<HTMLDivElement>(null)
    const submitSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setFilters(draft)
        ;(document.activeElement as HTMLElement | null)?.blur()
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    return (
        <>
            {/* En-tête de page */}
            <section className='pt-28 pb-10 sm:pt-32'>
                <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                    <div className='grid gap-8 lg:grid-cols-2 lg:items-center'>
                        <div className='mobile-center flex max-w-3xl flex-col gap-4'>
                            <p className='font-semibold uppercase tracking-wide text-primary'>{t(config.eyebrow)}</p>
                            <h1 className='text-3xl md:text-5xl font-bold text-secondary'>{t(config.title)}</h1>
                            <p className='text-black'>{t(config.intro)}</p>
                            <div className='mobile-center flex flex-wrap gap-3'>
                                <ButtonLink href='/recherche/'>
                                    <Icon icon='tabler:search' className='text-lg' />
                                    {t('Rechercher une formation')}
                                </ButtonLink>
                                <ButtonLink href='/tarifs/' variant='secondary'>
                                    {t('Référencer mon établissement')}
                                </ButtonLink>
                            </div>
                        </div>
                        <div className='relative h-56 overflow-hidden rounded-2xl shadow-[6px_6px_0_0_rgba(15,76,92,0.22)] sm:h-72 lg:h-80'>
                            <Image src={config.image} alt={t(config.imageAlt)} fill priority sizes='(min-width: 1024px) 50vw, 100vw' className='object-cover' />
                        </div>
                    </div>
                </div>
            </section>

            {/* Établissements */}
            <section>
                <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                    <SectionHeader
                        title={config.listTitle}
                        description={t('Filtrez par catégorie et par ville pour trouver l’établissement qui correspond à votre projet.')}
                    />
                    {/* Filtre : catégorie ou filière, et localisation */}
                    <form
                        role='search'
                        aria-label={t('Filtrer les établissements')}
                        onSubmit={submitSearch}
                        className='mb-6 grid grid-cols-1 gap-2 rounded-2xl bg-white p-3 ring-1 ring-secondary/10 shadow-[0_24px_60px_-30px_rgba(15,76,92,0.45)] sm:grid-cols-[1fr_1fr_auto] sm:items-center'>
                        {[
                            { key: 'kind' as const, ...config.firstFilter, suggestions: kindSuggestions },
                            { key: 'city' as const, label: 'Ville / Localisation', icon: FILTER_UI.ville.icon, placeholder: FILTER_UI.ville.placeholder, suggestions: citySuggestions },
                        ].map((field) => (
                            <div key={field.key} className='rounded-xl px-4 py-3 transition-colors duration-200 hover:bg-offwhite sm:rounded-none sm:border-r sm:border-gray-100'>
                                {field.key === 'city' ? (
                                    <CityPicker
                                        label={field.label}
                                        placeholder='Ex. : Antananarivo, Toamasina…'
                                        suggestions={field.suggestions}
                                        value={draft.city}
                                        onChange={(value, place) => setDraft((prev) => ({ ...prev, city: value, pos: placePosition(place) }))}
                                    />
                                ) : (
                                <SuggestInput
                                    icon={field.icon}
                                    label={field.label}
                                    placeholder={field.placeholder}
                                    suggestions={field.suggestions}
                                    value={draft[field.key]}
                                    onChange={(value) => setDraft((prev) => ({ ...prev, [field.key]: value }))}
                                />
                                )}
                            </div>
                        ))}
                        <div className='flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center'>
                            <button
                                type='button'
                                onClick={() => {
                                    setFilters({ kind: '', city: '', pos: '' })
                                    setDraft({ kind: '', city: '', pos: '' })
                                }}
                                disabled={!filtered}
                                className='h-11 rounded-lg px-3 text-sm font-semibold text-primary hover:underline disabled:hidden hover:cursor-pointer'>
                                {t('Réinitialiser')}
                            </button>
                            <Button type='submit' className='h-12'>
                                <Icon icon='tabler:search' className='text-lg' />
                                Rechercher
                            </Button>
                        </div>
                    </form>
                    <div ref={resultsRef} className='scroll-mt-28' />

                    {loading ? (
                        <CardSkeletonGrid count={8} className='h-[360px]' />
                    ) : shown.length === 0 ? (
                        <p className='rounded-xl bg-white p-8 text-center text-black'>
                            {filtered ? t('Aucun établissement ne correspond à ces critères.') : t('Aucun établissement publié pour le moment.')}
                        </p>
                    ) : (
                        <>
                            {byPlace.near && (
                                <p className='mb-4 flex items-start gap-2 rounded-xl border border-secondary/15 bg-white px-4 py-3 text-sm text-black' role='status'>
                                    <Icon icon='tabler:current-location' className='mt-0.5 shrink-0 text-lg text-primary' />
                                    <span>
                                        {filters.city === MY_POSITION
                                            ? t('Les plus proches de votre position, du plus près au plus loin.')
                                            : t('Aucun établissement à {city} : voici les plus proches, du plus près au plus loin.', { city: filters.city })}
                                    </span>
                                </p>
                            )}
                            <p className='mb-4 text-sm text-ink/60' aria-live='polite'>
                                {t(`${shown.length} ${config.noun[shown.length > 1 ? 1 : 0]}`)}
                            </p>
                            <div ref={page.listRef} className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                                {page.visible.map((school) => (
                                    <SchoolCard key={school.id} school={school} compact distanceKm={school.distanceKm} />
                                ))}
                            </div>
                            <ShowMoreButton {...page} onClick={page.showMore} noun={{ one: 'établissement', many: 'établissements' }} />
                        </>
                    )}
                </div>
            </section>

            {/* Atouts */}
            <section className='pt-0'>
                <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                    <ul className='grid gap-4 sm:grid-cols-3'>
                        {BENEFITS.map((b) => (
                            <li key={b.title} className='flex gap-4 rounded-xl bg-white p-5 border border-gray-100'>
                                <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                                    <Icon icon={b.icon} className='text-2xl' />
                                </span>
                                <div>
                                    <h2 className='text-base font-semibold text-secondary'>{t(b.title)}</h2>
                                    <p className='text-sm text-black'>{t(b.text)}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Appel aux établissements */}
            <section className='pb-20'>
                <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                    <div className='mobile-center flex flex-col gap-4 rounded-2xl bg-secondary p-8 text-white md:flex-row md:items-center md:justify-between'>
                        <div>
                            <h2 className='text-2xl font-bold text-white'>{t(config.cta.title)}</h2>
                            <p className='text-white/80'>{t(config.cta.text)}</p>
                        </div>
                        <ButtonLink href='/tarifs/' className='shrink-0'>
                            {t('Référencer mon établissement')}
                        </ButtonLink>
                    </div>
                </div>
            </section>
        </>
    )
}
