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

export type PlanFeatureSection = { title: string; icon: 'eye' | 'mail' | 'chat' | 'megaphone'; features: string[] }

/** Ce que comprend une formule, tel que présenté sur la page Formule. */
export function planFeatureSections(plan: Plan): PlanFeatureSection[] {
    const max = plan.maxPublishedOffers
    if (plan.code === 'free') {
        return [
            {
                title: 'Présence et visibilité',
                icon: 'eye',
                features: [
                    'Fiche établissement essentielle',
                    max === null ? 'Offres illimitées' : `${max} ${max > 1 ? 'offres publiées' : 'offre publiée'}`,
                    'Coordonnées : adresse, téléphone et e-mail',
                    'Présence dans les résultats',
                ],
            },
            { title: 'Communication', icon: 'mail', features: ['Demandes reçues par e-mail'] },
        ]
    }
    if (plan.code === 'pro') {
        return [
            {
                title: 'Présence et visibilité',
                icon: 'eye',
                features: ['Tout Gratuit', 'Offres illimitées', 'Galerie photos, site web et réseaux sociaux', 'Infrastructures illimitées', 'Avis des étudiants'],
            },
            { title: 'Gestion et communication', icon: 'chat', features: ['Boîte de réception des demandes', 'Statuts, filtres et export CSV', 'Statistiques standard'] },
        ]
    }
    return [{ title: 'Visibilité et marketing', icon: 'megaphone', features: ['Tout Pro', 'Campagnes « Sponsorisé »', 'Statistiques avancées par campagne', 'Accompagnement prioritaire'] }]
}

