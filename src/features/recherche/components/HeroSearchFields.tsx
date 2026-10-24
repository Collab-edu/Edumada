'use client'
import { Fragment, useMemo } from 'react'
import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions, Field } from '@headlessui/react'
import { Icon } from '@/components/ui/icon'
import { useSiteData } from '@/data/site-data'
import { cn } from '@/lib/utils'
import type { CategoryType } from '@/features/categories/types'
import CityPicker from './CityPicker'
import SuggestInput from './SuggestInput'
import { placePosition } from '../places'
import { CHILD_AGES } from '../filters'
import { FILTER_UI, useFilterSuggestions } from '../useFilterSuggestions'

/**
 * Saisie de la recherche rapide (accueil, mobile) : type d'établissement, puis selon ce type
 * la formation, le niveau scolaire ou l'âge de l'enfant, et le lieu.
 */
export type HeroSearch = { categorie: string; formation: string; age: string; ville: string; pos: string }

export const EMPTY_HERO_SEARCH: HeroSearch = { categorie: '', formation: '', age: '', ville: '', pos: '' }

/** Âges proposés pour la petite enfance (crèche, maternelle…). */
const EARLY_AGES = CHILD_AGES.filter((a) => a.value && Number(a.value) <= 6)

/** Deuxième champ selon la catégorie : âge (petite enfance), niveau (scolaire) ou formation (le reste). */
type SecondField = 'formation' | 'niveau' | 'age'

/** Catégorie d'un choix du premier champ : la catégorie elle-même ou celle de la sous-catégorie. */
const categoryOf = (categories: CategoryType[], value: string) =>
    value ? categories.find((c) => c.shortLabel === value || c.subCategories.includes(value)) : undefined

/** Crèche, garderie, maternelle : selon l'âge ; écoles : selon le niveau ; le reste : selon la formation. */
const SECOND_FIELD: Record<string, SecondField> = { 'petite-enfance': 'age', scolaire: 'niveau' }

const secondFieldFor = (category: CategoryType | undefined): SecondField => (category && SECOND_FIELD[category.id]) || 'formation'

/**
 * Adresse de la page /recherche : « Quelle formation ? » devient le domaine s'il en est un
 * (« Informatique »), sinon une recherche libre dans les titres (« comptabilité », « Collège »).
 */
export function heroSearchHref(search: HeroSearch, domains: string[]): string {
    const params = new URLSearchParams()
    if (search.categorie) params.set('categorie', search.categorie)
    const formation = search.formation.trim()
    if (formation) params.set(domains.includes(formation) ? 'domaine' : 'q', formation)
    if (search.age) params.set('age', search.age)
    if (search.ville) {
        params.set('ville', search.ville)
        if (search.pos) params.set('pos', search.pos)
    }
    const query = params.toString()
    return query ? `/recherche?${query}` : '/recherche'
}

/** « Que recherchez-vous ? » : liste déroulante des catégories et de leurs sous-catégories. */
function KindSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
    const { data: categories } = useSiteData('CategoryData')
    const { suggestions } = useFilterSuggestions()
    // Sous-catégories qui ont des offres (avec leur nombre), comme dans les autres barres.
    const offered = new Map((suggestions.categorie ?? []).map((s) => [s.value, s.hint]))
    const groups = categories
        .map((category) => ({ category, subs: category.subCategories.filter((sub) => offered.has(sub)) }))
        .filter((group) => group.subs.length > 0)

    return (
        <Field className='w-full text-left'>
            <Listbox value={value} onChange={onChange}>
                <Label className='flex items-center gap-1.5 text-base font-medium text-gray-500'>
                    <Icon icon={FILTER_UI.categorie.icon} className='text-base text-secondary' />
                    Que recherchez-vous ?
                </Label>
                <ListboxButton className='group mt-1 flex w-full items-center justify-between gap-2 py-1 text-left text-base outline-hidden hover:cursor-pointer'>
                    <span className={cn('truncate', value ? 'font-semibold text-ink' : 'text-ink/40')}>{value || 'École, université, formation pro…'}</span>
                    <Icon icon='tabler:chevron-down' className='shrink-0 text-lg text-ink/40 transition-transform group-data-[open]:rotate-180' />
                </ListboxButton>
                <ListboxOptions
                    anchor={{ to: 'bottom start', gap: 12 }}
                    className='z-50 max-h-80 w-[var(--button-width)] min-w-72 overflow-auto rounded-2xl bg-white p-2 text-base shadow-xl ring-1 ring-black/5 focus:outline-hidden'>
                    <ListboxOption value='' className='flex min-h-11 cursor-pointer items-center rounded-lg px-3 py-2 text-ink/70 data-[focus]:bg-cream data-[focus]:text-primary'>
                        Tous les établissements
                    </ListboxOption>
                    {groups.map(({ category, subs }) => (
                        <Fragment key={category.id}>
                            {/* La catégorie entière, puis ses sous-catégories */}
                            <ListboxOption
                                value={category.shortLabel}
                                className='mt-1 flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 py-2 font-semibold text-secondary data-[focus]:bg-cream data-[focus]:text-primary data-[selected]:text-primary'>
                                <Icon icon={category.icon} className='shrink-0 text-lg' />
                                {category.shortLabel}
                            </ListboxOption>
                            {subs.map((sub) => (
                                <ListboxOption
                                    key={sub}
                                    value={sub}
                                    className='flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg py-2 pr-3 pl-10 text-ink data-[focus]:bg-cream data-[focus]:text-primary data-[selected]:font-semibold'>
                                    <span className='truncate'>{sub}</span>
                                    <span className='shrink-0 text-xs text-ink/50'>{offered.get(sub)}</span>
                                </ListboxOption>
                            ))}
                        </Fragment>
                    ))}
                </ListboxOptions>
            </Listbox>
        </Field>
    )
}

/** « Âge de l'enfant » (petite enfance) : liste déroulante. */
function AgeSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) {
    const label = EARLY_AGES.find((a) => a.value === value)?.label
    return (
        <Field className='w-full text-left'>
            <Listbox value={value} onChange={onChange}>
                <Label className='flex items-center gap-1.5 text-base font-medium text-gray-500'>
                    <Icon icon='tabler:mood-kid' className='text-base text-secondary' />
                    Âge de l&apos;enfant ?
                </Label>
                <ListboxButton className='group mt-1 flex w-full items-center justify-between gap-2 py-1 text-left text-base outline-hidden hover:cursor-pointer'>
                    <span className={cn('truncate', label ? 'font-semibold text-ink' : 'text-ink/40')}>{label ?? 'Moins d’un an, 2 ans, 4 ans…'}</span>
                    <Icon icon='tabler:chevron-down' className='shrink-0 text-lg text-ink/40 transition-transform group-data-[open]:rotate-180' />
                </ListboxButton>
                <ListboxOptions
                    anchor={{ to: 'bottom start', gap: 12 }}
                    className='z-50 max-h-80 w-[var(--button-width)] min-w-56 overflow-auto rounded-2xl bg-white p-2 text-base shadow-xl ring-1 ring-black/5 focus:outline-hidden'>
                    <ListboxOption value='' className='flex min-h-11 cursor-pointer items-center rounded-lg px-3 py-2 text-ink/70 data-[focus]:bg-cream data-[focus]:text-primary'>
                        Tous les âges
                    </ListboxOption>
                    {EARLY_AGES.map((age) => (
                        <ListboxOption
                            key={age.value}
                            value={age.value}
                            className='flex min-h-11 cursor-pointer items-center rounded-lg px-3 py-2 text-ink data-[focus]:bg-cream data-[focus]:text-primary data-[selected]:font-semibold'>
                            {age.label}
                        </ListboxOption>
                    ))}
                </ListboxOptions>
            </Listbox>
        </Field>
    )
}

const plural = (n: number) => `${n} offre${n > 1 ? 's' : ''}`

/**
 * Les trois champs de la recherche rapide. Le deuxième suit le premier : une crèche demande
 * l'âge de l'enfant, une école le niveau, le reste la formation (seulement les domaines que ce
 * type d'établissement propose). `fieldClassName` habille chaque champ.
 */
export default function HeroSearchFields({
    search,
    onChange,
    fieldClassName,
}: {
    search: HeroSearch
    onChange: (update: (prev: HeroSearch) => HeroSearch) => void
    fieldClassName: string
}) {
    const { suggestions } = useFilterSuggestions()
    const { data: categories } = useSiteData('CategoryData')
    const { data: formations } = useSiteData('FormationData')
    const { data: schools } = useSiteData('SchoolData')

    const category = categoryOf(categories, search.categorie)
    const second = secondFieldFor(category)

    // Offres du type choisi (catégorie entière, ou sous-catégorie de l'établissement).
    const scoped = useMemo(() => {
        if (!category) return formations
        const isSub = category.shortLabel !== search.categorie
        const subOf = new Map(schools.map((s) => [s.id, s.subCategory]))
        return formations.filter((f) => f.category === category.id && (!isSub || subOf.get(f.schoolId) === search.categorie))
    }, [category, search.categorie, formations, schools])

    // Suggestions du deuxième champ : domaines (formation) ou intitulés des niveaux (scolaire), avec leur nombre d'offres.
    const secondSuggestions = useMemo(() => {
        if (!category) return suggestions.domaine ?? []
        const values = scoped.map((f) => (second === 'niveau' ? f.title : f.domain)).filter(Boolean)
        return [...new Set(values)]
            .sort((a, b) => a.localeCompare(b, 'fr'))
            .map((value) => ({ value, hint: plural(values.filter((v) => v === value).length) }))
    }, [category, scoped, second, suggestions.domaine])

    return (
        <>
            <div className={fieldClassName}>
                {/* Changer de type vide le deuxième champ : ses valeurs ne valent que pour l'ancien type. */}
                <KindSelect value={search.categorie} onChange={(categorie) => onChange((prev) => ({ ...prev, categorie, formation: '', age: '' }))} />
            </div>
            <div className={fieldClassName}>
                {second === 'age' ? (
                    <AgeSelect value={search.age} onChange={(age) => onChange((prev) => ({ ...prev, age }))} />
                ) : (
                    <SuggestInput
                        key={second}
                        icon={second === 'niveau' ? 'tabler:school' : FILTER_UI.domaine.icon}
                        label={second === 'niveau' ? 'Quel niveau ?' : 'Quelle formation ?'}
                        placeholder={second === 'niveau' ? 'Primaire, collège, lycée…' : 'Informatique, gestion, comptabilité…'}
                        suggestions={secondSuggestions}
                        value={search.formation}
                        onChange={(formation) => onChange((prev) => ({ ...prev, formation }))}
                        allowFreeText
                    />
                )}
            </div>
            <div className={fieldClassName}>
                <CityPicker
                    label='Où ?'
                    placeholder='Antananarivo, Toamasina, Mahajanga…'
                    suggestions={suggestions.ville ?? []}
                    value={search.ville}
                    onChange={(ville, place) => onChange((prev) => ({ ...prev, ville, pos: placePosition(place) }))}
                />
            </div>
        </>
    )
}
