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
    /** Version basse et large (bandeau défilant de l'accueil). */
    compact?: boolean
}

export function FormationCard({ formation, isFavorite, onToggleFavorite, compact = false }: FormationCardProps) {
    return (
        <Card className='flex h-full flex-col overflow-hidden'>
            <div className={cn('relative overflow-hidden bg-cream', compact ? 'h-32' : 'h-44')}>
                <Image src={imageOr(formation.imageSrc)} alt={formation.title} fill className='object-cover' />
                <button
                    type='button'
                    onClick={onToggleFavorite}
                    aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    aria-pressed={isFavorite}
                    className='absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-colors duration-300 hover:bg-white hover:cursor-pointer'>
                    <Icon
                        icon={isFavorite ? 'tabler:heart-filled' : 'tabler:heart'}
                        className={`text-xl ${isFavorite ? 'text-primary' : 'text-secondary'}`}
                    />
                </button>
            </div>

            <div className={cn('flex flex-1 flex-col', compact ? 'gap-3 px-5 py-4' : 'gap-4 p-5')}>
                <div className='flex flex-col gap-1'>
                    <h3 className='text-lg font-semibold leading-snug text-secondary group-hover:text-primary duration-300'>
                        {formation.title}
                    </h3>
                    <p className='text-ink/60'>{formation.school}</p>
                </div>
                <ul className={cn('text-ink/80', compact ? 'grid grid-cols-2 gap-x-3 gap-y-1.5' : 'flex flex-col gap-2')}>
                    <li className='flex items-center gap-2'>
                        <Icon icon='tabler:map-pin' className='shrink-0 text-lg text-secondary' />
                        {formation.city}
                    </li>
                    {offerFacts(formation).map((fact) => (
                        <li key={fact.label} className='flex items-center gap-2'>
                            <Icon icon={fact.icon} className='shrink-0 text-lg text-secondary' />
                            {fact.label}
                        </li>
                    ))}
                </ul>
                <CardAction href={`/formations/${formation.id}`}>{OFFER_CTA[formation.kind]}</CardAction>
            </div>
        </Card>
    )
}

export default FormationCard
