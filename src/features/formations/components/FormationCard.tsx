'use client'
import Image from 'next/image'
import { imageOr } from '@/lib/media'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/icon'
import { Card, CardAction } from '@/components/ui/card'
import { OFFER_CTA, offerFacts } from '../format'
import type { FormationType } from '../types'

interface FormationCardProps {
    formation: FormationType
    isFavorite: boolean
    onToggleFavorite: () => void
    /** Version basse (bandeaux défilants, grilles de 4). */
    compact?: boolean
}

/** Carte d'offre : photo avec le domaine, titre, établissement, infos clés et bouton vers la fiche. */
export function FormationCard({ formation, isFavorite, onToggleFavorite, compact = false }: FormationCardProps) {
    return (
        <Card className='flex h-full flex-col overflow-hidden'>
            <div className={cn('relative overflow-hidden bg-cream', compact ? 'h-40' : 'h-48')}>
                <Image src={imageOr(formation.imageSrc)} alt='' fill className='object-cover transition-transform duration-500 group-hover:scale-105' />
                {formation.domain && (
                    <span className='absolute bottom-3 left-3 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-white'>{formation.domain}</span>
                )}
                <button
                    type='button'
                    onClick={onToggleFavorite}
                    aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    aria-pressed={isFavorite}
                    className='absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-colors duration-300 hover:bg-white hover:cursor-pointer'>
                    <Icon icon={isFavorite ? 'tabler:heart-filled' : 'tabler:heart'} className={cn('text-lg', isFavorite ? 'text-primary' : 'text-secondary')} />
                </button>
            </div>

            <div className='flex flex-1 flex-col gap-3 p-4'>
                <div className='flex flex-col gap-0.5'>
                    <h3 className='text-base font-bold leading-snug text-secondary group-hover:text-primary duration-300'>
                        {formation.title}
                    </h3>
                    <p className='truncate text-sm text-ink/60'>{formation.school}</p>
                </div>
                <ul className='flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-ink/70'>
                    {offerFacts(formation).map((fact) => (
                        <li key={fact.label} className='flex items-center gap-1.5'>
                            <Icon icon={fact.icon} className='shrink-0 text-base text-secondary' />
                            {fact.label}
                        </li>
                    ))}
                    <li className='flex items-center gap-1.5'>
                        <Icon icon='tabler:map-pin' className='shrink-0 text-base text-secondary' />
                        {formation.city}
                    </li>
                </ul>
                <CardAction href={`/formations/${formation.id}`} className='py-2.5 text-sm'>
                    {OFFER_CTA[formation.kind]}
                </CardAction>
            </div>
        </Card>
    )
}

export default FormationCard
