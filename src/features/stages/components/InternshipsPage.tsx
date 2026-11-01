'use client'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Image from 'next/image'
import { Icon } from '@/components/ui/icon'
import { ButtonLink } from '@/components/ui/form'
import { CardSkeletonGrid } from '@/components/ui/card'
import { apiEnabled, fetchAllPages } from '@/lib/api'
import SearchPillBar, { SearchPillField } from '@/features/recherche/components/SearchPillBar'
import SuggestInput from '@/features/recherche/components/SuggestInput'
import SearchingState from '@/features/recherche/components/SearchingState'
import { useSearchPacing } from '@/features/recherche/useSearchPacing'
import { FILTER_UI } from '@/features/recherche/useFilterSuggestions'
import InternshipCard from './InternshipCard'
import type { Internship } from '../types'

const BENEFITS = [
    { icon: 'tabler:tools', title: 'Une expérience concrète', text: 'Mettez en pratique ce que vous apprenez et découvrez un métier sur le terrain.' },
    { icon: 'tabler:map-pin', title: 'Partout à Madagascar', text: 'Chaque offre indique la ville du stage et sa durée.' },
    { icon: 'tabler:send', title: 'Une candidature simple', text: 'Envoyez votre CV et votre lettre de motivation depuis votre compte.' },
]

const suggestions = (values: (string | null)[]) =>
    [...new Set(values.filter((v): v is string => !!v))].sort((a, b) => a.localeCompare(b, 'fr')).map((value) => ({ value }))

/** Page publique des offres de stage. */
export default function InternshipsPage() {
    const [items, setItems] = useState<Internship[]>([])
    const [state, setState] = useState<'loading' | 'ready' | 'error'>(apiEnabled ? 'loading' : 'ready')
    const [domain, setDomain] = useState('')
    const [draft, setDraft] = useState('')
    const { pacing, startPacing } = useSearchPacing()
    // « Rechercher » : applique la saisie et ferme le clavier.
    const search = (e: FormEvent) => {
        e.preventDefault()
        setDomain(draft)
        startPacing()
        ;(document.activeElement as HTMLElement | null)?.blur()
    }

    useEffect(() => {
        if (!apiEnabled) return
        let active = true
        fetchAllPages<Internship>('/internships', {}, { token: null })
            .then((data) => {
                if (!active) return
                setItems(data)
                setState('ready')
            })
            .catch(() => active && setState('error'))
        return () => {
            active = false
        }
    }, [])

    const shown = useMemo(() => items.filter((i) => !domain || i.domain === domain), [items, domain])
    const domains = useMemo(() => suggestions(items.map((i) => i.domain)), [items])
    const filtered = !!domain

    return (
        <>
            <section className='pt-28 pb-10 sm:pt-32'>
                <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                    <div className='grid gap-8 lg:grid-cols-2 lg:items-center'>
                        <div className='mobile-center flex max-w-3xl flex-col gap-4'>
                            <p className='font-semibold uppercase tracking-wide text-primary'>Offres de stage</p>
                            <h1 className='text-3xl md:text-5xl font-bold text-secondary'>Trouvez votre stage à Madagascar</h1>
                            <p className='text-black'>Retrouvez les offres de stage publiées par Edumada : comparez les domaines, puis envoyez votre candidature depuis votre compte.</p>
                            <div className='mobile-center flex flex-wrap gap-3'>
                                <ButtonLink href='#offres'>
                                    <Icon icon='tabler:search' className='text-lg' />
                                    Voir les offres de stage
                                </ButtonLink>
                                <ButtonLink href='/contact/' variant='secondary'>
                                    Nous contacter
                                </ButtonLink>
                            </div>
                        </div>
                        <div className='relative h-56 overflow-hidden rounded-2xl shadow-[6px_6px_0_0_rgba(15,76,92,0.22)] sm:h-72 lg:h-80'>
                            <Image
                                src='https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=70'
                                alt='Stagiaires au travail en équipe'
                                fill
                                priority
                                sizes='(min-width: 1024px) 50vw, 100vw'
                                className='object-cover'
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section id='offres' className='scroll-mt-20'>
                <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                    <SearchPillBar
                        title='Les offres de stage'
                        count={state === 'ready' && !pacing ? `${shown.length} offre${shown.length > 1 ? 's' : ''} de stage à Madagascar` : ''}
                        label='Filtrer les offres de stage'
                        onSubmit={search}>
                        <SearchPillField>
                            <SuggestInput
                                pill
                                icon={FILTER_UI.domaine.icon}
                                label='Domaine'
                                placeholder='Domaine'
                                suggestions={domains}
                                value={draft}
                                onChange={(value) => {
                                    setDraft(value)
                                    if (!value && domain) {
                                        setDomain('')
                                        startPacing()
                                    }
                                }}
                            />
                        </SearchPillField>
                    </SearchPillBar>

                    {pacing ? (
                        <SearchingState label='Recherche des offres de stage…' count={4} gridClassName='grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4' cardClassName='h-[300px]' />
                    ) : state === 'loading' ? (
                        <CardSkeletonGrid count={4} className='h-[420px]' />
                    ) : state === 'error' ? (
                        <p className='rounded-xl bg-white p-8 text-center text-black'>Impossible de charger les offres de stage pour l’instant. Réessayez dans quelques minutes.</p>
                    ) : shown.length === 0 ? (
                        <p className='rounded-xl bg-white p-8 text-center text-black'>{filtered ? 'Aucune offre de stage ne correspond à ces critères.' : 'Aucune offre de stage publiée pour le moment.'}</p>
                    ) : (
                        <>
                            <ul className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'>
                                {shown.map((i) => (
                                    <li key={i.id}>
                                        <InternshipCard internship={i} />
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            </section>

            <section className='pt-0'>
                <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                    <ul className='grid gap-4 sm:grid-cols-3'>
                        {BENEFITS.map((b) => (
                            <li key={b.title} className='flex gap-4 rounded-xl border border-gray-100 bg-white p-5'>
                                <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white'>
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

            <section className='pb-20'>
                <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                    <div className='mobile-center flex flex-col gap-4 rounded-2xl bg-secondary p-8 text-white md:flex-row md:items-center md:justify-between'>
                        <div>
                            <h2 className='text-2xl font-bold text-white'>Vous proposez un stage ?</h2>
                            <p className='text-white/80'>Envoyez-nous votre offre : l’équipe Edumada se charge de la publier.</p>
                        </div>
                        <ButtonLink href='/contact/' className='shrink-0'>
                            Nous contacter
                        </ButtonLink>
                    </div>
                </div>
            </section>
        </>
    )
}
