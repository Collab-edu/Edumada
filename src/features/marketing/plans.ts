'use client'
import { useEffect, useState } from 'react'
import { api, apiEnabled } from '@/lib/api'
import type { Plan } from '@/features/espace/types'

/** Formules affichées si l'API ne répond pas (mêmes hypothèses que la base). */
export const FALLBACK_PLANS: Plan[] = [
    { code: 'free', name: 'Gratuit', monthlyPrice: 0, yearlyPrice: 0, maxPublishedOffers: 1, features: { inquiryInbox: false, statistics: 'none' } },
    { code: 'pro', name: 'Pro', monthlyPrice: 75000, yearlyPrice: 600000, maxPublishedOffers: null, features: { inquiryInbox: true, statistics: 'standard' } },
    { code: 'premium', name: 'Premium', monthlyPrice: 175000, yearlyPrice: null, maxPublishedOffers: null, features: { inquiryInbox: true, statistics: 'advanced', sponsoredPlacement: true } },
]

/** Point d'entrée de « Référencer mon établissement » : l'établissement choisit d'abord sa formule. */
export const ESTABLISHMENT_START = '/tarifs/'

export type BillingCycle = 'monthly' | 'yearly'

/** Formules de l'API, avec repli sur les valeurs par défaut. */
export function usePlans(): Plan[] {
    const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS)
    useEffect(() => {
        if (!apiEnabled) return
        api<{ data: Plan[] }>('/plans', { token: null }).then((res) => setPlans(res.data)).catch(() => undefined)
    }, [])
    return plans
}

/** Page d'inscription avec la formule choisie sur la page Tarifs. */
export function signupUrl(plan: Plan['code'], cycle: BillingCycle): string {
    return plan === 'free' ? '/inscription-etablissement/?formule=free' : `/inscription-etablissement/?formule=${plan}&rythme=${cycle}`
}
