'use client'
import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Icon } from '@/components/ui/icon'
import { ButtonLink } from '@/components/ui/form'
import { CardSkeletonGrid } from '@/components/ui/card'
import { ShowMoreButton, useShowMore } from '@/components/ui/show-more'
import SectionHeader from '@/components/ui/section-header'
import { useSiteData } from '@/data/site-data'
import { useAuth } from '@/features/auth/AuthProvider'
import SchoolCard from '@/features/etablissements/components/SchoolCard'
import CityPicker from '@/features/recherche/components/CityPicker'
import SuggestInput from '@/features/recherche/components/SuggestInput'
import { MY_POSITION, filterByPlace, placePosition } from '@/features/recherche/places'
import { FILTER_UI } from '@/features/recherche/useFilterSuggestions'
import { cn } from '@/lib/utils'
import FormationCard from './FormationCard'

/** Textes et périmètre de chaque page (catégorie de CategoryData). */
const VARIANTS = {
    /** Enseignement supérieur : offres, filtrables par sous-catégorie (université, école supérieure…). */
    universites: {
        categoryId: 'superieur',
        eyebrow: 'Universités',
        title: 'Trouvez votre formation dans le supérieur',
        intro: 'Licences, masters, BTS et cursus des universités, instituts supérieurs, écoles supérieures et grandes écoles à Madagascar : comparez les formations après le bac, puis contactez directement l’établissement.',
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=70',
        imageAlt: 'Étudiants de l’enseignement supérieur',
        searchLabel: 'Rechercher une formation',
        listTitle: 'Les formations du supérieur',
        listIntro: 'Choisissez un type d’établissement, puis filtrez par filière et par ville.',
        domainLabel: 'Filière',
        domainPlaceholder: 'Ex. : informatique, droit…',
        bySubCategory: true,
        benefits: [
            { icon: 'tabler:school', title: 'Tous les cursus', text: 'Licence, master, BTS, doctorat : comparez durée, frais et conditions d’admission.' },
            { icon: 'tabler:rosette-discount-check', title: 'Une reconnaissance indiquée', text: 'Vérifiez sur chaque fiche la reconnaissance déclarée par l’établissement.' },
            { icon: 'tabler:message-circle', title: 'Un contact direct', text: 'Écrivez ou appelez l’établissement depuis l’offre, sans intermédiaire.' },
        ],
        schoolsTitle: null,
        cta: { title: 'Vous dirigez une université ou une école supérieure ?', text: 'Présentez vos cursus gratuitement et recevez les demandes des futurs étudiants.', button: 'Référencer mon établissement' },
    },
    /** Formation professionnelle : offres et centres qui les proposent. */
    'formation-pro': {
        categoryId: 'formation-pro',
        eyebrow: 'Formation professionnelle',
        title: 'Apprenez un métier, rapidement et concrètement',
        intro: 'Centres de formation, instituts techniques et écoles de métiers à Madagascar : comparez les formations courtes et certifiantes, puis contactez directement l’établissement.',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=70',
        imageAlt: 'Apprenants en formation professionnelle',
        searchLabel: 'Rechercher une formation pro',
        listTitle: 'Les formations professionnelles',
        listIntro: 'Filtrez par domaine et par ville pour trouver la formation qui correspond à votre projet.',
        domainLabel: "Domaine d'études",
        domainPlaceholder: FILTER_UI.domaine.placeholder,
        bySubCategory: false,
        benefits: [
            { icon: 'tabler:clock-hour-4', title: 'Des parcours courts', text: 'De quelques semaines à deux ans, pour se former sans mettre sa vie entre parenthèses.' },
            { icon: 'tabler:tools', title: 'Un métier concret', text: 'Des compétences pratiques, directement utiles en entreprise ou pour se lancer à son compte.' },
            { icon: 'tabler:certificate', title: 'Un certificat reconnu', text: 'Vérifiez sur chaque offre le diplôme ou le certificat délivré et les conditions d’admission.' },
        ],
        schoolsTitle: 'Les centres de formation',
        cta: { title: 'Vous dirigez un centre de formation ?', text: 'Présentez vos formations gratuitement et recevez les demandes des futurs apprenants.', button: 'Référencer mon centre' },
    },
} as const

const plural = (n: number) => `${n} formation${n > 1 ? 's' : ''}`

/** Page d'une catégorie : ses offres (formations), filtrables, et selon la page les établissements. */
export default function CategoryOffersPage({ variant }: { variant: keyof typeof VARIANTS }) {
    const config = VARIANTS[variant]
    const { data: formations, loading } = useSiteData('FormationData')
    const { data: schools, loading: schoolsLoading } = useSiteData('SchoolData')
    const { data: categories } = useSiteData('CategoryData')
    const { isFavorite, toggleFavorite } = useAuth()
    const [filters, setFilters] = useState({ sub: '', domain: '', city: '', pos: '' })

    const category = categories.find((c) => c.id === config.categoryId)
    const searchHref = `/recherche?categorie=${encodeURIComponent(category?.shortLabel ?? config.eyebrow)}`
    const offers = useMemo(() => formations.filter((f) => f.category === config.categoryId), [formations, config.categoryId])
    const centers = useMemo(() => schools.filter((s) => s.category === config.categoryId), [schools, config.categoryId])
    const schoolOf = useMemo(() => new Map(centers.map((c) => [c.id, c])), [centers])

    // Sous-catégories de la catégorie (ordre de CategoryData), avec leur nombre d'offres ; les vides sont masquées.
    const subCategories = useMemo(() => {
        if (!config.bySubCategory) return []
        const counts = new Map<string, number>()
        for (const f of offers) {
            const sub = schoolOf.get(f.schoolId)?.subCategory
            if (sub) counts.set(sub, (counts.get(sub) ?? 0) + 1)
        }
        const known = category?.subCategories ?? []
        const order = [...known, ...[...counts.keys()].filter((s) => !known.includes(s))]
        return order.filter((s) => counts.get(s)).map((value) => ({ value, count: counts.get(value) ?? 0 }))
    }, [config.bySubCategory, offers, schoolOf, category])

    const inSub = useMemo(() => offers.filter((f) => !filters.sub || schoolOf.get(f.schoolId)?.subCategory === filters.sub), [offers, filters.sub, schoolOf])
    // Suggestions triées, avec le nombre de formations correspondantes.
    const sorted = (values: string[]) =>
        [...new Set(values.filter(Boolean))]
            .sort((a, b) => a.localeCompare(b, 'fr'))
            .map((value) => ({ value, hint: plural(values.filter((v) => v === value).length) }))
    const domains = useMemo(() => sorted(inSub.map((f) => f.domain)), [inSub])
    const cities = useMemo(() => sorted(inSub.map((f) => f.city)), [inSub])
    // Ville exacte, sinon formations des établissements les plus proches du lieu choisi (ou de ma position).
    const byPlace = filterByPlace(
        inSub.filter((f) => !filters.domain || f.domain === filters.domain),
        filters.city,
        filters.pos,
        (f) => f.city,
        (f) => schoolOf.get(f.schoolId)?.coordinates
    )
    const shown = byPlace.items
    const filtered = !!(filters.sub || filters.domain || filters.city)
    const page = useShowMore(shown, JSON.stringify(filters))

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
                                <ButtonLink href={searchHref}>
                                    <Icon icon='tabler:search' className='text-lg' />
                                    {config.searchLabel}
                                </ButtonLink>
                                <ButtonLink href='/tarifs/' variant='secondary'>
                                    {config.cta.button}
                                </ButtonLink>
                            </div>
                        </div>
                        <div className='relative h-56 overflow-hidden rounded-2xl shadow-[6px_6px_0_0_rgba(15,76,92,0.22)] sm:h-72 lg:h-80'>
                            <Image src={config.image} alt={config.imageAlt} fill priority sizes='(min-width: 1024px) 50vw, 100vw' className='object-cover' />
                        </div>
                    </div>
                </div>
            </section>

            {/* Formations */}
            <section>
                <div className='container mx-auto max-w-7xl px-4'>
                    <SectionHeader title={config.listTitle} description={config.listIntro} />

                    {/* Sous-catégories : pastilles à choix unique */}
                    {subCategories.length > 1 && (
                        <div role='group' aria-label="Type d'établissement" className='-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0'>
                            {[{ value: '', label: 'Toutes', count: offers.length }, ...subCategories.map((s) => ({ ...s, label: s.value }))].map((chip) => {
                                const active = filters.sub === chip.value
                                return (
                                    <button
                                        key={chip.value || 'toutes'}
                                        type='button'
                                        aria-pressed={active}
                                        onClick={() => setFilters((prev) => ({ ...prev, sub: chip.value, domain: '' }))}
                                        className={cn(
                                            'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold whitespace-nowrap transition-colors hover:cursor-pointer',
                                            active ? 'border-secondary bg-secondary text-white' : 'border-secondary/20 bg-white text-secondary hover:border-secondary/50'
                                        )}>
                                        {chip.label}
                                        <span className={cn('rounded-full px-2 py-0.5 text-xs', active ? 'bg-white/20 text-white' : 'bg-offwhite text-ink/70')}>{chip.count}</span>
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {/* Filtre simple : domaine et localisation */}
                    <form
                        role='search'
                        aria-label='Filtrer les formations'
                        onSubmit={(e) => e.preventDefault()}
                        className='mb-6 grid grid-cols-1 gap-2 rounded-2xl bg-white p-3 ring-1 ring-secondary/10 shadow-[0_24px_60px_-30px_rgba(15,76,92,0.45)] sm:grid-cols-[1fr_1fr_auto] sm:items-center'>
                        <div className='rounded-xl px-4 py-3 transition-colors duration-200 hover:bg-offwhite sm:rounded-none sm:border-r sm:border-gray-100'>
                            <SuggestInput
                                icon={FILTER_UI.domaine.icon}
                                label={config.domainLabel}
                                placeholder={config.domainPlaceholder}
                                suggestions={domains}
                                value={filters.domain}
                                onChange={(value) => setFilters((prev) => ({ ...prev, domain: value }))}
                            />
                        </div>
                        <div className='rounded-xl px-4 py-3 transition-colors duration-200 hover:bg-offwhite sm:rounded-none sm:border-r sm:border-gray-100'>
                            <CityPicker
                                label='Ville / Localisation'
                                placeholder='Ex. : Antananarivo, Toamasina…'
                                suggestions={cities}
                                value={filters.city}
                                onChange={(value, place) => setFilters((prev) => ({ ...prev, city: value, pos: placePosition(place) }))}
                            />
                        </div>
                        <button
                            type='button'
                            onClick={() => setFilters({ sub: '', domain: '', city: '', pos: '' })}
                            disabled={!filtered}
                            className='h-11 rounded-lg px-4 text-sm font-semibold text-primary hover:underline disabled:hidden sm:disabled:block sm:disabled:invisible hover:cursor-pointer'>
                            Réinitialiser
                        </button>
                    </form>
                    {loading ? (
                        <CardSkeletonGrid count={4} className='h-[360px]' />
                    ) : shown.length === 0 ? (
                        <p className='rounded-xl bg-white p-8 text-center text-black'>
                            {filtered ? 'Aucune formation ne correspond à ces critères.' : 'Aucune formation publiée pour le moment.'}
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
                            <p className='mb-4 text-sm text-ink/60' aria-live='polite'>
                                {plural(shown.length)}
                            </p>
                            <div ref={page.listRef} className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                                {page.visible.map((formation) => (
                                    <FormationCard
                                        key={formation.id}
                                        formation={formation}
                                        isFavorite={isFavorite(formation.id)}
                                        onToggleFavorite={() => toggleFavorite(formation.id)}
                                        compact
                                    />
                                ))}
                            </div>
                            <ShowMoreButton {...page} onClick={page.showMore} noun={{ one: 'formation', many: 'formations', feminine: true }} />
                        </>
                    )}
                </div>
            </section>

            {/* Atouts */}
            <section className='pt-0'>
                <div className='container mx-auto max-w-7xl px-4'>
                    <ul className='grid gap-4 sm:grid-cols-3'>
                        {config.benefits.map((b) => (
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

            {/* Établissements de la catégorie (selon la page) */}
            {config.schoolsTitle && (schoolsLoading || centers.length > 0) && (
                <section className='bg-secondary/[0.06]'>
                    <div className='container mx-auto max-w-7xl px-4'>
                        <SectionHeader title={config.schoolsTitle} description='Les établissements qui proposent ces formations sur Edumada.' />
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

            {/* Appel aux établissements */}
            <section className='pb-20'>
                <div className='container mx-auto max-w-7xl px-4'>
                    <div className='flex flex-col gap-4 rounded-2xl bg-secondary p-8 text-white md:flex-row md:items-center md:justify-between'>
                        <div>
                            <h2 className='text-2xl font-bold text-white'>{config.cta.title}</h2>
                            <p className='text-white/80'>{config.cta.text}</p>
                        </div>
                        <ButtonLink href='/tarifs/' className='shrink-0'>
                            {config.cta.button}
                        </ButtonLink>
                    </div>
                </div>
            </section>
        </>
    )
}
