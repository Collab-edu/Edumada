import type { CategoryType } from '@/features/categories/types'
import type { OfferKind } from './types'

/** Informations affichées sur une fiche selon le type d'offre : une crèche n'a ni diplôme ni débouchés. */
export const KIND_FIELDS: Record<OfferKind, CategoryType['fields']> = {
    formation: { diplomas: true, programme: true, level: true, childAge: false, duration: true, careers: true },
    niveau: { diplomas: true, programme: true, level: false, childAge: true, duration: false, careers: false },
    accueil: { diplomas: false, programme: false, level: false, childAge: true, duration: false, careers: false },
}

/** Libellés de la fiche qui changent selon le type d'offre. */
export const KIND_LABELS: Record<OfferKind, { fees: string; start: string; languages: string; place: string; organisation: string }> = {
    formation: { fees: 'Frais de scolarité', start: 'Date de rentrée', languages: "Langues d'enseignement", place: 'Campus', organisation: 'Organisation de la formation' },
    niveau: { fees: 'Frais de scolarité', start: 'Date de rentrée', languages: "Langues d'enseignement", place: 'Établissement', organisation: 'Organisation de la scolarité' },
    accueil: { fees: "Frais d'accueil", start: "Début de l'accueil", languages: 'Langues parlées', place: "Lieu d'accueil", organisation: "Organisation de l'accueil" },
}
