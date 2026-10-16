'use client'
import { useEffect, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Icon } from '@/components/ui/icon'
import { PageSkeleton } from '@/components/ui/page-state'
import { FormAlert } from '@/components/ui/form'
import { apiEnabled } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/AuthProvider'
import { SPACE_HOME, goTo, type UserRole } from '@/features/auth/types'

export type SpaceNavItem = { href: string; label: string; icon: string; badge?: number }

interface SpaceShellProps {
    roles: UserRole[]
    title: string
    subtitle?: ReactNode
    nav: SpaceNavItem[]
    actions?: ReactNode
    /** Bandeau au-dessus du contenu (choix de l'établissement…). */
    banner?: ReactNode
    children: ReactNode
}

/**
 * Mise en page des espaces connectés (étudiant, établissement, administration), dans la charte du site :
 * onglets défilants sur mobile, colonne de navigation sur grand écran.
 * Un visiteur non connecté est renvoyé vers la connexion ; un autre type de compte vers son propre espace.
 */
export function SpaceShell({ roles, title, subtitle, nav, actions, banner, children }: SpaceShellProps) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        if (loading || !apiEnabled) return
        if (!user) router.replace(`/signin/?next=${encodeURIComponent(window.location.pathname + window.location.search)}`)
        else if (!roles.includes(user.role)) goTo(SPACE_HOME[user.role], router.replace)
    }, [loading, user, roles, router])

    if (!apiEnabled) {
        return (
            <section className='pt-32 pb-20'>
                <div className='container mx-auto max-w-xl px-4'>
                    <FormAlert tone='info'>Les espaces personnels seront disponibles quand le service en ligne d&apos;Edumada sera activé (NEXT_PUBLIC_API_URL).</FormAlert>
                </div>
            </section>
        )
    }
    if (loading || !user || !roles.includes(user.role)) return <PageSkeleton />

    const isActive = (href: string) => {
        const path = href.split('?')[0].replace(/\/$/, '')
        return pathname.replace(/\/$/, '') === path
    }

    return (
        <section className='pt-24 pb-20 sm:pt-28'>
            <div className='container mx-auto max-w-7xl px-4'>
                <div className='mb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3'>
                    <div className='flex flex-col gap-1'>
                        <h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-secondary'>{title}</h1>
                        {subtitle && <div className='text-ink/70'>{subtitle}</div>}
                    </div>
                    {actions && <div className='flex flex-wrap gap-2'>{actions}</div>}
                </div>

                {banner}

                <div className='grid grid-cols-1 lg:grid-cols-[230px_minmax(0,1fr)] gap-6'>
                    <nav aria-label='Menu de mon espace' className='-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0'>
                        <ul className='flex w-max gap-2 lg:w-auto lg:flex-col lg:gap-1 lg:sticky lg:top-28'>
                            {nav.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        aria-current={isActive(item.href) ? 'page' : undefined}
                                        className={cn(
                                            'flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors lg:rounded-xl lg:text-base',
                                            isActive(item.href) ? 'bg-secondary text-white' : 'bg-white text-secondary hover:bg-secondary/10'
                                        )}>
                                        <Icon icon={item.icon} className='text-lg' />
                                        {item.label}
                                        {!!item.badge && (
                                            <span className='ml-auto rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white'>{item.badge}</span>
                                        )}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <div className='flex min-w-0 flex-col gap-6'>{children}</div>
                </div>
            </div>
        </section>
    )
}

/** Bloc blanc de l'espace, avec titre facultatif. */
export function Panel({ title, description, actions, children, className }: { title?: string; description?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
    return (
        <div className={cn('rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6', className)}>
            {(title || actions) && (
                <div className='mb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3'>
                    <div className='flex flex-col gap-1'>
                        {title && <h2 className='text-xl font-bold'>{title}</h2>}
                        {description && <div className='text-sm text-ink/70'>{description}</div>}
                    </div>
                    {actions && <div className='flex flex-wrap gap-2'>{actions}</div>}
                </div>
            )}
            {children}
        </div>
    )
}

/** Chiffre clé d'un tableau de bord. */
export function StatCard({ label, value, icon, hint, href }: { label: string; value: ReactNode; icon: string; hint?: ReactNode; href?: string }) {
    const content = (
        <>
            <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                <Icon icon={icon} className='text-xl' />
            </span>
            <span className='text-2xl font-bold text-secondary'>{value}</span>
            <span className='text-sm text-ink/70'>{label}</span>
            {hint && <span className='text-xs text-ink/50'>{hint}</span>}
        </>
    )
    const className = 'flex flex-col gap-1 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm'
    return href ? (
        <Link href={href} className={cn(className, 'transition-colors hover:border-primary/40')}>{content}</Link>
    ) : (
        <div className={className}>{content}</div>
    )
}

/** Petite pagination « Précédent / Suivant ». */
export function Pager({ page, lastPage, onChange }: { page: number; lastPage: number; onChange: (page: number) => void }) {
    if (lastPage <= 1) return null
    return (
        <div className='flex items-center justify-center gap-3 pt-2'>
            <button type='button' disabled={page <= 1} onClick={() => onChange(page - 1)} className='min-h-11 rounded-lg border border-secondary/20 px-4 font-semibold text-secondary disabled:opacity-40 hover:cursor-pointer'>
                Précédent
            </button>
            <span className='text-sm text-ink/70'>Page {page} sur {lastPage}</span>
            <button type='button' disabled={page >= lastPage} onClick={() => onChange(page + 1)} className='min-h-11 rounded-lg border border-secondary/20 px-4 font-semibold text-secondary disabled:opacity-40 hover:cursor-pointer'>
                Suivant
            </button>
        </div>
    )
}

/** Date et heure courtes en français. */
export function formatDateTime(iso: string): string {
    return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

export function formatAriary(amount: number | null): string {
    return amount === null ? '—' : `${new Intl.NumberFormat('fr-FR').format(amount)} Ar`
}
