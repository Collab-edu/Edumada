import { api, apiEnabled } from '@/lib/api'
import type { Suggestion } from './components/SuggestInput'

type Place = { name: string; kind: string; detail: string; lat: number; lng: number }
export type Point = { lat: number; lng: number }

/** Libellé du lieu quand la personne cherche autour de sa position. */
export const MY_POSITION = 'Ma position'

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

/** Lieu où se trouve la personne (quartier ou localité, et leur district et région), ou null. */
export function placeAt(point: Point): Promise<Suggestion | null> {
    if (!apiEnabled) return Promise.resolve(null)
    return api<{ data: Place | null }>('/places/here', { query: { lat: point.lat.toFixed(5), lng: point.lng.toFixed(5) }, token: null })
        .then((res) => (res.data ? { value: res.data.name, hint: res.data.kind, detail: res.data.detail, lat: res.data.lat, lng: res.data.lng } : null))
        .catch(() => null)
}

/** Grandes villes proposées avant toute saisie (chefs-lieux des anciennes provinces). */
export const POPULAR_CITIES: Suggestion[] = [
    { value: 'Antananarivo', detail: 'Analamanga', lat: -18.8792, lng: 47.5079 },
    { value: 'Toamasina', detail: 'Atsinanana', lat: -18.1492, lng: 49.4023 },
    { value: 'Fianarantsoa', detail: 'Haute Matsiatra', lat: -21.4536, lng: 47.0858 },
    { value: 'Mahajanga', detail: 'Boeny', lat: -15.7167, lng: 46.3167 },
    { value: 'Toliara', detail: 'Atsimo-Andrefana', lat: -23.35, lng: 43.6667 },
    { value: 'Antsiranana', detail: 'Diana', lat: -12.2787, lng: 49.2917 },
]

/** « -18.84000,47.46000 » : position transmise à la recherche (paramètre pos). */
export const placePosition = (place?: Partial<Point>) =>
    place?.lat !== undefined && place.lng !== undefined ? `${place.lat.toFixed(5)},${place.lng.toFixed(5)}` : ''

/** Position « lat,lng » → point, ou null. */
export function parsePosition(pos: string): Point | null {
    const [lat, lng] = pos.split(',').map(Number)
    return Number.isFinite(lat) && Number.isFinite(lng) && pos.includes(',') ? { lat, lng } : null
}

/** Distance à vol d'oiseau entre deux points, en km (formule de haversine). */
export function distanceKm(a: Point, b: Point): number {
    const rad = (deg: number) => (deg * Math.PI) / 180
    const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2
    return Math.round(2 * 6371 * Math.asin(Math.sqrt(h)) * 10) / 10
}

/** Position de la personne, demandée au navigateur (elle doit l'autoriser). */
export function locateMe(): Promise<Point> {
    return new Promise((resolve, reject) => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            reject(new Error('Votre navigateur ne permet pas de vous localiser.'))
            return
        }
        navigator.geolocation.getCurrentPosition(
            (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
            (error) =>
                reject(
                    new Error(
                        error.code === error.PERMISSION_DENIED
                            ? 'Autorisez l’accès à votre position dans le navigateur.'
                            : 'Position introuvable pour le moment. Tapez plutôt un lieu.'
                    )
                ),
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
        )
    })
}

/** Élément de liste, avec sa distance au lieu recherché quand elle est connue. */
export type Located<T> = T & { distanceKm?: number }

/**
 * Filtre local par lieu (pages Établissements et Formation professionnelle) :
 * la ville exacte d'abord ; sinon, si un point est connu (lieu choisi ou ma position),
 * tous les éléments situés sur la carte, du plus proche au plus lointain, avec leur distance.
 */
export function filterByPlace<T>(
    items: T[],
    city: string,
    pos: string,
    cityOf: (item: T) => string,
    pointOf: (item: T) => Point | null | undefined
): { items: Located<T>[]; near: boolean } {
    if (!city) return { items: items as Located<T>[], near: false }
    const exact = items.filter((item) => cityOf(item).toLowerCase() === city.toLowerCase())
    const point = parsePosition(pos)
    if (exact.length > 0 && city !== MY_POSITION) return { items: exact as Located<T>[], near: false }
    if (!point) return { items: [], near: false }
    const located = items.flatMap((item) => {
        const p = pointOf(item)
        return p ? [{ ...item, distanceKm: distanceKm(point, p) }] : []
    })
    return { items: located.sort((a, b) => a.distanceKm - b.distanceKm), near: true }
}
