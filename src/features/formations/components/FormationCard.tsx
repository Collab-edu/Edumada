'use client'
import Image from 'next/image'
import { Icon } from '@iconify/react/dist/iconify.js'
import { Card, CardAction } from '@/components/ui/card'
import type { FormationType } from '../types'

interface FormationCardProps {
    formation: FormationType
    isFavorite: boolean
    onToggleFavorite: () => void
}

export function FormationCard({ formation, isFavorite, onToggleFavorite }: FormationCardProps) {
    return (
        <Card className='flex h-full flex-col overflow-hidden'>
            <div className='relative h-44 overflow-hidden bg-cream'>
                <Image src={formation.imageSrc} alt={formation.title} fill className='object-cover' />
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

            <div className='flex flex-1 flex-col gap-4 p-5'>
                <div className='flex flex-col gap-1'>
                    <h3 className='text-lg font-semibold leading-snug text-secondary group-hover:text-primary duration-300'>
                        {formation.title}
                    </h3>
                    <p className='text-ink/60'>{formation.school}</p>
                </div>
                <ul className='flex flex-col gap-2 text-ink/80'>
                    <li className='flex items-center gap-2'>
                        <Icon icon='tabler:map-pin' className='text-lg text-secondary' />
                        {formation.city}
                    </li>
                    <li className='flex items-center gap-2'>
                        <Icon icon='tabler:school' className='text-lg text-secondary' />
                        {formation.level}
                    </li>
                    <li className='flex items-center gap-2'>
                        <Icon icon='tabler:clock' className='text-lg text-secondary' />
                        {formation.duration}
                    </li>
                </ul>
                <CardAction href='/#courses-section'>Voir la formation</CardAction>
            </div>
        </Card>
    )
}

export default FormationCard
