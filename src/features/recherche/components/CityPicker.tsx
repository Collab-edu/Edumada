'use client'
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import { normalize, type Suggestion } from './SuggestInput'
import { MY_POSITION, POPULAR_CITIES, locateMe, placeAt, searchPlaces, type Point } from '../places'

interface CityPickerProps {
    label: string
    placeholder: string
    /** Villes qui ont des formations (avec leur nombre d'offres en `hint`). */
    suggestions: Suggestion[]
    /** Valeur choisie ; chaîne vide = pas de filtre. */
    value: string
    /** `place` : lieu choisi avec sa position (lieu de la carte, grande ville ou ma position). */
    onChange: (value: string, place?: Suggestion) => void
}

type Option = { key: string; value: string; place?: Suggestion; label: string; detail?: string; hint?: string; icon: string }
type Section = { title: string; icon?: string; options: Option[] }

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

/**
 * Champ « Ville / Localisation » : un bouton ouvre un panneau avec une recherche (villes qui ont
 * des formations, puis tous les lieux de Madagascar sur la carte), la position actuelle de la
 * personne (nommée d'après la carte) et les grandes villes. Un lieu absent de la carte reste
 * cherchable (« Chercher autour de … »).
 */
export function CityPicker({ label, placeholder, suggestions, value, onChange }: CityPickerProps) {
    const id = useId()
    const root = useRef<HTMLDivElement>(null)
    const trigger = useRef<HTMLButtonElement>(null)
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [places, setPlaces] = useState<Suggestion[] | null>(null)
    const [active, setActive] = useState(-1)
    // Position de la personne et nom du lieu correspondant (null : pas encore nommé).
    const [here, setHere] = useState<{ point: Point; place: Suggestion | null } | null>(null)
    const [locating, setLocating] = useState(false)
    const [locateError, setLocateError] = useState('')

    const close = (focusTrigger = false) => {
        setOpen(false)
        setQuery('')
        if (focusTrigger) trigger.current?.focus()
    }

    const choose = (option: Option) => {
        onChange(option.value, option.place)
        close(true)
    }

    const applyHere = (point: Point) => onChange(MY_POSITION, { value: MY_POSITION, ...point })

    /** Demande la position au navigateur, puis le nom du lieu ; `use` : l'applique tout de suite. */
    const locate = (use: boolean) => {
        setLocating(true)
        setLocateError('')
        locateMe()
            .then((point) => {
                setHere({ point, place: null })
                if (use) {
                    applyHere(point)
                    close()
                }
                placeAt(point).then((place) => setHere((h) => (h?.point === point ? { point, place } : h)))
            })
            .catch((error: Error) => setLocateError(error.message))
            .finally(() => setLocating(false))
    }

    // Position déjà autorisée : proposée dès l'ouverture, sans redemander.
    useEffect(() => {
        if (!open || here || locating || typeof navigator === 'undefined' || !navigator.permissions) return
        navigator.permissions
            .query({ name: 'geolocation' })
            .then((status) => status.state === 'granted' && locate(false))
            .catch(() => {})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    // Fermeture au clic en dehors du champ.
    useEffect(() => {
        if (!open) return
        const onDown = (e: MouseEvent) => {
            if (!root.current?.contains(e.target as Node)) close()
        }
        document.addEventListener('mousedown', onDown)
        return () => document.removeEventListener('mousedown', onDown)
    }, [open])

    // Lieux de la carte : demandés après une courte pause dans la frappe.
    useEffect(() => {
        const q = query.trim()
        setPlaces(null)
        if (q.length < 2) return
        let current = true
        const timer = setTimeout(() => {
            searchPlaces(q).then((found) => current && setPlaces(found))
        }, 250)
        return () => {
            current = false
            clearTimeout(timer)
        }
    }, [query])

    const offersIn = (city: string) => suggestions.find((s) => normalize(s.value) === normalize(city))?.hint

    const sections = useMemo<Section[]>(() => {
        const q = normalize(query)
        if (!q) {
            return [
                {
                    title: 'Villes populaires',
                    options: POPULAR_CITIES.map((c) => ({ key: `pop-${c.value}`, value: c.value, place: c, label: c.value, detail: c.detail, hint: offersIn(c.value), icon: 'tabler:map-pin' })),
                },
            ]
        }
        const cities = suggestions
            .filter((s) => normalize(s.value).includes(q))
            .sort((a, b) => Number(!normalize(a.value).startsWith(q)) - Number(!normalize(b.value).startsWith(q)))
        const mapPlaces = (places ?? []).filter((p) => !cities.some((c) => normalize(c.value) === normalize(p.value)))
        const known = [...cities, ...mapPlaces].some((p) => normalize(p.value) === q)
        const result: Section[] = []
        if (cities.length) {
            result.push({
                title: 'Villes avec des formations',
                options: cities.map((c) => {
                    // Position de la grande ville quand elle est connue : sert aussi aux résultats proches.
                    const point = POPULAR_CITIES.find((p) => p.value === c.value)
                    return { key: `ville-${c.value}`, value: c.value, place: point, label: c.value, hint: c.hint, icon: 'tabler:school' }
                }),
            })
        }
        if (mapPlaces.length) {
            result.push({
                title: 'Lieux sur la carte',
                options: mapPlaces.map((p) => ({
                    key: `lieu-${p.value}-${p.lat}-${p.lng}`,
                    value: p.value,
                    place: p,
                    label: p.value,
                    detail: [p.hint, p.detail].filter(Boolean).join(' · '),
                    icon: 'tabler:map-pin',
                })),
            })
        }
        if (!known && q.length >= 2) {
            const text = capitalize(query.trim())
            result.push({ title: '', options: [{ key: 'libre', value: text, label: `Chercher autour de « ${text} »`, icon: 'tabler:search' }] })
        }
        return result
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query, places, suggestions])

    const options = sections.flatMap((s) => s.options)
    useEffect(() => setActive(-1), [query, places])

    const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault()
            if (options.length) setActive((i) => (e.key === 'ArrowDown' ? (i + 1) % options.length : (i - 1 + options.length) % options.length))
        } else if (e.key === 'Enter') {
            e.preventDefault()
            const option = options[active] ?? (query.trim() ? options[0] : undefined)
            if (option) choose(option)
        } else if (e.key === 'Escape') {
            e.preventDefault()
            close(true)
        }
    }

    const hereName = here?.place?.value
    const shown = value === MY_POSITION && hereName ? `Ma position · ${hereName}` : value
    const loadingPlaces = query.trim().length >= 2 && places === null
    let index = -1

    return (
        <div ref={root} className='@container relative w-full text-left'>
            <div className='flex items-center justify-between gap-2'>
                <label htmlFor={`${id}-trigger`} className='flex min-w-0 items-center gap-1.5 text-base font-medium whitespace-nowrap text-gray-500'>
                    <Icon icon='tabler:map-pin' className='shrink-0 text-base text-secondary' />
                    {label}
                </label>
                <button
                    type='button'
                    onClick={() => locate(true)}
                    disabled={locating}
                    aria-label='Utiliser ma position actuelle'
                    title='Utiliser ma position actuelle'
                    className='-my-1 inline-flex min-h-8 shrink-0 items-center gap-1 rounded-full px-2 py-1 text-sm font-semibold text-primary hover:bg-cream hover:cursor-pointer disabled:opacity-60'>
                    <Icon icon={locating ? 'tabler:loader-2' : 'tabler:current-location'} className={cn('text-lg', locating && 'animate-spin')} />
                    {/* Libellé selon la place disponible dans la barre : complet, court, ou icône seule. */}
                    <span className='hidden @sm:inline'>{locating ? 'Localisation…' : 'Ma position actuelle'}</span>
                    <span className='hidden @[20rem]:inline @sm:hidden'>{locating ? 'Localisation…' : 'Ma position'}</span>
                </button>
            </div>

            {/* Même allure que les autres champs de la barre : texte sur le fond, sans cadre. */}
            <div className='relative mt-1'>
                <button
                    ref={trigger}
                    id={`${id}-trigger`}
                    type='button'
                    aria-haspopup='dialog'
                    aria-expanded={open}
                    onClick={() => (open ? close() : setOpen(true))}
                    className={cn(
                        'flex w-full items-center gap-1.5 py-1 pr-8 text-left text-base outline-hidden hover:cursor-pointer',
                        open && 'text-primary'
                    )}>
                    {value === MY_POSITION && <Icon icon='tabler:current-location' className='shrink-0 text-primary' />}
                    <span className={cn('truncate', value ? 'font-semibold text-ink' : 'text-ink/40')}>{shown || placeholder}</span>
                </button>
                {value && (
                    <button
                        type='button'
                        onClick={() => onChange('')}
                        aria-label={`Effacer ${label}`}
                        className='absolute inset-y-0 right-0 flex items-center px-1 text-gray-400 hover:text-primary hover:cursor-pointer'>
                        <Icon icon='tabler:x' className='text-lg' />
                    </button>
                )}
            </div>
            {locateError && (
                <p className='mt-1 text-xs text-primary' role='alert'>
                    {locateError}
                </p>
            )}

            {open && (
                <div role='dialog' aria-label={label} className='absolute left-0 z-30 mt-2 w-full rounded-2xl bg-white p-3 shadow-xl ring-1 ring-black/5 sm:min-w-80'>
                    <div className='flex items-center gap-2 rounded-xl bg-offwhite px-3 py-2'>
                        <Icon icon='tabler:search' className='shrink-0 text-ink/40' />
                        <input
                            autoFocus
                            type='text'
                            role='combobox'
                            aria-expanded
                            aria-controls={`${id}-list`}
                            aria-autocomplete='list'
                            aria-activedescendant={options[active] ? `${id}-${active}` : undefined}
                            aria-label='Rechercher une ville ou une région'
                            autoComplete='off'
                            enterKeyHint='search'
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder='Rechercher une ville ou une région…'
                            className='w-full bg-transparent text-sm text-ink outline-hidden placeholder:text-ink/40'
                        />
                    </div>

                    <div id={`${id}-list`} role='listbox' aria-label={label} className='mt-1 max-h-80 overflow-auto'>
                        {!query.trim() && (
                            <div role='presentation'>
                                <p className='mt-3 mb-1.5 flex items-center gap-1.5 px-1 text-sm font-semibold text-secondary'>
                                    <Icon icon='tabler:current-location' />
                                    Votre position actuelle
                                </p>
                                <button
                                    type='button'
                                    onClick={() => {
                                        if (here) {
                                            applyHere(here.point)
                                            close(true)
                                        } else locate(false)
                                    }}
                                    disabled={locating}
                                    className='flex min-h-11 w-full items-center gap-3 rounded-xl bg-success/20 px-3 py-2 text-left hover:bg-success/35 hover:cursor-pointer disabled:cursor-wait'>
                                    <Icon icon={locating ? 'tabler:loader-2' : 'tabler:current-location'} className={cn('shrink-0 text-lg text-secondary', locating && 'animate-spin')} />
                                    <span className='flex min-w-0 flex-1 flex-col'>
                                        <span className='truncate font-medium text-ink'>
                                            {locating ? 'Localisation en cours…' : here ? (hereName ?? 'Ma position') : 'Me localiser'}
                                        </span>
                                        {here?.place?.detail && <span className='truncate text-xs text-ink/60'>{here.place.detail}</span>}
                                    </span>
                                    {!locating && (
                                        <span className='shrink-0 rounded-full bg-success/50 px-3 py-0.5 text-xs font-semibold text-secondary'>
                                            {here ? 'Utiliser' : 'Autoriser'}
                                        </span>
                                    )}
                                </button>
                            </div>
                        )}

                        {sections.map((section) => (
                            <div key={section.title || 'libre'} role='group' aria-label={section.title || undefined}>
                                {section.title && <p className='mt-3 mb-1 px-1 text-sm font-semibold text-secondary'>{section.title}</p>}
                                {section.options.map((option) => {
                                    index += 1
                                    const i = index
                                    return (
                                        <div
                                            key={option.key}
                                            id={`${id}-${i}`}
                                            role='option'
                                            aria-selected={i === active}
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => choose(option)}
                                            onMouseEnter={() => setActive(i)}
                                            className={cn(
                                                'flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-ink',
                                                i === active && 'bg-cream text-primary',
                                                !section.title && 'mt-2 border-t border-gray-100 pt-3'
                                            )}>
                                            <Icon icon={option.icon} className='shrink-0 text-lg text-ink/50' />
                                            <span className='flex min-w-0 flex-1 flex-col'>
                                                <span className='truncate'>{option.label}</span>
                                                {option.detail && <span className='truncate text-xs text-ink/60'>{option.detail}</span>}
                                            </span>
                                            {option.hint && <span className='shrink-0 text-xs text-ink/50'>{option.hint}</span>}
                                        </div>
                                    )
                                })}
                            </div>
                        ))}

                        {loadingPlaces && (
                            <p className='flex items-center gap-2 px-3 py-3 text-sm text-ink/60'>
                                <Icon icon='tabler:loader-2' className='animate-spin' />
                                Recherche des lieux…
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default CityPicker
