'use client'
import { useMemo, useState } from 'react'
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions, Label } from '@headlessui/react'
import { Icon } from '@iconify/react/dist/iconify.js'

/** Comparaison sans accents ni majuscules : « creche » trouve « Crèche ». */
export const normalize = (text: string) =>
    text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

export type Suggestion = { value: string; hint?: string }

interface SuggestInputProps {
    label: string
    icon?: string
    placeholder: string
    suggestions: Suggestion[]
    /** Valeur choisie ; chaîne vide = pas de filtre. */
    value: string
    onChange: (value: string) => void
}

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
 * Champ de saisie avec suggestions : on tape, la liste se filtre (début de mot d'abord),
 * on choisit au clavier ou au doigt. Vider le champ retire le filtre.
 */
export function SuggestInput({ label, icon, placeholder, suggestions, value, onChange }: SuggestInputProps) {
    const [query, setQuery] = useState('')

    const filtered = useMemo(() => {
        const q = normalize(query)
        if (!q) return suggestions
        return suggestions
            .filter((s) => normalize(s.value).includes(q))
            .sort((a, b) => Number(!normalize(a.value).startsWith(q)) - Number(!normalize(b.value).startsWith(q)))
    }, [query, suggestions])

    return (
        <Combobox
            value={value || null}
            onChange={(selected: string | null) => {
                onChange(selected ?? '')
                setQuery('')
            }}
            onClose={() => setQuery('')}
            immediate>
            <div className='w-full'>
                <Label className='flex items-center gap-1.5 text-base font-medium text-gray-500'>
                    {icon && <Icon icon={icon} className='text-base text-secondary' />}
                    {label}
                </Label>
                <div className='relative mt-1'>
                    <ComboboxInput

                        displayValue={(selected: string | null) => selected ?? ''}
                        onChange={(e) => {
                            setQuery(e.target.value)
                            // Effacer complètement la saisie retire le filtre.
                            if (e.target.value === '') onChange('')
                        }}
                        placeholder={placeholder}
                        autoComplete='off'
                        className='w-full truncate bg-transparent py-1 pr-8 text-base font-semibold text-ink outline-hidden placeholder:font-normal placeholder:text-ink/40'
                    />
                    {value ? (
                        <button
                            type='button'
                            onClick={() => onChange('')}
                            aria-label={`Effacer ${label}`}
                            className='absolute inset-y-0 right-0 flex items-center px-1 text-gray-400 hover:text-primary hover:cursor-pointer'>
                            <Icon icon='tabler:x' className='text-lg' />
                        </button>
                    ) : (
                        <ComboboxButton className='absolute inset-y-0 right-0 flex items-center px-1 text-gray-400 hover:cursor-pointer' aria-label={`Voir les suggestions : ${label}`}>
                            <Icon icon='tabler:chevron-down' className='text-xl' />
                        </ComboboxButton>
                    )}
                    <ComboboxOptions
                        className='absolute left-0 z-20 mt-2 max-h-72 w-full min-w-60 overflow-auto rounded-xl bg-white py-1 text-left text-base shadow-lg ring-1 ring-black/5 empty:invisible'>
                        {filtered.length === 0 ? (
                            <div className='px-4 py-3 text-sm text-ink/60'>Aucune suggestion pour « {query} »</div>
                        ) : (
                            filtered.map((s) => (
                                <ComboboxOption
                                    key={s.value}
                                    value={s.value}
                                    className='flex min-h-11 cursor-pointer items-center justify-between gap-3 px-4 py-2 text-ink data-[focus]:bg-cream data-[focus]:text-primary data-[selected]:font-semibold'>
                                    <span className='truncate'>
                                        <Highlight text={s.value} query={query} />
                                    </span>
                                    {s.hint && <span className='shrink-0 text-xs text-ink/50'>{s.hint}</span>}
                                </ComboboxOption>
                            ))
                        )}
                    </ComboboxOptions>
                </div>
            </div>
        </Combobox>
    )
}

export default SuggestInput
