'use client'
import { useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/ui/icon'
import type { LayerGroup, Map as LeafletMap } from 'leaflet'
import 'leaflet/dist/leaflet.css'

type Mode = 'car' | 'foot'

type Step = { icon: string; text: string; distance: number }

type Route = { distance: number; duration: number; steps: Step[] }

type OsrmStep = { distance: number; name: string; maneuver: { type: string; modifier?: string; exit?: number } }

// Calcul d'itinéraire : serveurs OSRM publics d'OpenStreetMap (sans clé).
const ROUTER: Record<Mode, string> = {
    car: 'https://routing.openstreetmap.de/routed-car/route/v1/driving',
    foot: 'https://routing.openstreetmap.de/routed-foot/route/v1/driving',
}

const MODIFIERS: Record<string, string> = {
    left: 'à gauche',
    right: 'à droite',
    'slight left': 'légèrement à gauche',
    'slight right': 'légèrement à droite',
    'sharp left': 'franchement à gauche',
    'sharp right': 'franchement à droite',
}

/** Consigne en français et icône d'une étape OSRM. */
function describe(step: OsrmStep): Step {
    const { type, modifier = '', exit } = step.maneuver
    const on = step.name ? ` sur ${step.name}` : ''
    const left = modifier.includes('left')
    const right = modifier.includes('right')
    const icon = modifier === 'uturn' ? 'tabler:arrow-back-up' : left ? 'tabler:corner-up-left' : right ? 'tabler:corner-up-right' : 'tabler:arrow-up'
    if (type === 'depart') return { icon: 'tabler:current-location', text: `Partez${on}`, distance: step.distance }
    if (type === 'arrive') return { icon: 'tabler:flag', text: 'Vous êtes arrivé à l’établissement', distance: 0 }
    if (type === 'roundabout' || type === 'rotary')
        return { icon: 'tabler:rotate-clockwise', text: `Au rond-point, prenez la ${exit ?? 1}${exit === 1 ? 're' : 'e'} sortie${on}`, distance: step.distance }
    if (modifier === 'uturn') return { icon, text: `Faites demi-tour${on}`, distance: step.distance }
    if (!MODIFIERS[modifier]) return { icon, text: `Continuez tout droit${on}`, distance: step.distance }
    return { icon, text: `${type === 'fork' ? 'Prenez' : 'Tournez'} ${MODIFIERS[modifier]}${on}`, distance: step.distance }
}

const formatDistance = (m: number) => (m < 1000 ? `${Math.max(10, Math.round(m / 10) * 10)} m` : `${(m / 1000).toFixed(1).replace('.', ',')} km`)

const formatDuration = (s: number) => {
    const min = Math.max(1, Math.round(s / 60))
    return min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}`
}

const position = () =>
    new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) reject(new Error('unsupported'))
        else navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 })
    })

/**
 * Carte d'un établissement aux couleurs du site (Leaflet + OpenStreetMap) :
 * marqueur Edumada, zoom maison et itinéraire tracé depuis la position du visiteur.
 */
export default function SchoolMap({
    lat,
    lng,
    name,
    address,
    className = '',
    mapClassName = 'h-72',
}: {
    lat: number
    lng: number
    name: string
    address?: string | null
    /** Classes du bloc entier (placement dans la page). */
    className?: string
    /** Classes de la carte elle-même (hauteur, arrondis). */
    mapClassName?: string
}) {
    const container = useRef<HTMLDivElement>(null)
    const map = useRef<LeafletMap | null>(null)
    const leaflet = useRef<typeof import('leaflet') | null>(null)
    const routeLayer = useRef<LayerGroup | null>(null)
    const origin = useRef<[number, number] | null>(null)
    const [mode, setMode] = useState<Mode>('car')
    const [state, setState] = useState<'idle' | 'locating' | 'loading' | 'done' | 'error'>('idle')
    const [error, setError] = useState('')
    const [route, setRoute] = useState<Route | null>(null)
    const [showSteps, setShowSteps] = useState(false)

    useEffect(() => {
        let cancelled = false
        // Leaflet touche `window` : chargé uniquement côté navigateur.
        import('leaflet').then((L) => {
            if (cancelled || !container.current || map.current) return
            leaflet.current = L
            const m = L.map(container.current, { center: [lat, lng], zoom: 15, maxZoom: 19, zoomControl: false, scrollWheelZoom: false })
            m.attributionControl.setPrefix(false)
            m.attributionControl.setPosition('topleft')
            // Fond OpenStreetMap : le plus complet à Madagascar ; couleurs adoucies en CSS.
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
            }).addTo(m)
            L.marker([lat, lng], {
                title: name,
                alt: name,
                zIndexOffset: 1000,
                icon: L.divIcon({
                    className: 'edu-map-marker',
                    html: '<span class="edu-map-pulse"></span><span class="edu-map-pin"><span></span></span>',
                    iconSize: [44, 56],
                    iconAnchor: [22, 52],
                }),
            }).addTo(m)
            routeLayer.current = L.layerGroup().addTo(m)
            map.current = m
        })
        return () => {
            cancelled = true
            map.current?.remove()
            map.current = null
            routeLayer.current = null
        }
    }, [lat, lng, name])

    const zoom = (delta: number) => map.current?.setZoom(map.current.getZoom() + delta)

    /** Calcule et trace le trajet depuis la position du visiteur. */
    const showRoute = async (nextMode: Mode = mode) => {
        const L = leaflet.current
        const m = map.current
        if (!L || !m || !routeLayer.current) return
        setMode(nextMode)
        setError('')
        try {
            if (!origin.current) {
                setState('locating')
                const pos = await position()
                origin.current = [pos.coords.latitude, pos.coords.longitude]
            }
            setState('loading')
            const [fromLat, fromLng] = origin.current
            const res = await fetch(`${ROUTER[nextMode]}/${fromLng},${fromLat};${lng},${lat}?overview=full&geometries=geojson&steps=true`)
            const data = await res.json()
            const r = data.routes?.[0]
            if (!res.ok || data.code !== 'Ok' || !r) throw new Error('no-route')

            const line = (r.geometry.coordinates as [number, number][]).map(([x, y]) => [y, x] as [number, number])
            routeLayer.current.clearLayers()
            L.polyline(line, { color: '#ffffff', weight: 9, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }).addTo(routeLayer.current)
            L.polyline(line, {
                color: '#0f4c5c',
                weight: 5,
                opacity: 1,
                lineCap: 'round',
                lineJoin: 'round',
                dashArray: nextMode === 'foot' ? '2 9' : undefined,
            }).addTo(routeLayer.current)
            L.marker(origin.current, {
                title: 'Votre position',
                icon: L.divIcon({ className: 'edu-map-origin', html: '<span></span>', iconSize: [22, 22], iconAnchor: [11, 11] }),
            }).addTo(routeLayer.current)
            m.fitBounds(L.latLngBounds([...line, origin.current, [lat, lng]]), { paddingTopLeft: [40, 72], paddingBottomRight: [64, 64], maxZoom: 17 })

            const steps = (r.legs[0].steps as OsrmStep[]).filter((s) => s.distance > 0 || s.maneuver.type === 'arrive').map(describe)
            setRoute({ distance: r.distance, duration: r.duration, steps })
            setState('done')
        } catch (err) {
            const denied = (err as GeolocationPositionError)?.code === 1
            setError(
                denied
                    ? 'Autorisez l’accès à votre position pour calculer le trajet, ou ouvrez l’itinéraire dans Google Maps.'
                    : (err as Error)?.message === 'no-route'
                      ? 'Aucun trajet trouvé depuis votre position.'
                      : 'Impossible de calculer le trajet pour le moment. Réessayez ou ouvrez Google Maps.'
            )
            setState('error')
        }
    }

    const clearRoute = () => {
        routeLayer.current?.clearLayers()
        map.current?.setView([lat, lng], 15)
        setRoute(null)
        setShowSteps(false)
        setState('idle')
    }

    const busy = state === 'locating' || state === 'loading'
    const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=${mode === 'foot' ? 'walking' : 'driving'}`

    return (
        <div className={className}>
            <div className={`edu-map relative isolate overflow-hidden ${mapClassName}`}>
                <div ref={container} className='absolute inset-0' role='region' aria-label={`Carte : ${name}`} />

                <div className='absolute top-3 right-3 z-[500] flex flex-col overflow-hidden rounded-xl bg-white shadow-md'>
                    <button type='button' onClick={() => zoom(1)} aria-label='Zoomer' className='flex h-10 w-10 items-center justify-center text-secondary hover:bg-offwhite hover:cursor-pointer'>
                        <Icon icon='tabler:plus' className='text-lg' />
                    </button>
                    <span className='h-px bg-gray-100' />
                    <button type='button' onClick={() => zoom(-1)} aria-label='Dézoomer' className='flex h-10 w-10 items-center justify-center text-secondary hover:bg-offwhite hover:cursor-pointer'>
                        <Icon icon='tabler:minus' className='text-lg' />
                    </button>
                </div>

                <div className='pointer-events-none absolute inset-x-3 bottom-3 z-[500] flex flex-wrap items-end justify-between gap-2'>
                    {address && state !== 'done' && (
                        <span className='pointer-events-auto inline-flex max-w-full items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-sm text-black shadow-md backdrop-blur'>
                            <Icon icon='tabler:map-pin-filled' className='shrink-0 text-primary' />
                            <span className='truncate'>{address}</span>
                        </span>
                    )}
                    {route && state === 'done' && (
                        <span className='pointer-events-auto inline-flex items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-sm shadow-md backdrop-blur'>
                            <Icon icon={mode === 'foot' ? 'tabler:walk' : 'tabler:car'} className='text-secondary' />
                            <strong className='text-secondary'>{formatDuration(route.duration)}</strong>
                            <span className='text-black'>· {formatDistance(route.distance)}</span>
                        </span>
                    )}
                    {state !== 'done' && (
                        <button
                            type='button'
                            onClick={() => showRoute()}
                            disabled={busy}
                            className='pointer-events-auto ml-auto inline-flex min-h-10 items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-secondary/90 hover:cursor-pointer disabled:opacity-80'>
                            <Icon icon={busy ? 'tabler:loader-2' : 'tabler:route'} className={busy ? 'animate-spin' : ''} />
                            {state === 'locating' ? 'Localisation…' : state === 'loading' ? 'Calcul du trajet…' : 'Itinéraire'}
                        </button>
                    )}
                </div>
            </div>

            {(state === 'done' || state === 'error' || busy) && (
                <div className='mt-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm'>
                    <div className='flex flex-wrap items-center gap-2'>
                        <div className='inline-flex rounded-xl bg-offwhite p-1' role='group' aria-label='Mode de déplacement'>
                            {(
                                [
                                    ['car', 'tabler:car', 'Voiture'],
                                    ['foot', 'tabler:walk', 'À pied'],
                                ] as const
                            ).map(([value, icon, label]) => (
                                <button
                                    key={value}
                                    type='button'
                                    aria-pressed={mode === value}
                                    disabled={busy}
                                    onClick={() => showRoute(value)}
                                    className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-medium hover:cursor-pointer ${mode === value ? 'bg-white text-secondary shadow-sm' : 'text-ink/70 hover:text-secondary'}`}>
                                    <Icon icon={icon} /> {label}
                                </button>
                            ))}
                        </div>
                        <button type='button' onClick={clearRoute} className='ml-auto inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-sm text-ink/70 hover:text-primary hover:cursor-pointer'>
                            <Icon icon='tabler:x' /> Effacer
                        </button>
                    </div>

                    {busy && <p className='mt-3 text-sm text-ink/70'>{state === 'locating' ? 'Recherche de votre position…' : 'Calcul du meilleur trajet…'}</p>}
                    {state === 'error' && <p className='mt-3 text-sm text-primary'>{error}</p>}

                    {route && state === 'done' && (
                        <>
                            <div className='mt-4 flex flex-wrap items-end gap-x-3 gap-y-1'>
                                <span className='whitespace-nowrap text-2xl font-bold text-secondary'>{formatDuration(route.duration)}</span>
                                <span className='pb-1 text-ink/70'>{formatDistance(route.distance)} · depuis votre position</span>
                            </div>
                            <p className='mt-1 text-xs text-ink/60'>Durée indicative, hors embouteillages.</p>

                            <button
                                type='button'
                                onClick={() => setShowSteps((v) => !v)}
                                aria-expanded={showSteps}
                                className='mt-3 inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:text-primary hover:cursor-pointer'>
                                {showSteps ? 'Masquer' : 'Voir'} les {route.steps.length} étapes
                                <Icon icon='tabler:chevron-down' className={`transition-transform ${showSteps ? 'rotate-180' : ''}`} />
                            </button>
                            {showSteps && (
                                <ol className='mt-2 max-h-64 overflow-y-auto divide-y divide-gray-100'>
                                    {route.steps.map((step, i) => (
                                        <li key={i} className='flex items-start gap-3 py-2.5 text-sm'>
                                            <span className='mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-offwhite text-secondary'>
                                                <Icon icon={step.icon} />
                                            </span>
                                            <span className='flex-1 text-black'>{step.text}</span>
                                            {step.distance > 0 && <span className='shrink-0 text-ink/60'>{formatDistance(step.distance)}</span>}
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </>
                    )}

                    <a
                        href={googleUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-secondary px-4 text-sm font-semibold text-secondary hover:bg-secondary hover:text-white'>
                        <Icon icon='tabler:navigation' /> Lancer la navigation (Google Maps)
                    </a>
                </div>
            )}
        </div>
    )
}
