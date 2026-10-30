import type { SchoolType } from '@/features/etablissements/types'
import type { FormationDetailType, FormationType } from '@/features/formations/types'

/** Formule (Gratuit, Pro, Premium) telle que renvoyée par l'API. */
export type Plan = {
    code: 'free' | 'pro' | 'premium'
    name: string
    monthlyPrice: number | null
    yearlyPrice: number | null
    maxPublishedOffers: number | null
    features: { inquiryInbox?: boolean; statistics?: 'none' | 'standard' | 'advanced'; sponsoredPlacement?: boolean; prioritySupport?: boolean }
}

export type ManagedOffer = FormationType & {
    status: 'draft' | 'published' | 'archived'
    statusLabel: string
    details: FormationDetailType
    updatedAt: string
}

/** Établissement vu par son équipe : `SchoolType` + statut, formule et offres (brouillons compris). */
export type ManagedEstablishment = SchoolType & {
    status: 'draft' | 'pending_review' | 'published' | 'suspended'
    statusLabel: string
    memberRole?: 'owner' | 'editor'
    plan: Plan
    publishedOffersCount: number
    offers?: ManagedOffer[]
    members?: { id: number; name: string; email: string; role: string }[]
    updatedAt: string
    createdAt?: string
}

export type InquiryStatus = 'new' | 'in_review' | 'information_requested' | 'interview' | 'accepted' | 'refused'

export type Inquiry = {
    id: number
    type: 'information' | 'application'
    typeLabel: string
    status: InquiryStatus
    statusLabel: string
    name: string
    email: string
    phone: string | null
    message: string | null
    offer: { id: string; urlSlug: string; title: string } | null
    establishment: { id: string; name: string }
    createdAt: string
    updatedAt: string
    history?: { from: string | null; to: InquiryStatus; toLabel: string; note: string | null; at: string }[]
    attachments?: { id: number; name: string; mimeType: string; size: number }[]
}

/** Libellés vus par l'établissement (« Nouvelle ») et par l'étudiant (« Envoyée »). */
export const INQUIRY_STATUS_FOR_ESTABLISHMENT: Record<InquiryStatus, string> = {
    new: 'Nouvelle',
    in_review: 'En cours',
    information_requested: 'Informations demandées',
    interview: 'Entretien',
    accepted: 'Acceptée',
    refused: 'Refusée',
}

export const INQUIRY_STATUS_TONE: Record<InquiryStatus, 'neutral' | 'success' | 'warning' | 'danger' | 'info'> = {
    new: 'danger',
    in_review: 'info',
    information_requested: 'warning',
    interview: 'info',
    accepted: 'success',
    refused: 'neutral',
}

export type Invoice = {
    id: number
    number: string
    establishment: { id: string; name: string; address: string | null; city: string; email: string | null }
    plan: { code: Plan['code']; name: string }
    billingCycle: 'monthly' | 'yearly'
    billingCycleLabel: string
    amount: number
    status: 'pending' | 'paid' | 'cancelled'
    statusLabel: string
    paymentMethod: string
    paymentMethodLabel: string
    paymentInstructions: string | null
    paymentReference: string | null
    paidAt: string | null
    periodStartsOn: string | null
    periodEndsOn: string | null
    createdAt: string
}

export type Subscription = {
    id: number
    plan: Plan
    status: 'active' | 'grace' | 'expired' | 'cancelled'
    statusLabel: string
    billingCycle: string
    billingCycleLabel: string
    amount: number | null
    startsAt: string
    endsAt: string | null
    graceEndsAt: string | null
    establishment?: { id: string; name: string }
}

export type Campaign = {
    id: number
    title: string
    description: string | null
    image: string | null
    callToAction: string | null
    startsOn: string
    endsOn: string
    status: 'active' | 'paused' | 'ended'
    statusLabel: string
    isRunning: boolean
    offer: { id: string; title: string }
    establishment: { id: string; name: string }
    targetCategory: string | null
    targetDomain: string | null
    targetCity: string | null
}

export type Report = {
    id: number
    establishment: { id: string; name: string }
    offer: { id: string; urlSlug: string; title: string } | null
    reason: string
    reasonLabel: string
    message: string
    email?: string | null
    status: 'open' | 'resolved' | 'dismissed'
    statusLabel: string
    createdAt: string
}

/** Valeurs acceptées par l'API (GET /reference). */
export type ReferenceData = {
    establishmentTypes: string[]
    offerKinds: string[]
    diplomas: string[]
    modalities: string[]
    registrationStatuses: string[]
    admissionLevels: string[]
    admissionSelections: string[]
    feesPeriods: string[]
    housing: string[]
    scholarships: string[]
    costsStatuses: string[]
    languages: string[]
}
