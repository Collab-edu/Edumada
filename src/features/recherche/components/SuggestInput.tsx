'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Combobox, ComboboxInput, ComboboxOption, ComboboxOptions, Label } from '@headlessui/react'
import { Icon } from '@/components/ui/icon'
import { MY_POSITION, locateMe } from '../places'

/** Comparaison sans accents ni majuscules : « creche » trouve « Crèche ». */
export const normalize = (text: string) =>
    text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

/**
 * `keywords` : autres mots qui mènent à cette suggestion (« université » → « Enseignement supérieur »).
 * `detail`, `lat`, `lng` : lieu de la carte (« Ambohidratrimo, Analamanga » et sa position).
 */
export type Suggestion = { value: string; hint?: string; keywords?: string[]; detail?: string; lat?: number; lng?: number }

interface SuggestInputProps {
    label: string
    icon?: string
    placeholder: string
    suggestions: Suggestion[]
    /** Valeur choisie ; chaîne vide = pas de filtre. */
    value: string
    /** `place` : lieu de la carte choisi (avec sa position), sinon absent. */
    onChange: (value: string, place?: Suggestion) => void
    /** Accepte un lieu absent des suggestions (« Talatamaty ») : la recherche se fait alors autour de ce lieu. */
    allowFreeText?: boolean
    /** Suggestions supplémentaires chargées à la frappe (lieux de la carte). */
    loadSuggestions?: (query: string) => Promise<Suggestion[]>
    /** Bouton « Autour de moi » : la position de la personne remplace la saisie. */
    locate?: boolean
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

/** Préfixe des valeurs d'options des lieux de la carte (plusieurs lieux peuvent porter le même nom). */
const PLACE = 'lieu:'

/** Met en gras la partie du libellé qui correspond à la saisie. */
function Highlight({ text, query }: { text: string; query: string }) {
    const q = normalize(query)
    const start = q ? normalize(text).indexOf(q) : -1
    if (start < 0) return <>{text}</>
    return (
        <>
            {text.slice(0, start)}
            <strong className='font-bold text-primary'>{text.slice(start, start + q.length)}</strong>
            {text.slice(start + q.length)}
        </>
    )
}

/**
 * Champ de recherche avec suggestions (pas une liste déroulante) : les suggestions n'apparaissent
 * qu'à la saisie, début de mot d'abord ; on choisit au clavier ou au doigt. En quittant le champ,
 * une saisie qui correspond exactement à une suggestion, ou à une seule, est retenue.
 * Vider le champ retire le filtre.
 */
export function SuggestInput({ label, icon, placeholder, suggestions, value, onChange, allowFreeText = false, loadSuggestions, locate = false }: SuggestInputProps) {
    const [query, setQuery] = useState('')
    const [places, setPlaces] = useState<Suggestion[]>([])
    // Un choix fait dans la liste ne doit pas être remplacé par la saisie en cours à la fermeture.
    const picked = useRef(false)
    const [locating, setLocating] = useState(false)
    const [locateError, setLocateError] = useState('')

    const useMyPosition = () => {
        setLocating(true)
        setLocateError('')
        locateMe()
            .then((point) => onChange(MY_POSITION, { value: MY_POSITION, ...point }))
            .catch((error: Error) => setLocateError(error.message))
            .finally(() => setLocating(false))
    }

    // Lieux de la carte : demandés après une courte pause dans la frappe.
    useEffect(() => {
        const q = query.trim()
        if (!loadSuggestions || q.length < 2) {
            setPlaces([])
            return
        }
        let active = true
        const timer = setTimeout(() => {
            loadSuggestions(q).then((found) => active && setPlaces(found))
        }, 250)
        return () => {
            active = false
            clearTimeout(timer)
        }
    }, [query, loadSuggestions])

    // Mot-clé qui correspond à la saisie, quand le libellé lui-même ne correspond pas.
    const keywordFor = (s: Suggestion, q: string) => (normalize(s.value).includes(q) ? undefined : s.keywords?.find((k) => normalize(k).includes(q)))
    const startsWith = (s: Suggestion, q: string) => [s.value, ...(s.keywords ?? [])].some((text) => normalize(text).startsWith(q))

    const filtered = useMemo(() => {
        const q = normalize(query)
        if (!q) return suggestions
        return suggestions
            .filter((s) => normalize(s.value).includes(q) || s.keywords?.some((k) => normalize(k).includes(q)))
            .sort((a, b) => Number(!startsWith(a, q)) - Number(!startsWith(b, q)))
    }, [query, suggestions])

    // Lieux de la carte qui ne doublent pas une ville déjà proposée (celles qui ont des formations).
    const mapPlaces = useMemo(() => places.filter((p) => !suggestions.some((s) => normalize(s.value) === normalize(p.value))), [places, suggestions])

    // Lieu hors liste : proposé en dernier tant qu'aucune suggestion ne lui correspond exactement.
    const exactPlace = mapPlaces.find((p) => normalize(p.value) === normalize(query))
    const freeTextOption =
        allowFreeText && query.trim().length >= 2 && !exactPlace && !suggestions.some((s) => normalize(s.value) === normalize(query))
            ? capitalize(query.trim())
            : null

    // Saisie non choisie dans la liste : retenue si elle désigne sans ambiguïté une suggestion.
    const settle = () => {
        if (picked.current) {
            picked.current = false
            setQuery('')
            return
        }
        const q = normalize(query)
        if (q) {
            const match =
                suggestions.find((s) => normalize(s.value) === q || s.keywords?.some((k) => normalize(k) === q)) ??
                (filtered.length === 1 && mapPlaces.length === 0 ? filtered[0] : undefined)
            if (match) onChange(match.value)
            else if (exactPlace) onChange(exactPlace.value, exactPlace)
            else if (allowFreeText) onChange(capitalize(query.trim()))
        }
        setQuery('')
    }

    return (
        <Combobox
            value={value || null}
            onChange={(selected: string | null) => {
                picked.current = true
                if (selected?.startsWith(PLACE)) {
                    const place = mapPlaces[Number(selected.slice(PLACE.length))]
                    if (place) onChange(place.value, place)
                } else onChange(selected ?? '')
                setQuery('')
            }}
            onClose={settle}>
            <div className='w-full'>
                <div className='flex items-center justify-between gap-2'>
                    <Label className='flex items-center gap-1.5 text-base font-medium text-gray-500'>
                        {icon && <Icon icon={icon} className='text-base text-secondary' />}
                        {label}
                    </Label>
                    {locate && (
                        <button
                            type='button'
                            onClick={useMyPosition}
                            disabled={locating}
                            className='inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold text-primary hover:bg-cream hover:cursor-pointer disabled:opacity-60'>
                            <Icon icon={locating ? 'tabler:loader-2' : 'tabler:current-location'} className={locating ? 'animate-spin' : ''} />
                            {locating ? 'Localisation…' : 'Autour de moi'}
                        </button>
                    )}
                </div>
                <div className='relative mt-1'>
                    <ComboboxInput
                        displayValue={(selected: string | null) => (selected?.startsWith(PLACE) ? '' : (selected ?? ''))}
                        onChange={(e) => {
                            setQuery(e.target.value)
                            // Effacer complètement la saisie retire le filtre.
                            if (e.target.value === '') onChange('')
                        }}
                        placeholder={placeholder}
                        autoComplete='off'
                        enterKeyHint='search'
                        className='w-full truncate bg-transparent py-1 pr-8 text-base font-semibold text-ink outline-hidden placeholder:font-normal placeholder:text-ink/40'
                    />
                    {value && (
                        <button
                            type='button'
                            onClick={() => onChange('')}
                            aria-label={`Effacer ${label}`}
                            className='absolute inset-y-0 right-0 flex items-center px-1 text-gray-400 hover:text-primary hover:cursor-pointer'>
                            <Icon icon='tabler:x' className='text-lg' />
                        </button>
                    )}
                    {locateError && <p className='mt-1 text-xs text-primary' role='alert'>{locateError}</p>}
                    {query.trim() !== '' && (
                        <ComboboxOptions className='absolute left-0 z-20 mt-2 max-h-80 w-full min-w-80 overflow-auto rounded-xl bg-white py-1 text-left text-base shadow-lg ring-1 ring-black/5 empty:invisible'>
                            {filtered.length === 0 && mapPlaces.length === 0 && !freeTextOption && (
                                <div className='px-4 py-3 text-sm text-ink/60'>Aucune suggestion pour « {query} »</div>
                            )}
                            {filtered.map((s) => (
                                <ComboboxOption
                                    key={s.value}
                                    value={s.value}
                                    className='flex min-h-11 cursor-pointer items-center justify-between gap-3 px-4 py-2 text-ink data-[focus]:bg-cream data-[focus]:text-primary data-[selected]:font-semibold'>
                                    <span className='flex min-w-0 flex-col'>
                                        <span className='truncate'>
                                            <Highlight text={s.value} query={query} />
                                        </span>
                                        {keywordFor(s, normalize(query)) && (
                                            <span className='truncate text-xs font-normal text-ink/60'>
                                                <Highlight text={keywordFor(s, normalize(query)) ?? ''} query={query} />
                                            </span>
                                        )}
                                    </span>
                                    {s.hint && <span className='shrink-0 text-xs text-ink/50'>{s.hint}</span>}
                                </ComboboxOption>
                            ))}
                            {mapPlaces.length > 0 && (
                                <div className='px-4 pt-2 pb-1 text-[11px] font-bold tracking-wider text-ink/50 uppercase'>Lieux sur la carte</div>
                            )}
                            {mapPlaces.map((p, i) => (
                                <ComboboxOption
                                    key={`${p.value}-${p.lat}-${p.lng}`}
                                    value={`${PLACE}${i}`}
                                    className='flex min-h-11 cursor-pointer items-center gap-3 px-4 py-2 text-ink data-[focus]:bg-cream data-[focus]:text-primary'>
                                    <Icon icon='tabler:map-pin' className='shrink-0 text-secondary' />
                                    <span className='flex min-w-0 flex-col'>
                                        <span className='truncate'>
                                            <Highlight text={p.value} query={query} />
                                        </span>
                                        <span className='truncate text-xs font-normal text-ink/60'>{[p.hint, p.detail].filter(Boolean).join(' · ')}</span>
                                    </span>
                                </ComboboxOption>
                            ))}
                            {freeTextOption && (
                                <ComboboxOption
                                    value={freeTextOption}
                                    className='flex min-h-11 cursor-pointer items-center gap-2 px-4 py-2 text-ink data-[focus]:bg-cream data-[focus]:text-primary'>
                                    <Icon icon='tabler:current-location' className='shrink-0 text-primary' />
                                    <span className='truncate'>
                                        Chercher autour de « <strong>{freeTextOption}</strong> »
                                    </span>
                                </ComboboxOption>
                            )}
                        </ComboboxOptions>
                    )}
                </div>
            </div>
        </Combobox>
    )
}

export default SuggestInput
