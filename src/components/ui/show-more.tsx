'use client'
import { useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/ui/icon'

/** Nombre de cartes affichées au départ, puis à chaque clic : rangées complètes sur 4, 2 ou 1 colonne. */
export const SHOW_MORE_STEP = 12

/**
 * Liste affichée par tranches (« Voir plus ») : `resetKey` change avec les filtres et ramène
 * la liste à la première tranche. Après un clic, le focus va sur la première nouvelle carte
 * (premier lien de l'élément de `listRef`), pour la navigation au clavier.
 */
export function useShowMore<T>(items: T[], resetKey: string, step = SHOW_MORE_STEP) {
    const [state, setState] = useState({ key: resetKey, count: step })
    const listRef = useRef<HTMLDivElement>(null)
    const focusFrom = useRef<number | null>(null)

    // Nouveaux filtres : on repart de la première tranche.
    const count = state.key === resetKey ? state.count : step
    if (state.key !== resetKey) setState({ key: resetKey, count: step })

    useEffect(() => {
        if (focusFrom.current === null) return
        const card = listRef.current?.children[focusFrom.current]
        focusFrom.current = null
        card?.querySelector<HTMLElement>('a[href]')?.focus()
    }, [count])

    return {
        visible: items.slice(0, count),
        listRef,
        showMore: () => {
            focusFrom.current = count
            setState({ key: resetKey, count: count + step })
        },
        shown: Math.min(count, items.length),
        total: items.length,
        hasMore: items.length > count,
        step,
    }
}

/** Nom des éléments de la liste : singulier, pluriel, et genre (accord de « affiché »). */
export type ListNoun = { one: string; many: string; feminine?: boolean }

/** Compteur et bouton « Voir plus » sous la liste ; rien quand tout est affiché. */
export function ShowMoreButton({ shown, total, hasMore, step, onClick, noun }: { shown: number; total: number; hasMore: boolean; step: number; onClick: () => void; noun: ListNoun }) {
    if (!hasMore) return null
    const next = Math.min(step, total - shown)
    return (
        <div className='mt-8 flex flex-col items-center gap-3'>
            <p className='text-sm text-ink/60'>
                {shown} {noun.many} affiché{noun.feminine ? 'es' : 's'} sur {total}
            </p>
            <div className='h-1 w-48 overflow-hidden rounded-full bg-secondary/10' aria-hidden='true'>
                <div className='h-full rounded-full bg-primary' style={{ width: `${(shown / total) * 100}%` }} />
            </div>
            <button
                type='button'
                onClick={onClick}
                className='inline-flex min-h-11 items-center gap-2 rounded-lg border border-primary px-6 py-3 font-semibold text-primary transition-colors duration-300 hover:bg-primary hover:text-white hover:cursor-pointer'>
                <Icon icon='tabler:chevron-down' className='text-lg' />
                Voir {next} {next > 1 ? noun.many : noun.one} de plus
            </button>
        </div>
    )
}
