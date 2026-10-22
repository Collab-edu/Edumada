'use client'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import type { Suggestion } from './SuggestInput'
import { searchPlaces } from '../places'

/**
 * Champ « Ville » d'un formulaire : texte libre, avec les lieux de Madagascar de la carte proposés
 * à la frappe (commune, quartier, village… et leur district et région). Choisir un lieu transmet
 * aussi sa position (`place.lat`, `place.lng`).
 */
export default function PlaceField({
    id,
    value,
    onChange,
    className,
    placeholder = 'Ex. : Antananarivo, Talatamaty…',
    required,
    invalid,
    describedBy,
}: {
    id?: string
    value: string
    onChange: (value: string, place?: Suggestion) => void
    className?: string
    placeholder?: string
    required?: boolean
    invalid?: boolean
    describedBy?: string
}) {
    const listId = useId()
    const [places, setPlaces] = useState<Suggestion[]>([])
    const [open, setOpen] = useState(false)
    const [active, setActive] = useState(-1)
    // Pas de recherche tant que la personne n'a pas tapé (valeur déjà enregistrée, lieu choisi).
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

    const choose = (place: Suggestion) => {
        typed.current = false
        onChange(place.value, place)
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
        <div className='relative'>
            <input
                id={id}
                type='text'
                role='combobox'
                aria-expanded={showList}
                aria-controls={listId}
                aria-autocomplete='list'
                aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                autoComplete='off'
                required={required}
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                    typed.current = true
                    setOpen(true)
                    onChange(e.target.value)
                }}
                onFocus={() => setOpen(true)}
                // Laisse le temps au clic sur une suggestion d'être pris en compte.
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                onKeyDown={onKeyDown}
                className={className}
            />
            {showList && (
                <ul id={listId} role='listbox' className='absolute left-0 z-30 mt-1 max-h-72 w-full min-w-64 overflow-auto rounded-xl bg-white py-1 text-left shadow-lg ring-1 ring-black/5'>
                    {places.map((p, i) => (
                        <li
                            key={`${p.value}-${p.lat}-${p.lng}`}
                            id={`${listId}-${i}`}
                            role='option'
                            aria-selected={i === active}
                            onMouseDown={(e) => {
                                e.preventDefault()
                                choose(p)
                            }}
                            onMouseEnter={() => setActive(i)}
                            className={cn('flex cursor-pointer items-center gap-3 px-3 py-2', i === active && 'bg-cream text-primary')}>
                            <Icon icon='tabler:map-pin' className='shrink-0 text-secondary' />
                            <span className='flex min-w-0 flex-col'>
                                <span className='truncate text-sm font-semibold text-ink'>{p.value}</span>
                                <span className='truncate text-xs text-ink/60'>{[p.hint, p.detail].filter(Boolean).join(' · ')}</span>
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
