import type { InquiryStatus, Plan } from './types'

/** Statuts des demandes vus par l'établissement (« Nouvelle » plutôt que « Envoyée »). */
export const INQUIRY_STATUS_LABELS: Record<InquiryStatus, string> = {
    new: 'Nouvelle',
    in_review: 'En cours',
    information_requested: 'Informations demandées',
    interview: 'Entretien',
    accepted: 'Acceptée',
    refused: 'Refusée',
}

/** Actions du journal d'audit. */
export const ACTION_LABELS: Record<string, string> = {
    'establishment.moderated': 'Fiche modérée',
    'establishment.deleted': 'Fiche supprimée',
    'establishment.verification_requested': 'Vérification demandée',
    'establishment.claim_approved': 'Revendication acceptée',
    'establishment.claim_rejected': 'Revendication refusée',
    'establishment.member_added': 'Accès donné',
    'establishment.member_removed': 'Accès retiré',
    'offer.status_changed': "Statut d'offre modifié",
    'offer.deleted': 'Offre supprimée',
    'inquiries.exported': 'Export des demandes',
    'subscription.requested': 'Formule demandée',
    'subscription.activated': 'Formule activée',
    'subscription.cancelled': 'Abonnement résilié',
    'subscription.expired': 'Abonnement expiré',
    'invoice.cancelled': 'Facture annulée',
    'plan.updated': 'Formule modifiée',
    'review.moderated': 'Avis modéré',
    'user.role_changed': 'Type de compte modifié',
    'user.deleted': 'Compte supprimé',
    'campaign.created': 'Campagne créée',
}

export type PlanFeatureSection = { title: string; icon: 'eye' | 'chat' | 'megaphone'; features: { label: string; included: boolean }[] }

/**
 * Ce que comprend une formule, d'après ses droits réels : mêmes lignes dans le même ordre
 * pour toutes les formules, afin de voir les différences d'une carte à l'autre.
 */
export function planFeatureSections(plan: Plan): PlanFeatureSection[] {
    const f = plan.features
    const max = plan.maxPublishedOffers
    return [
        {
            title: 'Présence et visibilité',
            icon: 'eye',
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
            icon: 'chat',
            features: [
                { label: 'Demandes reçues par e-mail', included: true },
                { label: 'Boîte de réception des demandes', included: !!f.inquiryInbox },
                { label: 'Statuts, filtres et export CSV', included: !!f.inquiryInbox },
                { label: f.statistics === 'advanced' ? 'Statistiques avancées par campagne' : f.statistics === 'standard' ? 'Statistiques standard' : 'Statistiques', included: !!f.statistics && f.statistics !== 'none' },
            ],
        },
        {
            title: 'Visibilité et marketing',
            icon: 'megaphone',
            features: [
                { label: 'Campagnes « Sponsorisé »', included: !!f.sponsoredPlacement },
                { label: 'Accompagnement prioritaire', included: !!f.prioritySupport },
            ],
        },
    ]
}


