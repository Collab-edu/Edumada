/** Offre de stage d'une société, publiée par Edumada. */
export type Internship = {
    id: string
    companyName: string
    companyLogo: string | null
    title: string
    domain: string | null
    city: string
    durationMonths: number | null
    modality: string
    registration: string
    startDate: string | null
    contact: string
    description: string | null
}

export const internshipHref = (id: string) => `/stages/voir/?id=${encodeURIComponent(id)}`

export const formatMonths = (months: number) => (months % 12 === 0 ? `${months / 12} an${months > 12 ? 's' : ''}` : `${months} mois`)

/** Lien du bouton « Postuler » d'après le contact saisi : e-mail, lien ou téléphone. */
export function contactHref(contact: string): string | null {
    const text = contact.trim()
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return `mailto:${text}`
    if (/^https?:\/\//i.test(text)) return text
    if (/^www\./i.test(text)) return `https://${text}`
    if (/^\+?[\d\s().-]{7,}$/.test(text)) return `tel:${text.replace(/[^\d+]/g, '')}`
    return null
}
