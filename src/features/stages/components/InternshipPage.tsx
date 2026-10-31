'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from '@/i18n/client'
import { Icon } from '@/components/ui/icon'
import { PageSkeleton, PageUnavailable } from '@/components/ui/page-state'
import { formatDate } from '@/features/formations/format'
import { api, apiEnabled, getToken } from '@/lib/api'
import ApplyPanel from './ApplyPanel'
import CompanyLogo from './CompanyLogo'
import { formatMonths, type Internship } from '../types'

/** Bloc de la fiche : plusieurs lignes deviennent une liste à puces. */
function Section({ title, text }: { title: string; text: string | null }) {
    if (!text?.trim()) return null
    const lines = text.split('\n').map((line) => line.trim()).filter(Boolean)
    return (
        <div>
            <h2 className='mb-3 text-xl font-bold text-secondary'>{title}</h2>
            {lines.length > 1 ? (
                <ul className='flex flex-col gap-2'>
                    {lines.map((line, i) => (
                        <li key={i} className='flex items-start gap-2 text-black'>
                            <span className='mt-2 h-2 w-2 shrink-0 rounded-full bg-primary' aria-hidden='true' />
                            <span>{line}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className='text-black'>{lines[0]}</p>
            )}
        </div>
    )
}

/** Fiche d'une offre de stage : /stages/voir/?id=… */
export default function InternshipPage() {
    const id = useSearchParams().get('id') ?? ''
    const [item, setItem] = useState<Internship | null>(null)
    const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'error'>(apiEnabled && id ? 'loading' : 'missing')

    useEffect(() => {
        if (!apiEnabled || !id) return
        let active = true
        api<{ data: Internship }>(`/internships/${encodeURIComponent(id)}`, { token: getToken() })
            .then((res) => {
                if (!active) return
                setItem(res.data)
                setState('ready')
            })
            .catch((error) => active && setState(error?.status === 404 ? 'missing' : 'error'))
        return () => {
            active = false
        }
    }, [id])

    if (state === 'loading') return <PageSkeleton />
    if (state === 'error') return <PageUnavailable title='Service momentanément indisponible' message='Impossible de charger cette offre pour l’instant. Réessayez dans quelques minutes.' />
    if (state === 'missing' || !item) return <PageUnavailable title='Offre introuvable' message='Cette offre de stage n’existe pas ou n’est plus publiée.' />

    const facts = [
        { icon: 'tabler:map-pin', label: 'Ville', value: item.city },
        item.domain && { icon: 'tabler:tools', label: 'Domaine', value: item.domain },
        item.durationMonths && { icon: 'tabler:clock-hour-4', label: 'Durée', value: formatMonths(item.durationMonths) },
        item.startDate && { icon: 'tabler:clock-hour-4', label: 'Début', value: formatDate(item.startDate) },
        item.deadline && { icon: 'tabler:send', label: 'Date limite', value: formatDate(item.deadline) },
        item.allowance && { icon: 'tabler:tools', label: 'Gratification', value: item.allowance },
        { icon: 'tabler:map-pin', label: 'Modalité', value: item.modality },
        { icon: 'tabler:send', label: 'Candidatures', value: item.registration },
    ].filter((f): f is { icon: string; label: string; value: string } => !!f)

    return (
        <section className='pt-28 pb-20 sm:pt-32'>
            <div className='container mx-auto flex max-w-site flex-col gap-6 px-4 sm:px-6 lg:px-8'>
                <Link href='/stages/' className='inline-flex w-fit items-center gap-1 py-2 text-sm text-ink/60 hover:text-primary'>
                    <Icon icon='tabler:arrow-left' /> Toutes les offres de stage
                </Link>
                <div className='grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]'>
                    <div className='flex flex-col gap-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8'>
                        <div className='flex items-center gap-4'>
                            <CompanyLogo name={item.companyName} logo={item.companyLogo} className='h-20 w-20' />
                            <div className='min-w-0'>
                                <p className='font-semibold text-secondary'>{item.companyName}</p>
                                <h1 className='text-2xl font-bold text-secondary sm:text-3xl'>{item.title}</h1>
                            </div>
                        </div>
                        <a href='#postuler' className='flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white hover:bg-primary/90 lg:hidden'>
                            <Icon icon='tabler:send' />
                            Postuler
                        </a>
                        <dl className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                            {facts.map((f) => (
                                <div key={f.label} className='flex items-start gap-3'>
                                    <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white'>
                                        <Icon icon={f.icon} className='text-xl' />
                                    </span>
                                    <div>
                                        <dt className='text-sm text-ink/60'>{f.label}</dt>
                                        <dd className='font-medium text-secondary'>{f.value}</dd>
                                    </div>
                                </div>
                            ))}
                        </dl>
                        <Section title='Présentation' text={item.description} />
                        <Section title='Missions principales' text={item.missions} />
                        <Section title='Profil recherché' text={item.profile} />
                        <Section title='Avantages' text={item.benefits} />
                    </div>
                    <div className='lg:sticky lg:top-28'>
                        <ApplyPanel internship={item} />
                    </div>
                </div>
            </div>
        </section>
    )
}
