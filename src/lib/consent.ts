/**
 * Consentement du visiteur, gardé dans son navigateur (recommandations CNIL, RGPD, loi malgache 2014-038).
 * Le stockage nécessaire au site (connexion, test d'orientation, stages enregistrés) n'en dépend pas.
 * Deux usages attendent l'accord, chacun avec son propre choix :
 * - `measure` : la mesure d'audience anonyme des fiches (vues et clics, voir track.ts), sans cookie ;
 * - `analytics` : Google Analytics (fréquentation du site), qui dépose ses cookies (voir GoogleAnalytics.tsx).
 *
 * - Refuser est aussi simple qu'accepter ; rien n'est actif avant le choix.
 * - Le choix, accepté comme refusé, est redemandé après 6 mois.
 * - Le signal « Global Privacy Control » du navigateur vaut refus, sans bandeau.
 */
const STORAGE_KEY = 'edumada-consent'
/** À incrémenter si les usages changent : le bandeau est alors reposé à tout le monde. */
export const CONSENT_VERSION = 3
/** Durée de validité d'un choix : 6 mois. */
export const CONSENT_MAX_AGE_DAYS = 182
/** Événement émis quand le choix change, ou quand le visiteur demande à le modifier. */
export const CONSENT_EVENT = 'edumada-consent'
export const CONSENT_OPEN_EVENT = 'edumada-consent-open'

/** Classe posée sur <html> quand le choix est fait : le bandeau, présent dans le HTML, reste masqué. */
export const CONSENT_DONE_CLASS = 'consent-done'

/**
 * Script placé dans <head>, exécuté avant l'affichage : si un choix valide est enregistré (ou si le
 * navigateur envoie Global Privacy Control), il masque le bandeau sans clignotement. Mêmes règles que readConsent().
 */
export const CONSENT_HEAD_SCRIPT = `try{var c=JSON.parse(localStorage.getItem('${STORAGE_KEY}')||'null');if((c&&c.version===${CONSENT_VERSION}&&(Date.now()-new Date(c.date).getTime())/864e5<=${CONSENT_MAX_AGE_DAYS})||navigator.globalPrivacyControl===true)document.documentElement.classList.add('${CONSENT_DONE_CLASS}')}catch(e){}`

export type Consent = {
    version: number
    measure: boolean
    analytics: boolean
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

export type ConsentChoice = { measure: boolean; analytics: boolean }

export function saveConsent(choice: ConsentChoice, source: Consent['source'] = 'banner') {
    const consent: Consent = { version: CONSENT_VERSION, ...choice, date: new Date().toISOString(), id: randomId(), source }
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

/** Vrai seulement si le visiteur a accepté Google Analytics, et que son navigateur ne s'y oppose pas. */
export function analyticsAllowed(): boolean {
    return !globalPrivacyControl() && readConsent()?.analytics === true
}

/** Rouvre le bandeau (lien « Gérer les cookies » du pied de page et de la politique de confidentialité). */
export function openConsentSettings() {
    window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))
}
