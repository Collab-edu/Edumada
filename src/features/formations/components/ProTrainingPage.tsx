'use client'
import { useMemo, useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { ButtonLink } from '@/components/ui/form'
import { CardSkeletonGrid } from '@/components/ui/card'
import SectionHeader from '@/components/ui/section-header'
import { useSiteData } from '@/data/site-data'
import { useAuth } from '@/features/auth/AuthProvider'
import SchoolCard from '@/features/etablissements/components/SchoolCard'
import { cn } from '@/lib/utils'
import FormationCard from './FormationCard'

/** Identifiant de la catégorie « Formation professionnelle » (CategoryData). */
const CATEGORY_ID = 'formation-pro'

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
    const [domain, setDomain] = useState('')

    const category = categories.find((c) => c.id === CATEGORY_ID)
    const searchHref = `/recherche?categorie=${encodeURIComponent(category?.shortLabel ?? 'Formation professionnelle')}`
    const offers = useMemo(() => formations.filter((f) => f.category === CATEGORY_ID), [formations])
    const centers = useMemo(() => schools.filter((s) => s.category === CATEGORY_ID), [schools])
    const domains = useMemo(() => [...new Set(offers.map((f) => f.domain).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr')), [offers])
    const shown = domain ? offers.filter((f) => f.domain === domain) : offers

    return (
        <>
            {/* En-tête de page */}
            <section className='pt-28 pb-10 sm:pt-32'>
                <div className='container mx-auto max-w-7xl px-4'>
                    <div className='grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end'>
                        <div className='flex max-w-3xl flex-col gap-4'>
                            <p className='font-semibold uppercase tracking-wide text-primary'>Formation professionnelle</p>
                            <h1 className='text-3xl md:text-5xl font-bold text-secondary'>Apprenez un métier, rapidement et concrètement</h1>
                            <p className='text-ink/70'>
                                Centres de formation, instituts techniques et écoles de métiers à Madagascar : comparez les formations courtes et certifiantes, puis contactez
                                directement l&apos;établissement.
                            </p>
                            <div className='flex flex-wrap gap-3'>
                                <ButtonLink href={searchHref}>
                                    <Icon icon='tabler:search' className='text-lg' />
                                    Rechercher une formation pro
                                </ButtonLink>
                                <ButtonLink href='/signup/?type=etablissement' variant='secondary'>
                                    Référencer mon centre
                                </ButtonLink>
                            </div>
                        </div>
                        <dl className='grid grid-cols-2 gap-4 sm:max-w-sm lg:max-w-none'>
                            {[
                                { label: 'formations', value: loading ? '…' : offers.length },
                                { label: 'centres et établissements', value: schoolsLoading ? '…' : centers.length },
                            ].map((stat) => (
                                <div key={stat.label} className='rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-[4px_4px_0_0_rgba(15,76,92,0.22)]'>
                                    <dt className='sr-only'>{stat.label}</dt>
                                    <dd className='text-3xl font-bold text-secondary'>{stat.value}</dd>
                                    <p className='text-sm text-ink/60'>{stat.label}</p>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </section>

            {/* Atouts */}
            <section className='py-6'>
                <div className='container mx-auto max-w-7xl px-4'>
                    <ul className='grid gap-4 sm:grid-cols-3'>
                        {BENEFITS.map((b) => (
                            <li key={b.title} className='flex gap-4 rounded-xl bg-white p-5 border border-gray-100'>
                                <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                                    <Icon icon={b.icon} className='text-2xl' />
                                </span>
                                <div>
                                    <h2 className='text-base font-semibold text-secondary'>{b.title}</h2>
                                    <p className='text-sm text-ink/70'>{b.text}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Formations */}
            <section>
                <div className='container mx-auto max-w-7xl px-4'>
                    <SectionHeader
                        title='Les formations professionnelles'
                        description='Filtrez par domaine pour trouver la formation qui correspond à votre projet.'
                        link={{ href: searchHref, label: 'Recherche détaillée' }}
                    />
                    {domains.length > 1 && (
                        <div className='mb-6 flex flex-wrap gap-2' role='group' aria-label='Filtrer par domaine'>
                            {['', ...domains].map((d) => (
                                <button
                                    key={d || 'all'}
                                    type='button'
                                    onClick={() => setDomain(d)}
                                    aria-pressed={domain === d}
                                    className={cn(
                                        'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-300 hover:cursor-pointer',
                                        domain === d ? 'border-secondary bg-secondary text-white' : 'border-gray-200 bg-white text-secondary hover:border-secondary/40'
                                    )}>
                                    {d || 'Tous les domaines'}
                                </button>
                            ))}
                        </div>
                    )}
                    {loading ? (
                        <CardSkeletonGrid count={4} className='h-[360px]' />
                    ) : shown.length === 0 ? (
                        <p className='rounded-xl bg-white p-8 text-center text-ink/70'>Aucune formation professionnelle publiée pour le moment.</p>
                    ) : (
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
                    )}
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
                        <ButtonLink href='/signup/?type=etablissement' className='shrink-0'>
                            Référencer mon centre
                        </ButtonLink>
                    </div>
                </div>
            </section>
        </>
    )
}
