import type { ComponentProps } from 'react'
import Link from '@/i18n/client'
import { cn } from '@/lib/utils'

/** Style commun des cartes du site : fond blanc, coins arrondis, effet de survol. */
export const cardClassName =
    'group rounded-2xl bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg'

export function Card({ className, ...props }: ComponentProps<'div'>) {
    return <div className={cn(cardClassName, className)} {...props} />
}

/** Grille de cartes grises animées, affichée pendant le chargement des données. */
export function CardSkeletonGrid({ count, className }: { count: number; className: string }) {
    return (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={cn('rounded-2xl bg-white border border-gray-100 animate-pulse', className)} />
            ))}
        </div>
    )
}

/** Bouton-lien à contour rouge, placé en bas des cartes. */
export function CardAction({ className, ...props }: ComponentProps<typeof Link>) {
    return (
        <Link
            className={cn(
                'mt-auto block w-full rounded-lg border border-primary py-3 text-center font-semibold text-primary transition-colors duration-300 hover:bg-primary hover:text-white',
                className
            )}
            {...props}
        />
    )
}

/** Bas d'une photo de carte en vague, avec un rappel des couleurs de la charte. */
export function CardWave() {
    return (
        <svg viewBox='0 0 400 48' preserveAspectRatio='none' aria-hidden='true' className='absolute -bottom-px left-0 h-10 w-full'>
            <path d='M0 48V34C130 56 270 46 400 8V48Z' className='fill-white' />
            <path d='M400 0C340 22 290 34 230 40C300 38 355 28 400 14Z' className='fill-primary' />
            <path d='M400 14C355 28 300 38 230 40C300 42 360 36 400 24Z' className='fill-secondary' />
        </svg>
    )
}
