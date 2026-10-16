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

/** Page d'accueil de l'espace selon le type de compte. */
export const SPACE_HOME: Record<UserRole, string> = {
    student: '/espace/etudiant/',
    establishment: '/espace/etablissement/',
    admin: '/espace/admin/',
}
