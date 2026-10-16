import { api, apiEnabled } from './api'

/**
 * Mesures d'audience envoyées à l'API (vues, clics), regroupées puis envoyées toutes les 3 secondes.
 * Aucune donnée personnelle : seulement l'établissement, l'offre et la campagne concernés.
 */
export type TrackEvent = {
    type: 'view' | 'impression' | 'click' | 'contact_click' | 'website_click' | 'apply_click'
    establishment: string
    offer?: string
    campaign?: number
}

const queue: TrackEvent[] = []
let timer: ReturnType<typeof setTimeout> | null = null
const seen = new Set<string>()

function flush() {
    timer = null
    if (queue.length === 0) return
    const events = queue.splice(0, 50)
    api('/track', { method: 'POST', body: { events }, token: null }).catch(() => {
        // Mesure perdue : sans conséquence pour l'utilisateur.
    })
    if (queue.length > 0) timer = setTimeout(flush, 3000)
}

export function track(event: TrackEvent) {
    if (!apiEnabled || typeof window === 'undefined') return
    // Une vue ou une impression n'est comptée qu'une fois par page affichée.
    if (event.type === 'view' || event.type === 'impression') {
        const key = `${location.pathname}|${event.type}|${event.establishment}|${event.offer ?? ''}|${event.campaign ?? ''}`
        if (seen.has(key)) return
        seen.add(key)
    }
    queue.push(event)
    timer ??= setTimeout(flush, 3000)
}

if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', flush)
}
