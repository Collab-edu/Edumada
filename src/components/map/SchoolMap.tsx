'use client'
import { useEffect, useRef } from 'react'
import { Icon } from '@/components/ui/icon'
import type { Map as LeafletMap } from 'leaflet'
import 'leaflet/dist/leaflet.css'

/**
 * Carte d'un établissement aux couleurs du site : fond clair sans libellés,
 * teinté sarcelle, marqueur Edumada et boutons de zoom maison.
 */
export default function SchoolMap({
    lat,
    lng,
    name,
    address,
    className = '',
}: {
    lat: number
    lng: number
    name: string
    address?: string | null
    className?: string
}) {
    const container = useRef<HTMLDivElement>(null)
    const map = useRef<LeafletMap | null>(null)

    useEffect(() => {
        let cancelled = false
        // Leaflet touche `window` : chargé uniquement côté navigateur.
        import('leaflet').then((L) => {
            if (cancelled || !container.current || map.current) return
            const m = L.map(container.current, {
                center: [lat, lng],
                zoom: 15,
                maxZoom: 16,
                zoomControl: false,
                scrollWheelZoom: false,
                attributionControl: true,
            })
            m.attributionControl.setPrefix(false)
            m.attributionControl.setPosition('topleft')
            // Fond gris clair sans libellés (Esri), sans clé d'API.
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
                maxZoom: 16,
                attribution: '© Esri · HERE · OpenStreetMap',
            }).addTo(m)
            L.marker([lat, lng], {
                title: name,
                alt: name,
                icon: L.divIcon({
                    className: 'edu-map-marker',
                    html: '<span class="edu-map-pulse"></span><span class="edu-map-pin"><span></span></span>',
                    iconSize: [44, 56],
                    iconAnchor: [22, 52],
                }),
            }).addTo(m)
            map.current = m
        })
        return () => {
            cancelled = true
            map.current?.remove()
            map.current = null
        }
    }, [lat, lng, name])

    const zoom = (delta: number) => map.current?.setZoom(map.current.getZoom() + delta)

    return (
        <div className={`edu-map relative isolate overflow-hidden ${className}`}>
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
                {address && (
                    <span className='pointer-events-auto inline-flex max-w-full items-center gap-2 rounded-xl bg-white/95 px-3 py-2 text-sm text-black shadow-md backdrop-blur'>
                        <Icon icon='tabler:map-pin-filled' className='shrink-0 text-primary' />
                        <span className='truncate'>{address}</span>
                    </span>
                )}
                <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='pointer-events-auto inline-flex min-h-10 items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-secondary/90'>
                    <Icon icon='tabler:route' /> Itinéraire
                </a>
            </div>
        </div>
    )
}
