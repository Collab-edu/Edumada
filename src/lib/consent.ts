/**
 * Consentement du visiteur, gardé dans son navigateur (recommandations CNIL, RGPD, loi malgache 2014-038).
 * Le stockage nécessaire au site (connexion, test d'orientation, stages enregistrés) n'en dépend pas ;
 * seule la mesure d'audience anonyme (vues et clics des fiches, voir track.ts) attend l'accord.
 *
 * - Refuser est aussi simple qu'accepter ; rien n'est actif avant le choix.
 * - Le choix, accepté comme refusé, est redemandé après 6 mois.
 * - Le signal « Global Privacy Control » du navigateur vaut refus, sans bandeau.
 */
const STORAGE_KEY = 'edumada-consent'
/** À incrémenter si les usages changent : le bandeau est alors reposé à tout le monde. */
export const CONSENT_VERSION = 2
/** Durée de validité d'un choix : 6 mois. */
export const CONSENT_MAX_AGE_DAYS = 182
/** Événement émis quand le choix change, ou quand le visiteur demande à le modifier. */
export const CONSENT_EVENT = 'edumada-consent'
export const CONSENT_OPEN_EVENT = 'edumada-consent-open'

export type Consent = {
    version: number
    measure: boolean
    /** Date du choix (ISO). */
    date: string
    /** Identifiant aléatoire du choix, pour en garder la trace sans identifier la personne. */
    id: string
    /** Origine du choix : bandeau, ou signal Global Privacy Control du navigateur. */
    source: 'banner' | 'gpc'
}

function randomId(): string {
    try {
        return crypto.randomUUID()
    } catch {
        return Math.random().toString(36).slice(2) + Date.now().toString(36)
    }
}

/** Le navigateur demande de ne pas partager ni vendre les données (Global Privacy Control). */
export function globalPrivacyControl(): boolean {
    return typeof navigator !== 'undefined' && (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true
}

/** Choix en cours de validité, ou null (aucun choix, ancienne version, ou plus de 6 mois). */
export function readConsent(): Consent | null {
    if (typeof window === 'undefined') return null
    try {
        const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null') as Consent | null
        if (!saved || saved.version !== CONSENT_VERSION) return null
        const age = (Date.now() - new Date(saved.date).getTime()) / 86_400_000
        return Number.isFinite(age) && age <= CONSENT_MAX_AGE_DAYS ? saved : null
    } catch {
        return null
    }
}

export function saveConsent(measure: boolean, source: Consent['source'] = 'banner') {
    const consent: Consent = { version: CONSENT_VERSION, measure, date: new Date().toISOString(), id: randomId(), source }
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent))
    } catch {
        // Stockage indisponible (navigation privée) : le choix vaut pour la page en cours.
    }
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: consent }))
}

/** Vrai seulement si le visiteur a accepté la mesure d'audience, et que son navigateur ne s'y oppose pas. */
export function measureAllowed(): boolean {
    return !globalPrivacyControl() && readConsent()?.measure === true
}

/** Rouvre le bandeau (lien « Gérer les cookies » du pied de page et de la politique de confidentialité). */
export function openConsentSettings() {
    window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))
}
