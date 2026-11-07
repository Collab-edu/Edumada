'use client'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { CButton, CCol, CFormFeedback, CFormInput, CFormLabel, CInputGroup, CInputGroupText, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLocationPin, cilSearch } from '@coreui/icons'
import type { Map as LeafletMap, Marker } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { api } from '@/lib/api'
import PlaceInput from '@/components/PlaceInput'

/** Adresse trouvée sur OpenStreetMap (API /places/addresses). */
type AddressHit = { label: string; detail: string; city: string; lat: number; lng: number }

export type AddressValue = { address: string; city: string; lat: string; lng: string }

const MADAGASCAR: [number, number] = [-18.9, 47.2]

/** Repère rouge de l'établissement (sans image : les icônes par défaut de Leaflet se perdent au build). */
const PIN_HTML =
    '<span style="display:block;width:26px;height:26px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#ff3b52;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></span>'

/**
 * Adresse unique de l'établissement : recherche sur OpenStreetMap (rue, quartier, lieu connu),
 * carte avec un repère à déplacer pour la position exacte, ville remplie automatiquement.
 */
export default function AddressPicker({
    value,
    onChange,
    errors = {},
    onNotice,
}: {
    value: AddressValue
    onChange: (patch: Partial<AddressValue>) => void
    errors?: { address?: string; city?: string; lat?: string; lng?: string }
    /** Message d'information (position introuvable…). */
    onNotice?: (message: string) => void
}) {
    const listId = useId()
    const [hits, setHits] = useState<AddressHit[]>([])
    const [open, setOpen] = useState(false)
    const [active, setActive] = useState(-1)
    const [locating, setLocating] = useState(false)
    const typed = useRef(false)
    const mapBox = useRef<HTMLDivElement>(null)
    const map = useRef<LeafletMap | null>(null)
    const marker = useRef<Marker | null>(null)
    const leaflet = useRef<typeof import('leaflet') | null>(null)
    // Toujours la dernière valeur et le dernier onChange dans les écouteurs de la carte.
    const latest = useRef({ value, onChange })
    latest.current = { value, onChange }

    const lat = Number(value.lat)
    const lng = Number(value.lng)
    const hasPoint = value.lat !== '' && value.lng !== '' && Number.isFinite(lat) && Number.isFinite(lng)

    /** Repère déplacé (glissé, clic sur la carte, ma position) : position, puis ville et adresse de ce point. */
    const placePoint = (pLat: number, pLng: number) => {
        latest.current.onChange({ lat: pLat.toFixed(6), lng: pLng.toFixed(6) })
        api<{ data: { address: string; city: string } | null }>('/places/address-at', { query: { lat: pLat, lng: pLng } })
            .then((res) => {
                if (!res.data) return
                const current = latest.current.value
                latest.current.onChange({
                    ...(res.data.city ? { city: res.data.city } : {}),
                    // L'adresse saisie à la main n'est jamais écrasée : on ne remplit qu'un champ vide.
                    ...(!current.address.trim() && res.data.address ? { address: res.data.address } : {}),
                })
            })
            .catch(() => undefined)
    }

    // Carte OpenStreetMap, créée une seule fois.
    useEffect(() => {
        let cancelled = false
        import('leaflet').then((L) => {
            if (cancelled || !mapBox.current || map.current) return
            leaflet.current = L
            const { value: v } = latest.current
            const start = v.lat && v.lng ? ([Number(v.lat), Number(v.lng)] as [number, number]) : null
            const m = L.map(mapBox.current, { scrollWheelZoom: false }).setView(start ?? MADAGASCAR, start ? 16 : 5)
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            }).addTo(m)
            m.on('click', (e) => placePoint(e.latlng.lat, e.latlng.lng))
            map.current = m
            if (start) addMarker(start)
        })
        return () => {
            cancelled = true
            map.current?.remove()
            map.current = null
            marker.current = null
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const addMarker = (point: [number, number]) => {
        const L = leaflet.current
        if (!L || !map.current) return
        const m = L.marker(point, { draggable: true, icon: L.divIcon({ className: '', html: PIN_HTML, iconSize: [26, 26], iconAnchor: [13, 26] }) })
        m.on('dragend', () => {
            const p = m.getLatLng()
            placePoint(p.lat, p.lng)
        })
        m.addTo(map.current)
        marker.current = m
    }

    // Le repère suit la position (choix d'une adresse, ma position, saisie).
    useEffect(() => {
        if (!map.current || !hasPoint) return
        if (marker.current) marker.current.setLatLng([lat, lng])
        else addMarker([lat, lng])
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lat, lng, hasPoint])

    // Suggestions OpenStreetMap pendant la frappe.
    useEffect(() => {
        const q = value.address.trim()
        if (!typed.current || q.length < 3) {
            setHits([])
            return
        }
        let current = true
        const timer = setTimeout(() => {
            api<{ data: AddressHit[] }>('/places/addresses', { query: { q } })
                .then((res) => current && (setHits(res.data), setActive(-1)))
                .catch(() => current && setHits([]))
        }, 300)
        return () => {
            current = false
            clearTimeout(timer)
        }
    }, [value.address])

    const choose = (hit: AddressHit) => {
        typed.current = false
        onChange({ address: hit.label, city: hit.city || value.city, lat: hit.lat.toFixed(6), lng: hit.lng.toFixed(6) })
        setHits([])
        setOpen(false)
        map.current?.setView([hit.lat, hit.lng], 17)
    }

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (!open || hits.length === 0) return
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault()
            setActive((i) => (e.key === 'ArrowDown' ? (i + 1) % hits.length : (i - 1 + hits.length) % hits.length))
        } else if (e.key === 'Enter' && active >= 0) {
            e.preventDefault()
            choose(hits[active])
        } else if (e.key === 'Escape') {
            setOpen(false)
        }
    }

    const locate = () => {
        if (!navigator.geolocation) return onNotice?.('Position introuvable : placez le repère sur la carte.')
        setLocating(true)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocating(false)
                placePoint(pos.coords.latitude, pos.coords.longitude)
                map.current?.setView([pos.coords.latitude, pos.coords.longitude], 17)
            },
            () => {
                setLocating(false)
                onNotice?.('Position introuvable : placez le repère sur la carte.')
            }
        )
    }

    const showList = open && hits.length > 0

    return (
        <CRow className='g-3'>
            <CCol md={12} className='position-relative'>
                <CFormLabel htmlFor='bo-address'>Adresse</CFormLabel>
                <CInputGroup className='bo-icon-input'>
                    <CInputGroupText>
                        <CIcon icon={cilSearch} />
                    </CInputGroupText>
                    <CFormInput
                        id='bo-address'
                        role='combobox'
                        aria-expanded={showList}
                        aria-controls={listId}
                        aria-autocomplete='list'
                        aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
                        autoComplete='off'
                        placeholder='Ex. : Lot II M 45 Ankadifotsy, ou le nom de votre établissement'
                        value={value.address}
                        invalid={!!errors.address}
                        onChange={(e) => {
                            typed.current = true
                            setOpen(true)
                            onChange({ address: e.target.value })
                        }}
                        onFocus={() => setOpen(true)}
                        onBlur={() => setTimeout(() => setOpen(false), 150)}
                        onKeyDown={onKeyDown}
                    />
                </CInputGroup>
                {errors.address && <CFormFeedback invalid className='d-block'>{errors.address}</CFormFeedback>}
                <div className='form-text'>Tapez la rue, le quartier ou le nom de l&apos;établissement et choisissez dans la liste. Ajustez ensuite le repère sur la carte si besoin.</div>
                {showList && (
                    <ul id={listId} role='listbox' className='bo-place-list list-unstyled'>
                        {hits.map((h, i) => (
                            <li
                                key={`${h.label}-${h.lat}-${h.lng}`}
                                id={`${listId}-${i}`}
                                role='option'
                                aria-selected={i === active}
                                className={i === active ? 'is-active' : ''}
                                onMouseDown={(e) => {
                                    e.preventDefault()
                                    choose(h)
                                }}
                                onMouseEnter={() => setActive(i)}
                            >
                                <CIcon icon={cilLocationPin} className='flex-shrink-0 text-body-secondary' />
                                <span className='d-flex flex-column' style={{ minWidth: 0 }}>
                                    <strong className='text-truncate'>{h.label}</strong>
                                    {h.detail && <small className='text-body-secondary text-truncate'>{h.detail}</small>}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </CCol>

            <CCol md={12}>
                <div ref={mapBox} style={{ height: 300, borderRadius: 12, overflow: 'hidden', zIndex: 0 }} className='border' aria-label="Carte : position de l'établissement" />
                <div className='form-text'>
                    {hasPoint ? 'Glissez le repère rouge ou cliquez sur la carte pour corriger la position.' : 'Cliquez sur la carte pour placer votre établissement.'}
                    {(errors.lat || errors.lng) && <span className='text-danger d-block'>{errors.lat ?? errors.lng}</span>}
                </div>
            </CCol>

            <CCol md={7}>
                <PlaceInput
                    id='bo-city'
                    label='Ville'
                    value={value.city}
                    error={errors.city}
                    text="Remplie d'après l'adresse ; modifiable."
                    onChange={(city, place) => {
                        onChange({ city })
                        // Ville choisie alors qu'aucune position n'est placée : on centre la carte dessus.
                        if (place && !hasPoint) map.current?.setView([place.lat, place.lng], 13)
                    }}
                />
            </CCol>
            <CCol md={5} className='d-flex align-items-start' style={{ paddingTop: '2rem' }}>
                <CButton color='secondary' variant='outline' onClick={locate} disabled={locating} className='w-100'>
                    <CIcon icon={cilLocationPin} className='me-2' />
                    {locating ? 'Localisation…' : 'Utiliser ma position actuelle'}
                </CButton>
            </CCol>
        </CRow>
    )
}
