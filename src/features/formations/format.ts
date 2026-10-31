import type { AdmissionLevel, FormationType } from './types'

const arFormatter = new Intl.NumberFormat('fr-FR')

export const ADMISSION_LEVEL_LABEL: Record<AdmissionLevel, string> = {
    Aucun: 'Aucun diplôme requis',
    BAC: 'Baccalauréat',
    'BAC+2': 'BAC+2 (BTS, DTS…)',
    'BAC+3': 'BAC+3 (Licence)',
}
// UTC : la date affichée est la même au rendu serveur et dans le navigateur.
const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

/** « 1 800 000 Ar » ; null si les frais ne sont pas renseignés. */
export function formatFees(fees: number | null): string | null {
    return fees === null ? null : `${arFormatter.format(fees)} Ar`
}

/** « 6 mois », « 1 an », « 3 ans » ou « Durée à préciser ». */
export function formatDuration(years: number | null): string {
    if (years === null) return 'Durée à préciser'
    if (years < 1) return `${Math.round(years * 12)} mois`
    return years === 1 ? '1 an' : `${years} ans`
}

/** « 3 mois », « 1 an », « 6 ans ». */
export function formatAge(years: number): string {
    if (years < 1) return `${Math.round(years * 12)} mois`
    return years === 1 ? '1 an' : `${years} ans`
}

/** « 3 – 6 ans » ou « 3 mois – 3 ans ». */
export function formatAgeRange(range: { min: number; max: number }): string {
    return range.min >= 1 ? `${range.min} – ${range.max} ans` : `${formatAge(range.min)} – ${formatAge(range.max)}`
}

/** Frais de scolarité avec leur période : « 1 800 000 Ar / an », « 180 000 Ar / mois » ; null si inconnus. */
export function formatTuition(offer: Pick<FormationType, 'fees' | 'feesPeriod'>): string | null {
    const fees = formatFees(offer.fees)
    return fees ? `${fees} / ${offer.feesPeriod}` : null
}

/**
 * Informations clés d'une offre pour les cartes, selon ce qui la caractérise :
 * diplôme et durée pour une formation, âge des enfants pour une crèche ou une école.
 */
export function offerFacts(offer: FormationType): { icon: string; label: string }[] {
    const facts: { icon: string; label: string }[] = []
    if (offer.diploma) facts.push({ icon: 'tabler:school', label: offer.diploma })
    if (offer.ageRange) facts.push({ icon: 'tabler:mood-kid', label: formatAgeRange(offer.ageRange) })
    if (offer.durationYears !== null) facts.push({ icon: 'tabler:clock', label: formatDuration(offer.durationYears) })
    return facts
}

/** Libellé du bouton vers la fiche, selon la nature de l'offre. */
export const OFFER_CTA: Record<FormationType['kind'], string> = {
    formation: 'Voir la formation',
    niveau: 'Voir le niveau',
    accueil: "Voir l'accueil proposé",
}

/** « 11 janvier 2027 », « 1er septembre 2026 » à partir d'une date ISO AAAA-MM-JJ. */
export function formatDate(iso: string): string {
    return dateFormatter
        .formatToParts(new Date(`${iso}T00:00:00Z`))
        .map((part) => (part.type === 'day' && part.value === '1' ? '1er' : part.value))
        .join('')
}
