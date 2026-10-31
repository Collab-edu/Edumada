'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from '@/i18n/client'
import { Icon } from '@/components/ui/icon'
import { PageSkeleton, PageUnavailable } from '@/components/ui/page-state'
import { formatDate } from '@/features/formations/format'
import { api, apiEnabled } from '@/lib/api'
import CompanyLogo from './CompanyLogo'
import { contactHref, formatMonths, type Internship } from '../types'

/** Fiche d'une offre de stage : /stages/voir/?id=… */
export default function InternshipPage() {
    const id = useSearchParams().get('id') ?? ''
    const [item, setItem] = useState<Internship | null>(null)
    const [state, setState] = useState<'loading' | 'ready' | 'missing' | 'error'>(apiEnabled && id ? 'loading' : 'missing')

    useEffect(() => {
        if (!apiEnabled || !id) return
        let active = true
        api<{ data: Internship }>(`/internships/${encodeURIComponent(id)}`, { token: null })
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

    const href = contactHref(item.contact)
    const closed = item.registration === 'Fermées'
    const facts = [
        { icon: 'tabler:map-pin', label: 'Ville', value: item.city },
        item.domain && { icon: 'tabler:tools', label: 'Domaine', value: item.domain },
        item.durationMonths && { icon: 'tabler:clock-hour-4', label: 'Durée', value: formatMonths(item.durationMonths) },
        item.startDate && { icon: 'tabler:clock-hour-4', label: 'Début', value: formatDate(item.startDate) },
        { icon: 'tabler:map-pin', label: 'Modalité', value: item.modality },
        { icon: 'tabler:send', label: 'Candidatures', value: item.registration },
    ].filter((f): f is { icon: string; label: string; value: string } => !!f)

    return (
        <section className='pt-28 pb-20 sm:pt-32'>
            <div className='container mx-auto flex max-w-3xl flex-col gap-6 px-4'>
                <Link href='/stages/' className='inline-flex w-fit items-center gap-1 py-2 text-sm text-ink/60 hover:text-primary'>
                    <Icon icon='tabler:arrow-left' /> Toutes les offres de stage
                </Link>
                <div className='flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8'>
                    <div className='flex items-center gap-4'>
                        <CompanyLogo name={item.companyName} logo={item.companyLogo} className='h-20 w-20' />
                        <div className='min-w-0'>
                            <p className='font-semibold text-secondary'>{item.companyName}</p>
                            <h1 className='text-2xl font-bold text-secondary sm:text-3xl'>{item.title}</h1>
                        </div>
                    </div>
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
                    {item.description && <p className='whitespace-pre-line text-black'>{item.description}</p>}
                    {closed ? (
                        <p className='rounded-xl bg-offwhite p-4 text-center font-medium text-ink'>Les candidatures sont fermées.</p>
                    ) : href ? (
                        <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel='noopener noreferrer' className='flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white hover:bg-primary/90'>
                            <Icon icon='tabler:send' />
                            Postuler
                        </a>
                    ) : (
                        <p className='rounded-xl bg-offwhite p-4 text-center font-medium text-ink'>Pour postuler : {item.contact}</p>
                    )}
                </div>
            </div>
        </section>
    )
}
