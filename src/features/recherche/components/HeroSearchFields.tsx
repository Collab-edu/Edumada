'use client'
import { Fragment } from 'react'
import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions, Field } from '@headlessui/react'
import { Icon } from '@/components/ui/icon'
import { useSiteData } from '@/data/site-data'
import { cn } from '@/lib/utils'
import CityPicker from './CityPicker'
import SuggestInput from './SuggestInput'
import { placePosition } from '../places'
import { FILTER_UI, useFilterSuggestions } from '../useFilterSuggestions'

/** Saisie de la recherche rapide (accueil, mobile) : type d'établissement, formation, lieu. */
export type HeroSearch = { categorie: string; formation: string; ville: string; pos: string }

export const EMPTY_HERO_SEARCH: HeroSearch = { categorie: '', formation: '', ville: '', pos: '' }

/**
 * Adresse de la page /recherche : « Quelle formation ? » devient le domaine s'il en est un
 * (« Informatique »), sinon une recherche libre dans les titres (« comptabilité »).
 */
export function heroSearchHref(search: HeroSearch, domains: string[]): string {
    const params = new URLSearchParams()
    if (search.categorie) params.set('categorie', search.categorie)
    const formation = search.formation.trim()
    if (formation) params.set(domains.includes(formation) ? 'domaine' : 'q', formation)
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

/**
 * Les trois champs de la recherche rapide. `fieldClassName` habille chaque champ
 * (cellule de la barre de l'accueil, carte du panneau mobile).
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

    return (
        <>
            <div className={fieldClassName}>
                <KindSelect value={search.categorie} onChange={(categorie) => onChange((prev) => ({ ...prev, categorie }))} />
            </div>
            <div className={fieldClassName}>
                <SuggestInput
                    icon={FILTER_UI.domaine.icon}
                    label='Quelle formation ?'
                    placeholder='Informatique, gestion, comptabilité…'
                    suggestions={suggestions.domaine ?? []}
                    value={search.formation}
                    onChange={(formation) => onChange((prev) => ({ ...prev, formation }))}
                    allowFreeText
                />
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
