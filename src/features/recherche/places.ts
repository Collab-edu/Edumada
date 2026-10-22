import { api, apiEnabled } from '@/lib/api'
import type { Suggestion } from './components/SuggestInput'

type Place = { name: string; kind: string; detail: string; lat: number; lng: number }

const cache = new Map<string, Promise<Suggestion[]>>()

/**
 * Lieux de Madagascar correspondant à la saisie (régions, communes, villes, quartiers, villages…),
 * d'après la carte : chaque saisie n'est demandée qu'une fois par visite.
 */
export function searchPlaces(query: string): Promise<Suggestion[]> {
    const key = query.trim().toLowerCase()
    if (!apiEnabled || key.length < 2) return Promise.resolve([])
    if (!cache.has(key)) {
        const request = api<{ data: Place[] }>('/places', { query: { q: query.trim() }, token: null })
            .then((res) =>
                res.data.map((p) => ({
                    value: p.name,
                    hint: p.kind,
                    detail: p.detail,
                    lat: p.lat,
                    lng: p.lng,
                }))
            )
            .catch(() => {
                cache.delete(key)
                return []
            })
        cache.set(key, request)
    }
    return cache.get(key)!
}

/** « -18.84000,47.46000 » : position transmise à la recherche (paramètre pos). */
export const placePosition = (place?: Suggestion) =>
    place?.lat !== undefined && place.lng !== undefined ? `${place.lat.toFixed(5)},${place.lng.toFixed(5)}` : ''
