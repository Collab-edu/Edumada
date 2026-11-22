/**
 * Consentement du visiteur, gardé dans son navigateur.
 * Le stockage nécessaire au site (connexion, test d'orientation, stages enregistrés) n'en dépend pas ;
 * seule la mesure d'audience anonyme (vues et clics des fiches, voir track.ts) attend l'accord.
 */
const STORAGE_KEY = 'edumada-consent'
/** À incrémenter si les usages changent : le bandeau est alors reposé à tout le monde. */
const VERSION = 1
/** Événement émis quand le choix change, ou quand le visiteur demande à le modifier. */
export const CONSENT_EVENT = 'edumada-consent'
export const CONSENT_OPEN_EVENT = 'edumada-consent-open'

export type Consent = { version: number; measure: boolean; date: string }

export function readConsent(): Consent | null {
    if (typeof window === 'undefined') return null
    try {
        const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null') as Consent | null
        return saved?.version === VERSION ? saved : null
    } catch {
        return null
    }
}

export function saveConsent(measure: boolean) {
    const consent: Consent = { version: VERSION, measure, date: new Date().toISOString() }
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent))
    } catch {
        // Stockage indisponible (navigation privée) : le choix vaut pour la page en cours.
    }
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: consent }))
}

/** Vrai seulement si le visiteur a accepté la mesure d'audience. */
export function measureAllowed(): boolean {
    return readConsent()?.measure === true
}

/** Rouvre le bandeau (lien « Gérer les cookies » du pied de page). */
export function openConsentSettings() {
    window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))
}
