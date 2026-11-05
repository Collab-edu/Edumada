'use client'
import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Icon } from '@/components/ui/icon'
import { ButtonLink } from '@/components/ui/form'
import { CardSkeletonGrid } from '@/components/ui/card'
import { ShowMoreButton, useShowMore } from '@/components/ui/show-more'
import { useSiteData } from '@/data/site-data'
import { normalize } from '@/features/recherche/components/SuggestInput'
import SearchingState from '@/features/recherche/components/SearchingState'
import { useSearchPacing } from '@/features/recherche/useSearchPacing'
import { cn } from '@/lib/utils'
import SchoolCard from './SchoolCard'
import { useT } from '@/i18n/client'

const BENEFITS = [
    { icon: 'tabler:id-badge-2', title: 'Des fiches complètes', text: 'Présentation, formations proposées, conditions d’admission et pièces à fournir, au même endroit.' },
    { icon: 'tabler:rosette-discount-check', title: 'Une reconnaissance indiquée', text: 'Vérifiez sur chaque fiche le statut de vérification et la reconnaissance déclarée par l’établissement.' },
    { icon: 'tabler:message-circle', title: 'Un contact direct', text: 'Écrivez ou appelez l’établissement depuis sa fiche, sans intermédiaire.' },
]

/** Types proposés dans le filtre ; `id` vide = tous les établissements. */
const TYPES = [
    { id: '', label: 'Tous', icon: 'tabler:category' },
    { id: 'superieur', label: 'Enseignement supérieur', icon: 'tabler:school' },
    { id: 'formation-pro', label: 'Formation professionnelle', icon: 'tabler:tools' },
    { id: 'petite-enfance', label: 'Petite enfance', icon: 'tabler:mood-kid' },
    { id: 'scolaire', label: 'École, collège, lycée', icon: 'tabler:building' },
    { id: 'autres', label: 'Autres', icon: 'tabler:dots' },
]

const countLabel = (n: number) => `${n} établissement${n > 1 ? 's' : ''}`

/** Textes et périmètre de chaque variante de la page. */
const VARIANTS = {
    /** Tous les établissements, filtrés par type, ville et nom. */
    all: {
        eyebrow: 'Établissements',
        title: 'Trouvez l’établissement qui vous correspond',
        intro: 'Universités, écoles, crèches et centres de formation à Madagascar : consultez leur fiche, découvrez les formations qu’ils proposent, puis contactez-les directement.',
        image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=70',
        imageAlt: 'Campus d’un établissement d’enseignement',
        listTitle: 'Tous les établissements',
        cta: { title: 'Vous dirigez un établissement ?', text: 'Présentez vos formations gratuitement et recevez les demandes des futurs élèves et étudiants.' },
    },
} as const

/** Liste de tous les établissements : les filtres s'appliquent tout de suite. */
export default function SchoolsPage({ variant = 'all' }: { variant?: keyof typeof VARIANTS }) {
    const t = useT()
    const config = VARIANTS[variant]
    const { data: allSchools, loading } = useSiteData('SchoolData')
    const { pacing, startPacing } = useSearchPacing()
    const [type, setTypeValue] = useState('')
    const [city, setCityValue] = useState('')
    const [name, setNameValue] = useState('')
    // Chaque changement de filtre relance le loader.
    const setType = (value: string) => {
        setTypeValue(value)
        startPacing()
    }
    const setCity = (value: string) => {
        setCityValue(value)
        startPacing()
    }
    const setName = (value: string) => {
        setNameValue(value)
        startPacing()
    }

    const cities = useMemo(() => [...new Set(allSchools.map((s) => s.city).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'fr')), [allSchools])
    // Le nombre affiché sur chaque type tient compte de la ville et du nom déjà choisis.
    const matching = useMemo(() => {
        const q = normalize(name)
        return allSchools.filter((s) => (!city || s.city === city) && (!q || normalize(s.name).includes(q)))
    }, [allSchools, city, name])
    const shown = useMemo(() => matching.filter((s) => !type || s.category === type), [matching, type])
    const filtered = !!(type || city || name.trim())
    const page = useShowMore(shown, JSON.stringify({ type, city, name }))

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
                                <ButtonLink href='/tarifs/'>
                                    {t('Référencer mon établissement')}
                                    <Icon icon='tabler:arrow-right' className='text-lg' />
                                </ButtonLink>
                            </div>
                        </div>
                        <div className='relative h-56 overflow-hidden rounded-xl shadow-[6px_6px_0_0_rgba(15,76,92,0.22)] sm:h-72 lg:h-80'>
                            <Image src={config.image} alt={t(config.imageAlt)} fill priority sizes='(min-width: 1024px) 50vw, 100vw' className='object-cover' />
                        </div>
                    </div>
                </div>
            </section>

            {/* Établissements */}
            <section>
                <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                    <div className='mobile-center mb-7'>
                        <h2 className='text-2xl font-bold text-secondary md:text-3xl'>{t(config.listTitle)}</h2>
                        <p className='mt-1 text-ink/80'>Choisissez un type d’établissement et une ville : la liste se met à jour.</p>
                    </div>

                    <div role='group' aria-label='Type d’établissement' className='grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-6'>
                        {TYPES.map((item) => {
                            const active = type === item.id
                            const n = item.id ? matching.filter((s) => s.category === item.id).length : matching.length
                            return (
                                <button
                                    key={item.id || 'tous'}
                                    type='button'
                                    aria-pressed={active}
                                    onClick={() => setType(item.id)}
                                    className={cn(
                                        'flex items-center gap-2.5 rounded-xl border bg-white p-3 text-left transition-shadow duration-200 hover:cursor-pointer hover:shadow-md',
                                        active ? 'border-primary shadow-[0_10px_24px_-14px_rgba(255,59,82,0.7)]' : 'border-gray-100'
                                    )}>
                                    <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', active ? 'bg-primary text-white' : 'bg-secondary/[0.07] text-secondary')}>
                                        <Icon icon={item.icon} className='text-xl' />
                                    </span>
                                    <span className='min-w-0'>
                                        <span className='block text-sm font-semibold leading-tight text-black'>{item.label}</span>
                                        <span className='mt-0.5 block text-xs text-ink/70'>{loading ? '…' : countLabel(n)}</span>
                                    </span>
                                </button>
                            )
                        })}
                    </div>

                    <div className='mt-6 mb-8 flex flex-col gap-3 md:flex-row md:items-center md:gap-4'>
                        <label className='relative block md:w-56 md:shrink-0'>
                            <span className='sr-only'>Ville</span>
                            <Icon icon='tabler:map-pin' className='pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-lg text-secondary' />
                            <select
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                className='min-h-12 w-full rounded-xl border border-gray-200 bg-white pr-3 pl-10 font-medium text-secondary outline-hidden focus:border-primary hover:cursor-pointer'>
                                <option value=''>Toutes les villes</option>
                                {cities.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className='relative block md:w-96'>
                            <span className='sr-only'>Nom de l’établissement</span>
                            <Icon icon='tabler:search' className='pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-lg text-ink/50' />
                            <input
                                type='search'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder='Nom de l’établissement (facultatif)'
                                className='min-h-12 w-full rounded-xl border border-gray-200 bg-white pr-3 pl-10 text-ink outline-hidden placeholder:text-ink/50 focus:border-primary'
                            />
                        </label>
                        <p className='text-secondary md:ml-auto md:shrink-0' aria-live='polite'>
                            {!loading && !pacing && (
                                <>
                                    <strong>{shown.length}</strong> établissement{shown.length > 1 ? 's' : ''} trouvé{shown.length > 1 ? 's' : ''}
                                </>
                            )}
                        </p>
                    </div>

                    {pacing ? (
                        <SearchingState label='Recherche des établissements…' count={4} gridClassName='grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4' cardClassName='h-[360px]' />
                    ) : loading ? (
                        <CardSkeletonGrid count={8} className='h-[360px]' />
                    ) : shown.length === 0 ? (
                        <p className='rounded-xl bg-white p-8 text-center text-black'>
                            {filtered ? t('Aucun établissement ne correspond à ces critères.') : t('Aucun établissement publié pour le moment.')}
                        </p>
                    ) : (
                        <>
                            <div ref={page.listRef} className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                                {page.visible.map((school) => (
                                    <SchoolCard key={school.id} school={school} compact />
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
                                <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white'>
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
                    <div className='mobile-center flex flex-col gap-4 rounded-xl bg-secondary p-8 text-white md:flex-row md:items-center md:justify-between'>
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
