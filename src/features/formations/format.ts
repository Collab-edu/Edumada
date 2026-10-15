const arFormatter = new Intl.NumberFormat('fr-FR')

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
