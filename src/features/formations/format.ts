import type { AdmissionLevel } from './types'

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

/** « 11 janvier 2027 », « 1er septembre 2026 » à partir d'une date ISO AAAA-MM-JJ. */
export function formatDate(iso: string): string {
    return dateFormatter
        .formatToParts(new Date(`${iso}T00:00:00Z`))
        .map((part) => (part.type === 'day' && part.value === '1' ? '1er' : part.value))
        .join('')
}
