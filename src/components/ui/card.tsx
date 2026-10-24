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
