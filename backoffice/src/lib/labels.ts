import type { InquiryStatus } from './types'

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

/** Ce que comprend chaque formule (document « Les 4 types de comptes »). */
export const PLAN_FEATURES: Record<'free' | 'pro' | 'premium', string[]> = {
    free: ['Fiche établissement complète', 'Offres publiées : limite de la formule', 'Présence dans les résultats', 'Demandes reçues par e-mail'],
    pro: ['Tout Gratuit', 'Offres illimitées', 'Boîte de réception des demandes', 'Statuts, filtres et export CSV', 'Statistiques standard'],
    premium: ['Tout Pro', 'Campagnes « Sponsorisé »', 'Statistiques avancées par campagne', 'Accompagnement prioritaire'],
}

export const CITIES = ['Antananarivo', 'Antsirabe', 'Fianarantsoa', 'Toamasina', 'Mahajanga', 'Toliara', 'Antsiranana']
