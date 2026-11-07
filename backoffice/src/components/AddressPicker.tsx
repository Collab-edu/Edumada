'use client'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { CCol, CFormFeedback, CFormInput, CFormLabel, CFormSelect, CInputGroup, CInputGroupText, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLocationPin, cilSearch } from '@coreui/icons'
import { api, errorMessage } from '@/lib/api'
import { CITIES, MAIN_CITIES, matchCity, OTHER_CITIES } from '@/lib/cities'

/** Adresse trouvée sur OpenStreetMap (API /places/addresses). */
type AddressHit = { label: string; detail: string; city: string; lat: number; lng: number }

export type AddressValue = { address: string; city: string; lat: string; lng: string }

/** Carte OpenStreetMap intégrée, centrée sur le point avec un repère (environ 500 m autour). */
const osmEmbed = (lat: number, lng: number) => {
    const d = 0.004
    const bbox = [lng - d, lat - d, lng + d, lat + d].map((n) => n.toFixed(5)).join(',')
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat.toFixed(6)},${lng.toFixed(6)}`
}

/**
 * Adresse unique de l'établissement : recherche sur OpenStreetMap (rue, quartier, lieu connu).
 * Choisir une suggestion remplit l'adresse, la ville et la position sur la carte du site.
 */
export default function AddressPicker({
    value,
    onChange,
    errors = {},
}: {
    value: AddressValue
    onChange: (patch: Partial<AddressValue>) => void
    errors?: { address?: string; city?: string; lat?: string; lng?: string }
}) {
    const listId = useId()
    const [hits, setHits] = useState<AddressHit[]>([])
    const [open, setOpen] = useState(false)
    const [active, setActive] = useState(-1)
    const typed = useRef(false)
    // Ville hors de la liste : « Autre ville… » et saisie libre.
    const [otherCity, setOtherCity] = useState(() => !!value.city && !CITIES.includes(value.city))
    /** Ville trouvée (OpenStreetMap, Google Maps) : celle de la liste si elle y figure, sinon « Autre ville ». */
    const cityPatch = (found: string): Partial<AddressValue> => {
        if (!found) return {}
        const listed = matchCity(found)
        setOtherCity(!listed)
        return { city: listed ?? found }
    }
    // Établissement absent d'OpenStreetMap : position lue dans un lien Google Maps.
    const [showLink, setShowLink] = useState(false)
    const [link, setLink] = useState('')
    const [linkState, setLinkState] = useState<{ loading?: boolean; error?: string; ok?: string }>({})
    const hasPoint = value.lat !== '' && value.lng !== ''

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
        onChange({ address: hit.label, ...cityPatch(hit.city), lat: hit.lat.toFixed(6), lng: hit.lng.toFixed(6) })
        setHits([])
        setOpen(false)
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

    const readLink = (url: string) => {
        setLink(url)
        if (!url.trim()) return setLinkState({})
        setLinkState({ loading: true })
        api<{ data: { lat: number; lng: number; name: string; city: string } }>('/places/from-map-link', { query: { url: url.trim() } })
            .then(({ data }) => {
                onChange({
                    lat: data.lat.toFixed(6),
                    lng: data.lng.toFixed(6),
                    ...cityPatch(data.city),
                    // L'adresse déjà tapée est gardée ; sinon, le nom du lieu sur Google Maps.
                    ...(!value.address.trim() && data.name ? { address: data.name } : {}),
                })
                setLinkState({ ok: 'Position récupérée : vérifiez-la sur la carte ci-dessous.' })
            })
            .catch((e) => setLinkState({ error: errorMessage(e) }))
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
                {(errors.lat || errors.lng) && <CFormFeedback invalid className='d-block'>{errors.lat ?? errors.lng}</CFormFeedback>}
                <div className='form-text'>
                    Tapez la rue, le quartier ou le nom de l&apos;établissement, puis choisissez dans la liste : la position sur la carte du site est remplie automatiquement.{' '}
                    {!showLink && (
                        <button type='button' className='btn btn-link btn-sm p-0 align-baseline' onClick={() => setShowLink(true)}>
                            Introuvable dans la liste ? Utilisez un lien Google Maps
                        </button>
                    )}
                </div>
                {showLink && (
                    <div className='mt-2 rounded-3 border bg-body-tertiary p-3'>
                        <CFormLabel htmlFor='bo-map-link' className='small fw-semibold mb-1'>
                            Lien Google Maps de l&apos;établissement
                        </CFormLabel>
                        <CFormInput
                            id='bo-map-link'
                            type='url'
                            placeholder='https://maps.app.goo.gl/…'
                            value={link}
                            invalid={!!linkState.error}
                            valid={!!linkState.ok}
                            onChange={(e) => readLink(e.target.value)}
                        />
                        <div className='form-text'>
                            Sur Google Maps, ouvrez votre établissement, touchez « Partager » puis « Copier le lien », et collez-le ici. Écrivez l&apos;adresse à la main dans le champ ci-dessus.
                        </div>
                        {linkState.loading && <div className='small text-body-secondary mt-1'>Lecture du lien…</div>}
                        {linkState.error && <div className='small text-danger mt-1'>{linkState.error}</div>}
                        {linkState.ok && <div className='small text-success mt-1'>{linkState.ok}</div>}
                    </div>
                )}
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

            {/* Aperçu de la position choisie, sur la carte OpenStreetMap. */}
            <CCol md={12}>
                {hasPoint ? (
                    <iframe
                        title="Position de l'établissement sur la carte"
                        src={osmEmbed(Number(value.lat), Number(value.lng))}
                        style={{ width: '100%', height: 260, border: 0, borderRadius: 12 }}
                        className='border'
                        loading='lazy'
                    />
                ) : (
                    <div className='d-flex align-items-center justify-content-center rounded-3 border bg-body-tertiary text-body-secondary small text-center p-3' style={{ height: 120 }}>
                        Choisissez une adresse dans la liste pour la voir sur la carte.
                    </div>
                )}
            </CCol>

            <CCol md={12}>
                {/* Liste fixe : un même nom pour tous, donc un filtre « Ville » du site sans doublons. */}
                <CFormSelect
                    id='bo-city'
                    label='Ville'
                    value={otherCity ? '__other__' : value.city}
                    invalid={!!errors.city && !otherCity}
                    feedbackInvalid={errors.city}
                    text="Choisie d'après l'adresse ; modifiable."
                    onChange={(e) => {
                        const choice = e.target.value
                        setOtherCity(choice === '__other__')
                        onChange({ city: choice === '__other__' ? '' : choice })
                    }}
                >
                    <option value=''>Choisir…</option>
                    <optgroup label='Grandes villes'>
                        {MAIN_CITIES.map((c) => (
                            <option key={c}>{c}</option>
                        ))}
                    </optgroup>
                    <optgroup label='Autres villes'>
                        {OTHER_CITIES.map((c) => (
                            <option key={c}>{c}</option>
                        ))}
                    </optgroup>
                    <option value='__other__'>Autre ville…</option>
                </CFormSelect>
                {otherCity && (
                    <CFormInput
                        className='mt-2'
                        aria-label='Nom de la ville'
                        placeholder='Nom de la ville'
                        value={value.city}
                        invalid={!!errors.city}
                        feedbackInvalid={errors.city}
                        onChange={(e) => onChange({ city: e.target.value })}
                    />
                )}
            </CCol>
        </CRow>
    )
}
