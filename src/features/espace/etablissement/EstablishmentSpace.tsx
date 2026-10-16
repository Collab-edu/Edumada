'use client'
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Icon } from '@iconify/react/dist/iconify.js'
import { Badge, ButtonLink, EmptyState } from '@/components/ui/form'
import { PageSkeleton } from '@/components/ui/page-state'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/AuthProvider'
import { SpaceShell } from '../components/SpaceShell'
import type { ManagedEstablishment } from '../types'

type Context = {
    establishment: ManagedEstablishment
    establishments: ManagedEstablishment[]
    reload: () => Promise<void>
    /** Lien d'une page de l'espace pour l'établissement en cours. */
    href: (page: string, extra?: Record<string, string>) => string
}

const EstablishmentContext = createContext<Context | null>(null)

export function useEstablishment(): Context {
    const context = useContext(EstablishmentContext)
    if (!context) throw new Error('useEstablishment doit être utilisé dans <EstablishmentSpace>.')
    return context
}

export const STATUS_TONE = { draft: 'neutral', pending_review: 'warning', published: 'success', suspended: 'danger' } as const

/**
 * Tableau de bord établissement. L'établissement géré est choisi par `?e=` (un compte peut en gérer plusieurs) ;
 * un administrateur peut ouvrir n'importe quelle fiche avec le même écran.
 */
export function EstablishmentSpace({ title, children }: { title: string; children: ReactNode }) {
    const { user } = useAuth()
    const router = useRouter()
    const slug = useSearchParams().get('e')
    const [establishments, setEstablishments] = useState<ManagedEstablishment[] | null>(null)
    const [current, setCurrent] = useState<ManagedEstablishment | null>(null)
    const [missing, setMissing] = useState(false)

    const load = async () => {
        if (!user) return
        try {
            const list = user.role === 'admin' ? [] : (await api<{ data: ManagedEstablishment[] }>('/me/establishments')).data
            setEstablishments(list)
            const target = slug ?? list[0]?.id
            if (!target) return setCurrent(null)
            const one = list.find((e) => e.id === target)
            // La fiche complète (avec l'équipe) vient de /manage ; elle autorise aussi l'administrateur.
            const res = await api<{ data: ManagedEstablishment }>(`/establishments/${target}/manage`)
            setCurrent({ ...one, ...res.data })
            setMissing(false)
        } catch {
            setMissing(true)
        }
    }

    useEffect(() => {
        load()
        // load dépend de user et slug.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, slug])

    const href = (page: string, extra: Record<string, string> = {}) => {
        const params = new URLSearchParams({ ...(current ? { e: current.id } : {}), ...extra })
        return `/espace/etablissement/${page}${page ? '/' : ''}?${params.toString()}`
    }

    const content = () => {
        if (!user) return <PageSkeleton />
        if (missing) {
            return <EmptyState icon='tabler:lock' title='Fiche inaccessible'>Cette fiche n&apos;existe pas ou vous n&apos;en faites pas partie.</EmptyState>
        }
        if (establishments === null) return <div className='h-64 rounded-2xl bg-white animate-pulse' />
        if (!current) {
            return (
                <EmptyState
                    icon='tabler:building-plus'
                    title='Présentez votre établissement'
                    action={
                        <div className='flex flex-col sm:flex-row gap-3'>
                            <ButtonLink href='/espace/etablissement/nouveau/'>Créer ma fiche</ButtonLink>
                            <ButtonLink href='/recherche/' variant='secondary'>Ma fiche existe déjà</ButtonLink>
                        </div>
                    }>
                    Créez la fiche de votre établissement (gratuit), ou retrouvez-la sur le site et cliquez sur « Vous représentez cet établissement ? ».
                </EmptyState>
            )
        }
        return children
    }

    const nav = current
        ? [
            { href: href(''), label: 'Tableau de bord', icon: 'tabler:layout-dashboard' },
            { href: href('fiche'), label: 'Ma fiche', icon: 'tabler:building-community' },
            { href: href('offres'), label: 'Offres', icon: 'tabler:school' },
            { href: href('demandes'), label: 'Demandes', icon: 'tabler:inbox' },
            { href: href('statistiques'), label: 'Statistiques', icon: 'tabler:chart-bar' },
            { href: href('campagnes'), label: 'Campagnes', icon: 'tabler:speakerphone' },
            { href: href('formule'), label: 'Formule', icon: 'tabler:credit-card' },
        ]
        : [{ href: '/espace/etablissement/', label: 'Tableau de bord', icon: 'tabler:layout-dashboard' }]

    const banner = current && (
        <div className='mb-6 flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm'>
            <span className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-sm font-bold text-white'>{current.initials}</span>
            <div className='flex min-w-0 flex-1 flex-col'>
                {establishments && establishments.length > 1 ? (
                    <select
                        aria-label='Établissement géré'
                        value={current.id}
                        onChange={(e) => router.push(`/espace/etablissement/?e=${e.target.value}`)}
                        className='w-fit max-w-full rounded-lg border border-gray-200 bg-white py-1 pr-8 pl-2 font-bold text-secondary hover:cursor-pointer'>
                        {establishments.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                ) : (
                    <p className='truncate font-bold text-secondary'>{current.name}</p>
                )}
                <div className='mt-1 flex flex-wrap items-center gap-2'>
                    <Badge tone={STATUS_TONE[current.status]}>{current.statusLabel}</Badge>
                    <Badge tone={current.plan.code === 'free' ? 'neutral' : 'info'}>Formule {current.plan.name}</Badge>
                    {current.verification.status === 'Vérifié' && <Badge tone='success'><Icon icon='tabler:shield-check' /> Vérifiée</Badge>}
                </div>
            </div>
            <div className='-mx-2 flex flex-wrap gap-x-1 sm:mx-0'>
                {current.status === 'published' && (
                    <Link href={`/etablissements/${current.id}/`} className='inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-secondary hover:text-primary'>
                        <Icon icon='tabler:external-link' /> Fiche publique
                    </Link>
                )}
                {user?.role === 'establishment' && (
                    <Link href='/espace/etablissement/nouveau/' className={cn('inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-secondary hover:text-primary')}>
                        <Icon icon='tabler:plus' /> Ajouter un établissement
                    </Link>
                )}
            </div>
        </div>
    )

    return (
        <SpaceShell roles={['establishment', 'admin']} title={title} nav={nav} banner={banner}>
            {current ? (
                <EstablishmentContext.Provider value={{ establishment: current, establishments: establishments ?? [], reload: load, href }}>
                    {content()}
                </EstablishmentContext.Provider>
            ) : (
                content()
            )}
        </SpaceShell>
    )
}
