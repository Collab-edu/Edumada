'use client'
import { useEffect, useState } from 'react'
import { api, apiEnabled } from '@/lib/api'
import type { Plan } from '@/features/espace/types'

/** Formules affichées si l'API ne répond pas (mêmes hypothèses que la base). */
export const FALLBACK_PLANS: Plan[] = [
    { code: 'free', name: 'Gratuit', monthlyPrice: 0, yearlyPrice: 0, maxPublishedOffers: 1, features: { inquiryInbox: false, statistics: 'none', sponsoredPlacement: false, prioritySupport: false, photoGallery: false, onlineLinks: false, reviews: false, maxInfrastructures: 0 } },
    { code: 'pro', name: 'Pro', monthlyPrice: 75000, yearlyPrice: 600000, maxPublishedOffers: null, features: { inquiryInbox: true, statistics: 'standard', sponsoredPlacement: false, prioritySupport: false, photoGallery: true, onlineLinks: true, reviews: true, maxInfrastructures: null } },
    { code: 'premium', name: 'Premium', monthlyPrice: 175000, yearlyPrice: null, maxPublishedOffers: null, features: { inquiryInbox: true, statistics: 'advanced', sponsoredPlacement: true, prioritySupport: true, photoGallery: true, onlineLinks: true, reviews: true, maxInfrastructures: null } },
]

export type PlanFeatureSection = { title: string; features: { label: string; included: boolean }[] }

/**
 * Fonctions d'une formule par section, les mêmes pour toutes les formules pour comparer d'une carte à l'autre.
 * Même liste que `planFeatureSections` du back-office (backoffice/src/lib/labels.ts) : à modifier des deux côtés.
 */
export function planFeatureSections(plan: Plan): PlanFeatureSection[] {
    const f = plan.features
    const max = plan.maxPublishedOffers
    return [
        {
            title: 'Présence et visibilité',
            features: [
                { label: 'Fiche établissement', included: true },
                { label: max === null ? 'Offres illimitées' : `${max} ${max > 1 ? 'offres publiées' : 'offre publiée'}`, included: true },
                { label: 'Adresse, téléphone et e-mail', included: true },
                { label: 'Présence dans les résultats', included: true },
                { label: 'Galerie photos des locaux', included: !!f.photoGallery },
                { label: 'Site web et réseaux sociaux', included: !!f.onlineLinks },
                { label: 'Infrastructures', included: f.maxInfrastructures !== 0 },
                { label: 'Avis des étudiants', included: !!f.reviews },
            ],
        },
        {
            title: 'Gestion et communication',
            features: [
                { label: 'Demandes reçues par e-mail', included: true },
                { label: 'Boîte de réception des demandes', included: !!f.inquiryInbox },
                { label: 'Statuts, filtres et export CSV', included: !!f.inquiryInbox },
                { label: f.statistics === 'advanced' ? 'Statistiques avancées par campagne' : f.statistics === 'standard' ? 'Statistiques standard' : 'Statistiques', included: !!f.statistics && f.statistics !== 'none' },
            ],
        },
        {
            title: 'Visibilité et marketing',
            features: [
                { label: 'Campagnes « Sponsorisé »', included: !!f.sponsoredPlacement },
                { label: 'Accompagnement prioritaire', included: !!f.prioritySupport },
            ],
        },
    ]
}

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
