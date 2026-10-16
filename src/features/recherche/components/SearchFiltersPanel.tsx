'use client'
import { useState, type ReactNode } from 'react'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import {
    ADMISSION_LEVELS,
    BAC_SERIES,
    BUDGET_RANGES,
    CHILD_AGES,
    DIPLOMAS,
    DURATIONS,
    HOUSING_OPTIONS,
    LANGUAGES,
    MODALITIES,
    REGISTRATION_OPTIONS,
    SCHOLARSHIP_OPTIONS,
    type SearchFilters,
} from '../filters'

type ListKey = 'budgets' | 'durations' | 'modalities' | 'diplomas' | 'languages' | 'bacSeries' | 'housing' | 'scholarships'

interface SearchFiltersPanelProps {
    filters: SearchFilters
    onChange: (filters: SearchFilters) => void
}

/** Groupe de filtres repliable, ouvert par défaut. */
function FilterGroup({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen)
    return (
        <div className='border-b border-gray-100 py-4 last:border-b-0'>
            <button
                type='button'
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                className='flex min-h-11 w-full items-center justify-between font-semibold text-secondary hover:cursor-pointer'>
                {title}
                <Icon icon='tabler:chevron-down' className={cn('text-lg transition-transform duration-200', open && 'rotate-180')} />
            </button>
            {open && <div className='mt-1 flex flex-col gap-0.5'>{children}</div>}
        </div>
    )
}

function Choice({ type, name, label, checked, onChange }: {
    type: 'checkbox' | 'radio'
    name: string
    label: string
    checked: boolean
    onChange: () => void
}) {
    return (
        <label className='flex min-h-10 items-center gap-3 text-ink/80 hover:text-secondary hover:cursor-pointer'>
            <input type={type} name={name} checked={checked} onChange={onChange} className='h-5 w-5 accent-primary hover:cursor-pointer' />
            {label}
        </label>
    )
}

/** Panneau latéral des filtres avancés de la page de résultats. */
export function SearchFiltersPanel({ filters, onChange }: SearchFiltersPanelProps) {
    const [showMore, setShowMore] = useState(false)

    const toggle = (key: ListKey, value: string) => {
        const current = filters[key]
        onChange({ ...filters, [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] })
    }

    const checkboxes = (key: ListKey, options: readonly string[]) =>
        options.map((option) => (
            <Choice
                key={option}
                type='checkbox'
                name={key}
                label={option}
                checked={filters[key].includes(option)}
                onChange={() => toggle(key, option)}
            />
        ))

    return (
        <div>
            {/* Priorité élevée : toujours visibles */}
            <FilterGroup title='Budget annuel'>{checkboxes('budgets', BUDGET_RANGES.map((r) => r.label))}</FilterGroup>
            <FilterGroup title="Âge de l'enfant">
                <label className='flex flex-col gap-1.5 text-sm text-ink/70'>
                    Pour une crèche, une école ou un accompagnement
                    <select
                        value={filters.childAge}
                        onChange={(e) => onChange({ ...filters, childAge: e.target.value })}
                        className='min-h-11 rounded-lg border border-gray-200 bg-white px-3 text-base text-ink outline-hidden focus:border-primary hover:cursor-pointer'>
                        {CHILD_AGES.map((age) => (
                            <option key={age.value} value={age.value}>
                                {age.label}
                            </option>
                        ))}
                    </select>
                </label>
            </FilterGroup>
            <FilterGroup title='Durée'>{checkboxes('durations', DURATIONS)}</FilterGroup>
            <FilterGroup title='Modalité'>{checkboxes('modalities', MODALITIES)}</FilterGroup>
            <FilterGroup title='Diplôme préparé'>{checkboxes('diplomas', DIPLOMAS)}</FilterGroup>
            <FilterGroup title='Inscriptions'>
                {REGISTRATION_OPTIONS.map((option) => (
                    <Choice
                        key={option}
                        type='radio'
                        name='registration'
                        label={option}
                        checked={filters.registration === option}
                        onChange={() => onChange({ ...filters, registration: option })}
                    />
                ))}
            </FilterGroup>

            {/* Priorité moyenne et faible : derrière « Plus de filtres » */}
            <button
                type='button'
                onClick={() => setShowMore(!showMore)}
                aria-expanded={showMore}
                className='mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-secondary/20 py-2.5 font-semibold text-secondary transition-colors duration-300 hover:bg-secondary/5 hover:cursor-pointer'>
                <Icon icon={showMore ? 'tabler:minus' : 'tabler:adjustments-horizontal'} className='text-lg' />
                {showMore ? 'Moins de filtres' : 'Plus de filtres'}
            </button>

            {showMore && (
                <div className='mt-2'>
                    <FilterGroup title='Établissement'>
                        <div className='relative'>
                            <Icon icon='tabler:search' className='absolute left-3 top-1/2 -translate-y-1/2 text-ink/40' />
                            <input
                                type='search'
                                value={filters.school}
                                onChange={(e) => onChange({ ...filters, school: e.target.value })}
                                placeholder="Nom de l'établissement"
                                aria-label="Rechercher un établissement par son nom"
                                className='w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-ink outline-hidden focus:border-primary'
                            />
                        </div>
                    </FilterGroup>
                    <FilterGroup title="Langue d'enseignement">{checkboxes('languages', LANGUAGES)}</FilterGroup>
                    <FilterGroup title="Conditions d'admission">
                        <label className='flex flex-col gap-1.5 text-sm text-ink/70'>
                            Mon niveau actuel
                            <select
                                value={filters.admissionLevel}
                                onChange={(e) => onChange({ ...filters, admissionLevel: e.target.value })}
                                className='rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-base text-ink outline-hidden focus:border-primary hover:cursor-pointer'>
                                {ADMISSION_LEVELS.map((level) => (
                                    <option key={level}>{level}</option>
                                ))}
                            </select>
                        </label>
                        <p className='mt-1 text-sm text-ink/70'>Série du BAC</p>
                        <div className='flex flex-wrap gap-2'>
                            {BAC_SERIES.map((serie) => {
                                const active = filters.bacSeries.includes(serie)
                                return (
                                    <button
                                        key={serie}
                                        type='button'
                                        onClick={() => toggle('bacSeries', serie)}
                                        aria-pressed={active}
                                        className={cn(
                                            'rounded-full border px-3 py-1 text-sm font-medium transition-colors duration-200 hover:cursor-pointer',
                                            active ? 'border-primary bg-primary text-white' : 'border-gray-200 text-ink/80 hover:border-primary'
                                        )}>
                                        {serie}
                                    </button>
                                )
                            })}
                        </div>
                    </FilterGroup>
                    <FilterGroup title='Hébergement' defaultOpen={false}>{checkboxes('housing', HOUSING_OPTIONS)}</FilterGroup>
                    <FilterGroup title='Bourses' defaultOpen={false}>{checkboxes('scholarships', SCHOLARSHIP_OPTIONS)}</FilterGroup>
                </div>
            )}
        </div>
    )
}

export default SearchFiltersPanel
