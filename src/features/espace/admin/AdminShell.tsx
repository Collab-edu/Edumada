'use client'
import type { ReactNode } from 'react'
import { useApi } from '../useApi'
import { SpaceShell } from '../components/SpaceShell'

export type Overview = {
    users: { students: number; establishments: number; newLast30Days: number }
    catalog: { establishments: number; published: number; verified: number; offersPublished: number; offersUpdatedLast90Days: number }
    inquiries: { total: number; last30Days: number; processed: number; applications: number }
    subscriptions: Record<string, number>
    revenue: { thisMonth: number; last12Months: number }
    queues: {
        establishmentsPending: number
        verificationsPending: number
        claimsPending: number
        reportsOpen: number
        reviewsPending: number
        invoicesPending: number
    }
}

/** Mise en page de l'administration, avec le nombre d'éléments en attente dans le menu. */
export function AdminShell({ title, children, actions }: { title: string; children: ReactNode; actions?: ReactNode }) {
    const { data } = useApi<{ data: Overview }>('/admin/overview')
    const q = data?.data.queues

    return (
        <SpaceShell
            roles={['admin']}
            title={title}
            actions={actions}
            nav={[
                { href: '/espace/admin/', label: 'Tableau de bord', icon: 'tabler:layout-dashboard' },
                { href: '/espace/admin/etablissements/', label: 'Établissements', icon: 'tabler:building-community', badge: q ? q.establishmentsPending + q.verificationsPending : 0 },
                { href: '/espace/admin/moderation/', label: 'Modération', icon: 'tabler:shield-check', badge: q ? q.claimsPending + q.reviewsPending + q.reportsOpen : 0 },
                { href: '/espace/admin/facturation/', label: 'Facturation', icon: 'tabler:credit-card', badge: q?.invoicesPending ?? 0 },
                { href: '/espace/admin/utilisateurs/', label: 'Utilisateurs', icon: 'tabler:users' },
                { href: '/espace/admin/catalogue/', label: 'Catalogue', icon: 'tabler:category' },
                { href: '/espace/admin/journal/', label: "Journal d'audit", icon: 'tabler:history' },
            ]}>
            {children}
        </SpaceShell>
    )
}
