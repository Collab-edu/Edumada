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
    deadline: string | null
    description: string | null
    missions: string | null
    profile: string | null
    benefits: string | null
    allowance: string | null
    acceptsApplications: boolean
}

/** Candidature de l'étudiant connecté. */
export type InternshipApplication = {
    id: number
    internship: { id: string }
}

export const internshipHref = (id: string) => `/stages/voir/?id=${encodeURIComponent(id)}`

export const formatMonths = (months: number) => (months % 12 === 0 ? `${months / 12} an${months > 12 ? 's' : ''}` : `${months} mois`)
