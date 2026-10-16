'use client'
import type { ReactNode } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import { cn } from '@/lib/utils'

/** Section de la page formation, avec ancre pour la navigation interne. */
export function DetailSection({ id, title, icon, children }: { id: string; title: string; icon: string; children: ReactNode }) {
    return (
        <section id={id} className='scroll-mt-40 py-0'>
            <h2 className='mb-5 flex items-center gap-3 font-bold'>
                <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                    <Icon icon={icon} className='text-xl' />
                </span>
                {title}
            </h2>
            <div className='flex flex-col gap-6'>{children}</div>
        </section>
    )
}

/** Sous-titre à l'intérieur d'une section. */
export function SubTitle({ children }: { children: ReactNode }) {
    return <h3 className='mb-3 text-lg font-semibold text-secondary'>{children}</h3>
}

/** Une information clé : icône, libellé, valeur. */
export function Fact({ icon, label, children }: { icon: string; label: string; children: ReactNode }) {
    return (
        <div className='flex gap-3 rounded-xl border border-gray-100 bg-white p-4'>
            <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary'>
                <Icon icon={icon} className='text-lg' />
            </span>
            <div className='flex min-w-0 flex-col'>
                <span className='text-sm text-ink/60'>{label}</span>
                <span className='font-medium text-ink'>{children}</span>
            </div>
        </div>
    )
}

/** Liste à puces cochées. */
export function CheckList({ items, className }: { items: string[]; className?: string }) {
    return (
        <ul className={cn('flex flex-col gap-2', className)}>
            {items.map((item) => (
                <li key={item} className='flex items-start gap-2 text-ink/80'>
                    <Icon icon='tabler:circle-check-filled' className='mt-0.5 shrink-0 text-lg text-primary' />
                    {item}
                </li>
            ))}
        </ul>
    )
}

/** Liste de pastilles. */
export function ChipList({ items, tone = 'secondary' }: { items: string[]; tone?: 'secondary' | 'success' }) {
    return (
        <ul className='flex flex-wrap gap-2'>
            {items.map((item) => (
                <li
                    key={item}
                    className={cn(
                        'rounded-full px-3 py-1.5 text-sm font-medium',
                        tone === 'success' ? 'bg-success/30 text-secondary' : 'bg-secondary/10 text-secondary'
                    )}>
                    {item}
                </li>
            ))}
        </ul>
    )
}

/** Bloc encadré gris clair. */
export function Panel({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn('rounded-2xl bg-white border border-gray-100 p-5 shadow-sm', className)}>{children}</div>
}

/** Valeur absente : on l'affiche honnêtement plutôt que d'inventer. */
export const NOT_PROVIDED = 'Non communiqué'
