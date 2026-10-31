'use client'
import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from '@/i18n/client'
import { Icon } from '@/components/ui/icon'
import { ButtonLink } from '@/components/ui/form'
import { CardSkeletonGrid } from '@/components/ui/card'
import SectionHeader from '@/components/ui/section-header'
import { apiEnabled, fetchAllPages } from '@/lib/api'
import SuggestInput from '@/features/recherche/components/SuggestInput'
import { FILTER_UI } from '@/features/recherche/useFilterSuggestions'
import CompanyLogo from './CompanyLogo'
import { formatMonths, internshipHref, type Internship } from '../types'

const BENEFITS = [
    { icon: 'tabler:tools', title: 'Une expérience concrète', text: 'Mettez en pratique ce que vous apprenez et découvrez un métier sur le terrain.' },
    { icon: 'tabler:map-pin', title: 'Près de chez vous', text: 'Filtrez par ville pour trouver un stage proche de votre domicile.' },
    { icon: 'tabler:message-circle', title: 'Un contact direct', text: 'Chaque offre indique comment postuler auprès de la société.' },
]

const suggestions = (values: (string | null)[]) =>
    [...new Set(values.filter((v): v is string => !!v))].sort((a, b) => a.localeCompare(b, 'fr')).map((value) => ({ value }))

/** Page publique des offres de stage. */
export default function InternshipsPage() {
    const [items, setItems] = useState<Internship[]>([])
    const [state, setState] = useState<'loading' | 'ready' | 'error'>(apiEnabled ? 'loading' : 'ready')
    const [domain, setDomain] = useState('')
    const [city, setCity] = useState('')

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

    const shown = useMemo(() => items.filter((i) => (!domain || i.domain === domain) && (!city || i.city === city)), [items, domain, city])
    const domains = useMemo(() => suggestions(items.map((i) => i.domain)), [items])
    const cities = useMemo(() => suggestions(items.map((i) => i.city)), [items])
    const filtered = !!(domain || city)

    return (
        <>
            <section className='pt-28 pb-10 sm:pt-32'>
                <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                    <div className='grid gap-8 lg:grid-cols-2 lg:items-center'>
                        <div className='mobile-center flex max-w-3xl flex-col gap-4'>
                            <p className='font-semibold uppercase tracking-wide text-primary'>Offres de stage</p>
                            <h1 className='text-3xl md:text-5xl font-bold text-secondary'>Trouvez votre stage à Madagascar</h1>
                            <p className='text-black'>Retrouvez les offres de stage publiées par Edumada : comparez les domaines et les villes, puis postulez directement auprès de la société.</p>
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
                    <SectionHeader title='Les offres de stage' description='Filtrez par domaine et par ville pour trouver le stage qui correspond à votre projet.' />

                    <div role='search' aria-label='Filtrer les offres de stage' className='mb-6 grid grid-cols-1 gap-2 rounded-2xl bg-white p-3 ring-1 ring-secondary/10 shadow-[0_24px_60px_-30px_rgba(15,76,92,0.45)] sm:grid-cols-[1fr_1fr_auto] sm:items-center'>
                        <div className='rounded-xl px-4 py-3 transition-colors duration-200 hover:bg-offwhite sm:rounded-none sm:border-r sm:border-gray-100'>
                            <SuggestInput icon={FILTER_UI.domaine.icon} label='Domaine' placeholder={FILTER_UI.domaine.placeholder} suggestions={domains} value={domain} onChange={setDomain} />
                        </div>
                        <div className='rounded-xl px-4 py-3 transition-colors duration-200 hover:bg-offwhite sm:rounded-none sm:border-r sm:border-gray-100'>
                            <SuggestInput icon='tabler:map-pin' label='Ville' placeholder='Ex. : Antananarivo, Toamasina…' suggestions={cities} value={city} onChange={setCity} />
                        </div>
                        <button
                            type='button'
                            disabled={!filtered}
                            onClick={() => {
                                setDomain('')
                                setCity('')
                            }}
                            className='h-11 rounded-lg px-3 text-sm font-semibold text-primary hover:underline disabled:invisible hover:cursor-pointer'>
                            Réinitialiser
                        </button>
                    </div>

                    {state === 'loading' ? (
                        <CardSkeletonGrid count={4} className='h-[240px]' />
                    ) : state === 'error' ? (
                        <p className='rounded-xl bg-white p-8 text-center text-black'>Impossible de charger les offres de stage pour l’instant. Réessayez dans quelques minutes.</p>
                    ) : shown.length === 0 ? (
                        <p className='rounded-xl bg-white p-8 text-center text-black'>{filtered ? 'Aucune offre de stage ne correspond à ces critères.' : 'Aucune offre de stage publiée pour le moment.'}</p>
                    ) : (
                        <>
                            <p className='mb-4 text-sm text-ink/60' aria-live='polite'>
                                {shown.length} offre{shown.length > 1 ? 's' : ''} de stage
                            </p>
                            <ul className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
                                {shown.map((i) => (
                                    <li key={i.id}>
                                        <Link href={internshipHref(i.id)} className='flex h-full flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 transition-shadow hover:shadow-md'>
                                            <span className='flex items-center gap-3'>
                                                <CompanyLogo name={i.companyName} logo={i.companyLogo} className='h-14 w-14' />
                                                <span className='min-w-0 font-semibold text-secondary'>{i.companyName}</span>
                                            </span>
                                            <span className='text-lg font-semibold text-secondary'>{i.title}</span>
                                            <span className='flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink/70'>
                                                <span className='inline-flex items-center gap-1'>
                                                    <Icon icon='tabler:map-pin' />
                                                    {i.city}
                                                </span>
                                                {i.durationMonths && (
                                                    <span className='inline-flex items-center gap-1'>
                                                        <Icon icon='tabler:clock-hour-4' />
                                                        {formatMonths(i.durationMonths)}
                                                    </span>
                                                )}
                                                {i.domain && <span>{i.domain}</span>}
                                            </span>
                                            <span className='mt-auto font-semibold text-primary'>Voir le stage</span>
                                        </Link>
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
