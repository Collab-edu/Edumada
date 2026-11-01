'use client'
import type { FormEvent, ReactNode } from 'react'
import { Icon } from '@/components/ui/icon'

/** Champ de la barre : séparé du suivant par un trait à partir de la tablette. */
export function SearchPillField({ children }: { children: ReactNode }) {
    return <div className='min-w-0 flex-1 rounded-xl px-3 py-2.5 md:rounded-none md:border-r md:border-gray-200 md:py-1 md:last-of-type:border-r-0'>{children}</div>
}

/** En-tête de liste : titre et nombre de résultats à gauche, barre de recherche à droite. */
export default function SearchPillBar({ title, count, label, onSubmit, children }: { title: string; count: string; label: string; onSubmit: (e: FormEvent) => void; children: ReactNode }) {
    return (
        <div className='mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            <div className='mobile-center shrink-0'>
                <h2 className='text-2xl font-bold text-secondary md:text-3xl'>{title}</h2>
                <p className='min-h-5 text-sm text-ink/70' aria-live='polite'>
                    {count}
                </p>
            </div>
            <form
                role='search'
                aria-label={label}
                onSubmit={onSubmit}
                className='flex w-full flex-col gap-1 rounded-[12px] bg-white p-2 shadow-[0_12px_32px_-16px_rgba(15,76,92,0.35)] ring-1 ring-secondary/10 md:flex-row md:items-center md:pl-4 lg:max-w-2xl'>
                {children}
                <button
                    type='submit'
                    className='flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-6 font-semibold text-white transition-colors duration-300 hover:bg-primary/90 hover:cursor-pointer md:ml-2'>
                    <Icon icon='tabler:search' className='text-lg' />
                    Rechercher
                </button>
            </form>
        </div>
    )
}
