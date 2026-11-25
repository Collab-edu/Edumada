'use client'
import { useEffect } from 'react'
import { analyticsAllowed, CONSENT_EVENT } from '@/lib/consent'

/** ID de mesure Google Analytics 4 (flux Web « Edumada »). Public : il figure dans le code de toutes les pages. */
export const GA_MEASUREMENT_ID = 'G-E2629R1KJ9'

/** Durée de vie des cookies _ga : 13 mois au plus (recommandation CNIL), en secondes. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 395

type GtagWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void } & Record<string, unknown>

/** Seulement sur le site en ligne : ni le développement local ni les aperçus Vercel ne faussent les chiffres. */
function isProductionHost(): boolean {
    return /(^|\.)edumada\.mg$/.test(window.location.hostname)
}

function load() {
    const w = window as unknown as GtagWindow
    w[`ga-disable-${GA_MEASUREMENT_ID}`] = false
    // Déjà chargé puis retiré : on réactive simplement la mesure.
    if (w.gtag) {
        w.gtag('consent', 'update', { analytics_storage: 'granted' })
        return
    }
    w.dataLayer = w.dataLayer ?? []
    w.gtag = function gtag() {
        // gtag attend l'objet `arguments` lui-même, pas un tableau.
        // eslint-disable-next-line prefer-rest-params
        w.dataLayer!.push(arguments)
    }
    // Le script n'est chargé qu'après l'accord ; aucun usage publicitaire, même accepté.
    w.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' })
    w.gtag('js', new Date())
    w.gtag('config', GA_MEASUREMENT_ID, {
        cookie_expires: COOKIE_MAX_AGE,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
    })
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    document.head.appendChild(script)
}

/** Accord retiré : Google Analytics s'arrête et ses cookies sont effacés. */
function unload() {
    const w = window as unknown as GtagWindow
    w[`ga-disable-${GA_MEASUREMENT_ID}`] = true
    w.gtag?.('consent', 'update', { analytics_storage: 'denied' })
    const host = window.location.hostname
    const domains = ['', host, `.${host}`, `.${host.replace(/^www\./, '')}`]
    for (const name of document.cookie.split(';').map((c) => c.split('=')[0].trim())) {
        if (name !== '_ga' && !name.startsWith('_ga_')) continue
        for (const domain of domains) document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`
    }
}

/**
 * Google Analytics 4, chargé uniquement si le visiteur l'a accepté dans le bandeau. Les pages vues
 * des navigations internes sont comptées par la « mesure améliorée » de GA4 (historique du navigateur).
 */
export default function GoogleAnalytics() {
    useEffect(() => {
        if (!isProductionHost()) return
        const apply = () => (analyticsAllowed() ? load() : unload())
        apply()
        window.addEventListener(CONSENT_EVENT, apply)
        return () => window.removeEventListener(CONSENT_EVENT, apply)
    }, [])
    return null
}
