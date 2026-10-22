'use client'
import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Icon } from '@/components/ui/icon'
import { ButtonLink } from '@/components/ui/form'
import { CardSkeletonGrid } from '@/components/ui/card'
import SectionHeader from '@/components/ui/section-header'
import { useSiteData } from '@/data/site-data'
import { useAuth } from '@/features/auth/AuthProvider'
import SchoolCard from '@/features/etablissements/components/SchoolCard'
import SuggestInput from '@/features/recherche/components/SuggestInput'
import { MY_POSITION, filterByPlace, placePosition, searchPlaces } from '@/features/recherche/places'
import { FILTER_UI } from '@/features/recherche/useFilterSuggestions'
import FormationCard from './FormationCard'

/** Identifiant de la catégorie « Formation professionnelle » (CategoryData). */
const CATEGORY_ID = 'formation-pro'

const HERO_IMAGE = 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=70'

const BENEFITS = [
    { icon: 'tabler:clock-hour-4', title: 'Des parcours courts', text: 'De quelques semaines à deux ans, pour se former sans mettre sa vie entre parenthèses.' },
    { icon: 'tabler:tools', title: 'Un métier concret', text: 'Des compétences pratiques, directement utiles en entreprise ou pour se lancer à son compte.' },
    { icon: 'tabler:certificate', title: 'Un certificat reconnu', text: 'Vérifiez sur chaque offre le diplôme ou le certificat délivré et les conditions d’admission.' },
]

/** Page dédiée : formations professionnelles et centres qui les proposent. */
export default function ProTrainingPage() {
    const { data: formations, loading } = useSiteData('FormationData')
    const { data: schools, loading: schoolsLoading } = useSiteData('SchoolData')
    const { data: categories } = useSiteData('CategoryData')
    const { isFavorite, toggleFavorite } = useAuth()
    const [filters, setFilters] = useState({ domain: '', city: '', pos: '' })

    const category = categories.find((c) => c.id === CATEGORY_ID)
    const searchHref = `/recherche?categorie=${encodeURIComponent(category?.shortLabel ?? 'Formation professionnelle')}`
    const offers = useMemo(() => formations.filter((f) => f.category === CATEGORY_ID), [formations])
    const centers = useMemo(() => schools.filter((s) => s.category === CATEGORY_ID), [schools])
    // Suggestions triées, avec le nombre de formations correspondantes.
    const sorted = (values: string[]) =>
        [...new Set(values.filter(Boolean))]
            .sort((a, b) => a.localeCompare(b, 'fr'))
            .map((value) => {
                const count = values.filter((v) => v === value).length
                return { value, hint: `${count} formation${count > 1 ? 's' : ''}` }
            })
    const domains = useMemo(() => sorted(offers.map((f) => f.domain)), [offers])
    const cities = useMemo(() => sorted(offers.map((f) => f.city)), [offers])
    // Ville exacte, sinon formations des centres les plus proches du lieu choisi (ou de ma position).
    const centerPoint = useMemo(() => new Map(centers.map((c) => [c.id, c.coordinates])), [centers])
    const byPlace = filterByPlace(
        offers.filter((f) => !filters.domain || f.domain === filters.domain),
        filters.city,
        filters.pos,
        (f) => f.city,
        (f) => centerPoint.get(f.schoolId)
    )
    const shown = byPlace.items
    const filtered = !!(filters.domain || filters.city)

    return (
        <>
            {/* En-tête de page */}
            <section className='pt-28 pb-10 sm:pt-32'>
                <div className='container mx-auto max-w-7xl px-4'>
                    <div className='grid gap-8 lg:grid-cols-2 lg:items-center'>
                        <div className='flex max-w-3xl flex-col gap-4'>
                            <p className='font-semibold uppercase tracking-wide text-primary'>Formation professionnelle</p>
                            <h1 className='text-3xl md:text-5xl font-bold text-secondary'>Apprenez un métier, rapidement et concrètement</h1>
                            <p className='text-black'>
                                Centres de formation, instituts techniques et écoles de métiers à Madagascar : comparez les formations courtes et certifiantes, puis contactez
                                directement l&apos;établissement.
                            </p>
                            <div className='flex flex-wrap gap-3'>
                                <ButtonLink href={searchHref}>
                                    <Icon icon='tabler:search' className='text-lg' />
                                    Rechercher une formation pro
                                </ButtonLink>
                                <ButtonLink href='/tarifs/' variant='secondary'>
                                    Référencer mon centre
                                </ButtonLink>
                            </div>
                        </div>
                        <div className='relative h-56 overflow-hidden rounded-2xl shadow-[6px_6px_0_0_rgba(15,76,92,0.22)] sm:h-72 lg:h-80'>
                            <Image src={HERO_IMAGE} alt='Apprenants en formation professionnelle' fill priority sizes='(min-width: 1024px) 50vw, 100vw' className='object-cover' />
                        </div>
                    </div>
                </div>
            </section>

            {/* Formations */}
            <section>
                <div className='container mx-auto max-w-7xl px-4'>
                    <SectionHeader
                        title='Les formations professionnelles'
                        description='Filtrez par domaine et par ville pour trouver la formation qui correspond à votre projet.'
                    />
                    {/* Filtre simple : domaine et localisation */}
                    <form
                        role='search'
                        aria-label='Filtrer les formations'
                        onSubmit={(e) => e.preventDefault()}
                        className='mb-6 grid grid-cols-1 gap-2 rounded-2xl bg-white p-3 ring-1 ring-secondary/10 shadow-[0_24px_60px_-30px_rgba(15,76,92,0.45)] sm:grid-cols-[1fr_1fr_auto] sm:items-center'>
                        {[
                            { key: 'domain' as const, ui: FILTER_UI.domaine, label: "Domaine d'études", suggestions: domains },
                            { key: 'city' as const, ui: FILTER_UI.ville, label: 'Ville / Localisation', suggestions: cities },
                        ].map((field) => (
                            <div key={field.key} className='rounded-xl px-4 py-3 transition-colors duration-200 hover:bg-offwhite sm:rounded-none sm:border-r sm:border-gray-100'>
                                <SuggestInput
                                    icon={field.ui.icon}
                                    label={field.label}
                                    placeholder={field.ui.placeholder}
                                    suggestions={field.suggestions}
                                    value={filters[field.key]}
                                    onChange={(value, place) =>
                                        setFilters((prev) => ({ ...prev, [field.key]: value, ...(field.key === 'city' ? { pos: placePosition(place) } : {}) }))
                                    }
                                    allowFreeText={field.key === 'city'}
                                    loadSuggestions={field.key === 'city' ? searchPlaces : undefined}
                                    locate={field.key === 'city'}
                                />
                            </div>
                        ))}
                        <button
                            type='button'
                            onClick={() => setFilters({ domain: '', city: '', pos: '' })}
                            disabled={!filtered}
                            className='h-11 rounded-lg px-4 text-sm font-semibold text-primary hover:underline disabled:hidden sm:disabled:block sm:disabled:invisible hover:cursor-pointer'>
                            Réinitialiser
                        </button>
                    </form>
                    {loading ? (
                        <CardSkeletonGrid count={4} className='h-[360px]' />
                    ) : shown.length === 0 ? (
                        <p className='rounded-xl bg-white p-8 text-center text-black'>
                            {filtered ? 'Aucune formation ne correspond à ces critères.' : 'Aucune formation professionnelle publiée pour le moment.'}
                        </p>
                    ) : (
                        <>
                        {byPlace.near && (
                            <p className='mb-4 flex items-start gap-2 rounded-xl border border-secondary/15 bg-white px-4 py-3 text-sm text-black' role='status'>
                                <Icon icon='tabler:current-location' className='mt-0.5 shrink-0 text-lg text-primary' />
                                <span>
                                    {filters.city === MY_POSITION ? 'Les formations les plus proches de votre position' : `Aucune formation à ${filters.city} : voici les plus proches`}, de
                                    la plus près à la plus loin.
                                </span>
                            </p>
                        )}
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                            {shown.map((formation) => (
                                <FormationCard
                                    key={formation.id}
                                    formation={formation}
                                    isFavorite={isFavorite(formation.id)}
                                    onToggleFavorite={() => toggleFavorite(formation.id)}
                                    compact
                                />
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

            {/* Centres */}
            {(schoolsLoading || centers.length > 0) && (
                <section className='bg-secondary/[0.06]'>
                    <div className='container mx-auto max-w-7xl px-4'>
                        <SectionHeader title='Les centres de formation' description='Les établissements qui proposent des formations professionnelles sur Edumada.' />
                        {schoolsLoading ? (
                            <CardSkeletonGrid count={4} className='h-[360px]' />
                        ) : (
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                                {centers.map((school) => (
                                    <SchoolCard key={school.id} school={school} compact />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* Appel aux centres */}
            <section className='pb-20'>
                <div className='container mx-auto max-w-7xl px-4'>
                    <div className='flex flex-col gap-4 rounded-2xl bg-secondary p-8 text-white md:flex-row md:items-center md:justify-between'>
                        <div>
                            <h2 className='text-2xl font-bold text-white'>Vous dirigez un centre de formation ?</h2>
                            <p className='text-white/80'>Présentez vos formations gratuitement et recevez les demandes des futurs apprenants.</p>
                        </div>
                        <ButtonLink href='/tarifs/' className='shrink-0'>
                            Référencer mon centre
                        </ButtonLink>
                    </div>
                </div>
            </section>
        </>
    )
}
