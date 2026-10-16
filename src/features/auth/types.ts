export type UserRole = 'student' | 'establishment' | 'admin'

/** Compte connecté, tel que renvoyé par GET /me. */
export type User = {
    id: number
    name: string
    email: string
    emailVerified: boolean
    role: UserRole
    phone: string | null
    city: string | null
    studyLevel: string | null
    establishments?: { id: string; name: string; role: 'owner' | 'editor' }[]
}

/** Back-office séparé (dossier backoffice/) : établissements et administration. */
export const BACKOFFICE_URL = (process.env.NEXT_PUBLIC_BACKOFFICE_URL ?? 'http://localhost:5173').replace(/\/+$/, '')

/** Adresse d'une page du back-office (routage par « # »). */
export const backofficeUrl = (path = '/dashboard') => `${BACKOFFICE_URL}/#${path}`

/**
 * Espace de chaque type de compte : l'espace étudiant est sur le site,
 * les établissements et l'équipe Edumada travaillent dans le back-office.
 */
export const SPACE_HOME: Record<UserRole, string> = {
    student: '/espace/etudiant/',
    establishment: backofficeUrl(),
    admin: backofficeUrl(),
}

/** Va vers une page du site ou, pour une adresse absolue, vers le back-office. */
export function goTo(url: string, push: (href: string) => void) {
    if (/^https?:\/\//.test(url)) window.location.href = url
    else push(url)
}
