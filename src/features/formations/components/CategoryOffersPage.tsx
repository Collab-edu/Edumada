'use client'
import { useMemo, useState, useRef } from 'react'
import PagePhoto from '@/components/ui/page-photo'
import { Icon } from '@/components/ui/icon'
import { Button, ButtonLink } from '@/components/ui/form'
import { CardSkeletonGrid } from '@/components/ui/card'
import { ShowMoreButton, useShowMore } from '@/components/ui/show-more'
import SectionHeader from '@/components/ui/section-header'
import { useSiteData } from '@/data/site-data'
import SchoolCard from '@/features/etablissements/components/SchoolCard'
import CityPicker from '@/features/recherche/components/CityPicker'
import SearchPillBar, { SearchPillField } from '@/features/recherche/components/SearchPillBar'
import SuggestInput from '@/features/recherche/components/SuggestInput'
import { MY_POSITION, filterByPlace, placePosition } from '@/features/recherche/places'
import SearchingState from '@/features/recherche/components/SearchingState'
import { useSearchPacing } from '@/features/recherche/useSearchPacing'
import { FILTER_UI } from '@/features/recherche/useFilterSuggestions'
import { cn } from '@/lib/utils'
import type { FormationType } from '../types'
import Link, { useT } from '@/i18n/client'

/** Textes et périmètre de chaque page (catégorie de CategoryData). */
const VARIANTS = {
    /** Enseignement supérieur : offres, filtrables par sous-catégorie (université, école supérieure…). */
    universites: {
        categoryIds: ['superieur'],
        eyebrow: 'Universités',
        title: 'Universités et écoles supérieures à Madagascar',
        intro: 'Universités publiques et privées, instituts supérieurs et grandes écoles : les licences, masters et BTS proposés après le bac, avec les frais de scolarité et les conditions d’admission de chaque établissement.',
        image: 'etudiants',
        imageAlt: 'Étudiants de l’enseignement supérieur',
        listTitle: 'Universités, instituts et écoles supérieures',
        listIntro: 'Choisissez un type d’établissement, puis filtrez par filière et par ville.',
        offerNoun: { one: 'formation', many: 'formations' },
        domainLabel: 'Filière',
        domainPlaceholder: 'Ex. : informatique, droit…',
        bySubCategory: true,
        benefits: [
            { icon: 'tabler:school', title: 'Licence, master, BTS', text: 'Pour chaque cursus : la durée, les frais de scolarité et les conditions d’admission.' },
            { icon: 'tabler:rosette-discount-check', title: 'Homologation et reconnaissance', text: 'Chaque fiche indique la reconnaissance déclarée par l’établissement. Vérifiez-la avant de vous inscrire.' },
            { icon: 'tabler:message-circle', title: 'Un contact direct', text: 'Écrivez ou appelez l’établissement depuis l’offre, sans intermédiaire.' },
        ],
        cta: { title: 'Vous dirigez une université ou une école supérieure ?', text: 'Présentez vos cursus gratuitement et recevez les demandes des futurs étudiants.', button: 'Référencer mon établissement' },
    },
    /** Formation professionnelle : offres et centres qui les proposent. */
    'formation-pro': {
        categoryIds: ['formation-pro'],
        eyebrow: 'Formation professionnelle',
        title: 'Formation professionnelle à Madagascar',
        intro: 'Centres de formation professionnelle, instituts techniques et écoles de métiers : des formations courtes et certifiantes, avec ou sans bac. Chaque offre indique sa durée, son coût et le certificat délivré.',
        image: 'formation-pro',
        imageAlt: 'Apprenants en formation professionnelle',
        listTitle: 'Les centres de formation professionnelle',
        listIntro: 'Filtrez par domaine et par ville pour trouver le centre qui correspond à votre projet.',
        offerNoun: { one: 'formation', many: 'formations' },
        domainLabel: "Domaine d'études",
        domainPlaceholder: FILTER_UI.domaine.placeholder,
        bySubCategory: false,
        benefits: [
            { icon: 'tabler:clock-hour-4', title: 'Des parcours courts', text: 'De quelques semaines à deux ans, en cours du jour ou du soir selon les centres.' },
            { icon: 'tabler:tools', title: 'Un métier concret', text: 'Des compétences pratiques, directement utiles en entreprise ou pour se lancer à son compte.' },
            { icon: 'tabler:certificate', title: 'Un certificat reconnu', text: 'Vérifiez sur chaque offre le diplôme ou le certificat délivré et les conditions d’admission.' },
        ],
        cta: { title: 'Vous dirigez un centre de formation ?', text: 'Présentez vos formations gratuitement et recevez les demandes des futurs apprenants.', button: 'Référencer mon centre' },
    },
    /** Petite enfance et écoles : crèches, garderies, maternelles, puis primaire et secondaire. */
    'petite-enfance': {
        categoryIds: ['petite-enfance', 'scolaire'],
        eyebrow: 'Petite enfance et écoles',
        title: 'Crèches et écoles à Madagascar',
        intro: 'Crèches, garderies, maternelles, écoles primaires, collèges et lycées, à Antananarivo et dans les autres villes. Consultez l’âge d’accueil, les niveaux et les frais, puis contactez l’établissement.',
        image: 'enfants-classe',
        imageAlt: 'Enfants qui travaillent en classe',
        listTitle: 'Les crèches et les écoles',
        listIntro: 'Choisissez un type d’établissement, puis filtrez par ville.',
        offerNoun: { one: 'offre', many: 'offres' },
        domainLabel: "Domaine d'études",
        domainPlaceholder: FILTER_UI.domaine.placeholder,
        bySubCategory: true,
        benefits: [
            { icon: 'tabler:baby-carriage', title: 'De la crèche au lycée', text: 'Crèches, garderies, maternelles, écoles, collèges et lycées réunis au même endroit.' },
            { icon: 'tabler:map-pin', title: 'Près de chez vous', text: 'Filtrez par ville ou par position pour trouver un établissement proche de votre domicile.' },
            { icon: 'tabler:message-circle', title: 'Un contact direct', text: 'Posez vos questions sur l’accueil, les horaires et les frais directement à l’établissement.' },
        ],
        cta: { title: 'Vous dirigez une crèche ou une école ?', text: 'Présentez votre établissement gratuitement et recevez les demandes des parents.', button: 'Référencer mon établissement' },
    },
    /** Crèches : page du menu, sans le primaire et le secondaire. */
    creches: {
        categoryIds: ['petite-enfance'],
        eyebrow: 'Crèches et petite enfance',
        title: 'Crèches et garderies à Madagascar',
        intro: 'Crèches, garderies, préscolaires et maternelles, à Antananarivo et dans les autres villes. Consultez l’âge d’accueil, les horaires et les tarifs, puis contactez la crèche directement.',
        image: 'enfants-classe',
        imageAlt: 'Enfants qui travaillent en classe',
        listTitle: 'Crèches, garderies et maternelles',
        listIntro: 'Filtrez par ville pour trouver une crèche près de chez vous.',
        offerNoun: { one: 'offre', many: 'offres' },
        domainLabel: "Domaine d'études",
        domainPlaceholder: FILTER_UI.domaine.placeholder,
        bySubCategory: true,
        benefits: [
            { icon: 'tabler:baby-carriage', title: 'Dès le plus jeune âge', text: 'Crèches, garderies, préscolaires et maternelles réunis au même endroit.' },
            { icon: 'tabler:map-pin', title: 'Près de chez vous', text: 'Filtrez par ville ou par position pour trouver un établissement proche de votre domicile.' },
            { icon: 'tabler:message-circle', title: 'Un contact direct', text: 'Posez vos questions sur l’accueil, les horaires et les frais directement à l’établissement.' },
        ],
        cta: { title: 'Vous dirigez une crèche ?', text: 'Présentez votre établissement gratuitement et recevez les demandes des parents.', button: 'Référencer mon établissement' },
    },
    /** Écoles : page du menu, du primaire au lycée. */
    ecoles: {
        categoryIds: ['scolaire'],
        eyebrow: 'Écoles, collèges et lycées',
        title: 'Écoles, collèges et lycées à Madagascar',
        intro: 'Écoles primaires, collèges et lycées, publics ou privés, à Antananarivo et dans les autres villes. Consultez les niveaux proposés et les frais de scolarité, puis contactez l’établissement.',
        image: 'enfants-classe',
        imageAlt: 'Enfants qui travaillent en classe',
        listTitle: 'Écoles primaires, collèges et lycées',
        listIntro: 'Filtrez par ville pour trouver un établissement près de chez vous.',
        offerNoun: { one: 'offre', many: 'offres' },
        domainLabel: "Domaine d'études",
        domainPlaceholder: FILTER_UI.domaine.placeholder,
        bySubCategory: true,
        benefits: [
            { icon: 'tabler:school', title: 'Du primaire au lycée', text: 'Écoles primaires, collèges et lycées, publics ou privés, réunis au même endroit.' },
            { icon: 'tabler:map-pin', title: 'Près de chez vous', text: 'Filtrez par ville ou par position pour trouver un établissement proche de votre domicile.' },
            { icon: 'tabler:message-circle', title: 'Un contact direct', text: 'Posez vos questions sur les niveaux, les horaires et les frais directement à l’établissement.' },
        ],
        cta: { title: 'Vous dirigez une école ?', text: 'Présentez votre établissement gratuitement et recevez les demandes des parents.', button: 'Référencer mon établissement' },
    },
} as const

/** Pages sans domaine d'études, avec la barre de filtres complète. */
const FAMILY_VARIANTS: readonly string[] = ['petite-enfance', 'creches', 'ecoles']

const countLabel = (n: number) => `${n} établissement${n > 1 ? 's' : ''}`
const nounLabel = (n: number, noun: { one: string; many: string }) => `${n} ${n > 1 ? noun.many : noun.one}`

/** Nombre de domaines affichés sur chaque carte d'établissement. */
const MAX_CARD_DOMAINS = 3

/**
 * Page d'une catégorie : ses établissements, filtrables par type, domaine et ville.
 * Chaque carte indique le nombre d'offres publiées et les principaux domaines ; un lien mène aux offres sur /recherche.
 */
export default function CategoryOffersPage({ variant }: { variant: keyof typeof VARIANTS }) {
    const t = useT()
    const config = VARIANTS[variant]
    // Une crèche ou une école n'a pas de domaine d'études.
    const showDomain = !FAMILY_VARIANTS.includes(variant)
    // Barre compacte dans l'en-tête de la liste.
    const usePill = !FAMILY_VARIANTS.includes(variant)
    const { data: formations } = useSiteData('FormationData')
    const { data: schools, loading } = useSiteData('SchoolData')
    const { data: categories } = useSiteData('CategoryData')
    const { pacing, startPacing } = useSearchPacing()
    const [filters, setFilters] = useState({ sub: '', domain: '', city: '', pos: '' })
    // Saisie en cours (type d'établissement, domaine, ville) : appliquée au clic sur « Rechercher ».
    const [draft, setDraft] = useState(filters)

    const ids: readonly string[] = config.categoryIds
    const centers = useMemo(() => schools.filter((s) => ids.includes(s.category)), [schools, ids])
    // Offres publiées de chaque établissement de la catégorie.
    const offersOf = useMemo(() => {
        const map = new Map<string, FormationType[]>()
        for (const f of formations) {
            if (!ids.includes(f.category)) continue
            map.set(f.schoolId, [...(map.get(f.schoolId) ?? []), f])
        }
        return map
    }, [formations, ids])
    // Domaines d'un établissement, du plus représenté au moins représenté.
    const domainsOf = (schoolId: string) => {
        const counts = new Map<string, number>()
        for (const f of offersOf.get(schoolId) ?? []) if (f.domain) counts.set(f.domain, (counts.get(f.domain) ?? 0) + 1)
        return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'fr')).map(([domain]) => domain)
    }

    // Sous-catégories de la catégorie (ordre de CategoryData), avec leur nombre d'établissements ; les vides sont masquées.
    const subCategories = useMemo(() => {
        if (!config.bySubCategory) return []
        const counts = new Map<string, number>()
        for (const s of centers) if (s.subCategory) counts.set(s.subCategory, (counts.get(s.subCategory) ?? 0) + 1)
        const known = categories.filter((c) => ids.includes(c.id)).flatMap((c) => c.subCategories ?? [])
        const order = [...known, ...[...counts.keys()].filter((s) => !known.includes(s))]
        return order.filter((s) => counts.get(s)).map((value) => ({ value, count: counts.get(value) ?? 0 }))
    }, [config.bySubCategory, centers, categories, ids])

    const inSub = (sub: string) => centers.filter((s) => !sub || s.subCategory === sub)
    // Suggestions triées, selon le type d'établissement choisi dans la saisie.
    const sorted = (values: string[]) =>
        [...new Set(values.filter(Boolean))]
            .sort((a, b) => a.localeCompare(b, 'fr'))
            .map((value) => ({ value }))
    const draftCenters = inSub(draft.sub)
    const domains = sorted(draftCenters.flatMap((s) => (offersOf.get(s.id) ?? []).map((f) => f.domain)))
    const cities = sorted(draftCenters.map((s) => s.city))
    // Ville exacte, sinon établissements les plus proches du lieu choisi (ou de ma position).
    const byPlace = filterByPlace(
        inSub(filters.sub).filter((s) => !filters.domain || (offersOf.get(s.id) ?? []).some((f) => f.domain === filters.domain)),
        filters.city,
        filters.pos,
        (s) => s.city,
        (s) => s.coordinates
    )
    const shown = byPlace.items
    const filtered = !!(filters.sub || filters.domain || filters.city || draft.sub || draft.domain || draft.city)
    const page = useShowMore(shown, JSON.stringify(filters))

    // Lien vers les offres correspondantes sur la recherche (mêmes filtres).
    const shownOffers = shown.reduce((n, s) => n + (offersOf.get(s.id) ?? []).filter((f) => !filters.domain || f.domain === filters.domain).length, 0)
    const searchHref = (() => {
        const params = new URLSearchParams()
        const kind = filters.sub || (ids.length === 1 ? categories.find((c) => c.id === ids[0])?.shortLabel : '')
        if (kind) params.set('categorie', kind)
        if (filters.domain) params.set('domaine', filters.domain)
        if (filters.city && filters.city !== MY_POSITION) params.set('ville', filters.city)
        const query = params.toString()
        return query ? `/recherche?${query}` : '/recherche'
    })()

    // « Rechercher » : applique la saisie, ferme le clavier et descend aux résultats.
    const resultsRef = useRef<HTMLDivElement>(null)
    const submitSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setFilters(draft)
        startPacing()
        ;(document.activeElement as HTMLElement | null)?.blur()
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    return (
        <>
            {/* En-tête de page */}
            <section className='pt-28 pb-14 sm:pt-32 lg:pb-16'>
                <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                    <div className='grid gap-8 lg:grid-cols-2 lg:items-center'>
                        <div className='mobile-center flex max-w-3xl flex-col gap-4'>
                            <p className='font-semibold text-primary'>{t(config.eyebrow)}</p>
                            <h1 className='text-3xl md:text-5xl font-bold text-secondary'>{t(config.title)}</h1>
                            <p className='text-black'>{t(config.intro)}</p>
                            <div className='mobile-center flex flex-wrap gap-3'>
                                <ButtonLink href='/tarifs/'>
                                    {t(config.cta.button)}
                                    <Icon icon='tabler:arrow-right' className='text-lg' />
                                </ButtonLink>
                            </div>
                        </div>
                        <div className='relative h-56 overflow-hidden rounded-xl sm:h-72 lg:h-80'>
                            <PagePhoto name={config.image} alt={t(config.imageAlt)} priority sizes='(min-width: 1024px) 50vw, 100vw' />
                        </div>
                    </div>
                </div>
            </section>

            {/* Établissements */}
            <section>
                <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                    {usePill ? (
                        <SearchPillBar
                            title={t(config.listTitle)}
                            count={loading || pacing ? '' : `${t(countLabel(shown.length))} à Madagascar`}
                            label={t('Filtrer les établissements')}
                            onSubmit={submitSearch}>
                            <SearchPillField>
                                <SuggestInput
                                    pill
                                    icon={FILTER_UI.domaine.icon}
                                    label={config.domainLabel}
                                    placeholder={config.domainLabel}
                                    suggestions={domains}
                                    value={draft.domain}
                                    onChange={(value) => setDraft((prev) => ({ ...prev, domain: value }))}
                                />
                            </SearchPillField>
                            <SearchPillField>
                                <CityPicker
                                    pill
                                    label='Ville'
                                    placeholder='Ville'
                                    suggestions={cities}
                                    value={draft.city}
                                    onChange={(value, place) => setDraft((prev) => ({ ...prev, city: value, pos: placePosition(place) }))}
                                />
                            </SearchPillField>
                        </SearchPillBar>
                    ) : (
                        <SectionHeader title={config.listTitle} description={config.listIntro} />
                    )}

                    {/* Sous-catégories : pastilles à choix unique */}
                    {subCategories.length > 1 && (
                        <div role='group' aria-label={t("Type d'établissement")} className='-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0'>
                            {[{ value: '', label: 'Toutes' }, ...subCategories.map((s) => ({ value: s.value, label: s.value }))].map((chip) => {
                                const active = draft.sub === chip.value
                                return (
                                    <button
                                        key={chip.value || 'toutes'}
                                        type='button'
                                        aria-pressed={active}
                                        onClick={() => {
                                            // Une pastille filtre tout de suite (sans passer par « Rechercher ») ; le domaine choisi est remis à zéro.
                                            const next = { ...draft, sub: chip.value, domain: '' }
                                            setDraft(next)
                                            setFilters(next)
                                            startPacing()
                                        }}
                                        className={cn(
                                            'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[12px] border px-4 text-sm font-semibold whitespace-nowrap transition-colors hover:cursor-pointer',
                                            active ? 'border-secondary bg-secondary text-white' : 'border-secondary/20 bg-white text-black hover:border-secondary/50'
                                        )}>
                                        {t(chip.label)}
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {/* Filtre simple : domaine et localisation */}
                    {!usePill && (
                    <form
                        role='search'
                        aria-label={t('Filtrer les établissements')}
                        onSubmit={submitSearch}
                        className={cn(
                            'mb-6 grid grid-cols-1 gap-2 rounded-xl bg-white p-3 ring-1 ring-secondary/10 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.25)] sm:items-center',
                            showDomain ? 'sm:grid-cols-[1fr_1fr_auto]' : 'sm:grid-cols-[1fr_auto]'
                        )}>
                        {showDomain && (
                            <div className='rounded-xl px-4 py-3 transition-colors duration-200 hover:bg-offwhite sm:rounded-none sm:border-r sm:border-gray-100'>
                                <SuggestInput
                                    icon={FILTER_UI.domaine.icon}
                                    label={config.domainLabel}
                                    placeholder={config.domainPlaceholder}
                                    suggestions={domains}
                                    value={draft.domain}
                                    onChange={(value) => setDraft((prev) => ({ ...prev, domain: value }))}
                                />
                            </div>
                        )}
                        <div className='rounded-xl px-4 py-3 transition-colors duration-200 hover:bg-offwhite sm:rounded-none sm:border-r sm:border-gray-100'>
                            <CityPicker
                                label='Ville / Localisation'
                                placeholder='Ex. : Antananarivo, Toamasina…'
                                suggestions={cities}
                                value={draft.city}
                                onChange={(value, place) => setDraft((prev) => ({ ...prev, city: value, pos: placePosition(place) }))}
                            />
                        </div>
                        <div className='flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center'>
                            <button
                                type='button'
                                onClick={() => {
                                    setFilters({ sub: '', domain: '', city: '', pos: '' })
                                    setDraft({ sub: '', domain: '', city: '', pos: '' })
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
                    )}
                    <div ref={resultsRef} className='scroll-mt-28' />
                    {pacing ? (
                        <SearchingState label={t('Recherche des établissements…')} count={4} gridClassName='grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4' cardClassName='h-[400px]' />
                    ) : loading ? (
                        <CardSkeletonGrid count={4} className='h-[400px]' />
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
                                            ? t('Les établissements les plus proches de votre position, du plus près au plus loin.')
                                            : t('Aucun établissement à {city} : voici les plus proches, du plus près au plus loin.', { city: filters.city })}
                                    </span>
                                </p>
                            )}
                            {!usePill && (
                                <p className='mb-4 text-sm text-ink/60' aria-live='polite'>
                                    {t(countLabel(shown.length))}
                                </p>
                            )}
                            <div ref={page.listRef} className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                                {page.visible.map((school) => {
                                    const count = (offersOf.get(school.id) ?? []).length
                                    return (
                                        <SchoolCard
                                            key={school.id}
                                            school={school}
                                            compact
                                            distanceKm={school.distanceKm}
                                            showCategory={false}
                                            offers={{
                                                label: count ? nounLabel(count, config.offerNoun) : `0 ${config.offerNoun.one} publiée`,
                                                domains: showDomain ? domainsOf(school.id).slice(0, MAX_CARD_DOMAINS) : [],
                                            }}
                                        />
                                    )
                                })}
                            </div>
                            <ShowMoreButton {...page} onClick={page.showMore} noun={{ one: 'établissement', many: 'établissements' }} />
                            {shownOffers > 0 && (
                                <div className='mt-6 flex justify-center'>
                                    <Link
                                        href={searchHref}
                                        className='group inline-flex items-center gap-1.5 py-2 font-semibold text-primary hover:text-primary/80'>
                                        {t('Voir les {n} correspondantes', { n: nounLabel(shownOffers, config.offerNoun) })}
                                        <Icon icon='tabler:arrow-right' className='text-lg transition-transform duration-200 group-hover:translate-x-0.5' />
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Atouts */}
            <section className='pt-6 pb-16'>
                <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                    <ul className='grid gap-6 sm:grid-cols-3'>
                        {config.benefits.map((b) => (
                            <li key={b.title} className='flex gap-4 rounded-xl bg-white p-6 border border-gray-100'>
                                <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white'>
                                    <Icon icon={b.icon} className='text-2xl' />
                                </span>
                                <div>
                                    <h3 className='text-base font-semibold text-secondary'>{t(b.title)}</h3>
                                    <p className='text-sm text-black'>{t(b.text)}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Appel aux établissements */}
            <section className='pt-16 pb-20'>
                <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                    <div className='mobile-center flex flex-col gap-4 rounded-xl bg-secondary p-8 text-white md:flex-row md:items-center md:justify-between'>
                        <div>
                            <h2 className='text-2xl font-bold text-white'>{t(config.cta.title)}</h2>
                            <p className='text-white/80'>{t(config.cta.text)}</p>
                        </div>
                        <ButtonLink href='/tarifs/' className='shrink-0'>
                            {t(config.cta.button)}
                        </ButtonLink>
                    </div>
                </div>
            </section>
        </>
    )
}
