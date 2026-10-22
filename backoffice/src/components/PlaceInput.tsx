'use client'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { CFormFeedback, CFormInput, CFormLabel, CInputGroup, CInputGroupText } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLocationPin } from '@coreui/icons'
import { api } from '@/lib/api'

/** Lieu de Madagascar d'après la carte (OpenStreetMap), renvoyé par l'API /places. */
export type Place = { name: string; kind: string; detail: string; lat: number; lng: number }

const cache = new Map<string, Promise<Place[]>>()

function searchPlaces(query: string): Promise<Place[]> {
    const key = query.trim().toLowerCase()
    if (key.length < 2) return Promise.resolve([])
    if (!cache.has(key)) {
        cache.set(
            key,
            api<{ data: Place[] }>('/places', { query: { q: query.trim() } })
                .then((res) => res.data)
                .catch(() => {
                    cache.delete(key)
                    return []
                })
        )
    }
    return cache.get(key)!
}

/**
 * Champ « Ville » : texte libre, avec les lieux de Madagascar de la carte proposés à la frappe
 * (région, commune, quartier, village… avec district et région pour distinguer les homonymes).
 */
export default function PlaceInput({
    id,
    label,
    value,
    onChange,
    error,
    text,
    placeholder = 'Ex. : Antananarivo, Talatamaty…',
}: {
    id: string
    label: string
    value: string
    /** `place` : lieu choisi dans les suggestions, avec sa position. */
    onChange: (value: string, place?: Place) => void
    error?: string
    text?: string
    placeholder?: string
}) {
    const listId = useId()
    const [places, setPlaces] = useState<Place[]>([])
    const [open, setOpen] = useState(false)
    const [active, setActive] = useState(-1)
    const typed = useRef(false)

    useEffect(() => {
        const q = value.trim()
        if (!typed.current || q.length < 2) {
            setPlaces([])
            return
        }
        let current = true
        const timer = setTimeout(() => {
            searchPlaces(q).then((found) => {
                if (!current) return
                setPlaces(found)
                setActive(-1)
            })
        }, 250)
        return () => {
            current = false
            clearTimeout(timer)
        }
    }, [value])

    const choose = (place: Place) => {
        typed.current = false
        onChange(place.name, place)
        setPlaces([])
        setOpen(false)
    }

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (!open || places.length === 0) return
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault()
            setActive((i) => (e.key === 'ArrowDown' ? (i + 1) % places.length : (i - 1 + places.length) % places.length))
        } else if (e.key === 'Enter' && active >= 0) {
            e.preventDefault()
            choose(places[active])
        } else if (e.key === 'Escape') {
            setOpen(false)
        }
    }

    const showList = open && places.length > 0

    return (
        <div className='position-relative'>
            <CFormLabel htmlFor={id}>{label}</CFormLabel>
            <CInputGroup className='bo-icon-input'>
                <CInputGroupText>
                    <CIcon icon={cilLocationPin} />
                </CInputGroupText>
                <CFormInput
                    id={id}
                    role='combobox'
                    aria-expanded={showList}
                    aria-controls={listId}
                    aria-autocomplete='list'
                    aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
                    autoComplete='off'
                    placeholder={placeholder}
                    value={value}
                    invalid={!!error}
                    onChange={(e) => {
                        typed.current = true
                        setOpen(true)
                        onChange(e.target.value)
                    }}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setTimeout(() => setOpen(false), 150)}
                    onKeyDown={onKeyDown}
                />
            </CInputGroup>
            {error && <CFormFeedback invalid className='d-block'>{error}</CFormFeedback>}
            {text && <div className='form-text'>{text}</div>}
            {showList && (
                <ul id={listId} role='listbox' className='bo-place-list list-unstyled'>
                    {places.map((p, i) => (
                        <li
                            key={`${p.name}-${p.lat}-${p.lng}`}
                            id={`${listId}-${i}`}
                            role='option'
                            aria-selected={i === active}
                            className={i === active ? 'is-active' : ''}
                            onMouseDown={(e) => {
                                e.preventDefault()
                                choose(p)
                            }}
                            onMouseEnter={() => setActive(i)}
                        >
                            <CIcon icon={cilLocationPin} className='flex-shrink-0 text-body-secondary' />
                            <span className='d-flex flex-column' style={{ minWidth: 0 }}>
                                <strong className='text-truncate'>{p.name}</strong>
                                <small className='text-body-secondary text-truncate'>{[p.kind, p.detail].filter(Boolean).join(' · ')}</small>
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
