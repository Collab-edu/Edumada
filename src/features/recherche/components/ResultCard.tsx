'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { OFFER_CTA, formatFees, offerFacts } from '@/features/formations/format'
import type { FormationType, RegistrationStatus } from '@/features/formations/types'

const REGISTRATION_BADGE: Record<RegistrationStatus, { label: string; className: string }> = {
    Ouvertes: { label: 'Inscriptions ouvertes', className: 'bg-success/30 text-secondary' },
    'À venir': { label: 'Inscriptions à venir', className: 'bg-cream text-primary' },
    Fermées: { label: 'Inscriptions fermées', className: 'bg-gray-100 text-ink/60' },
}

interface ResultCardProps {
    formation: FormationType
    isFavorite: boolean
    onToggleFavorite: () => void
}

/** Carte d'un résultat de recherche, affichée dans une grille de deux colonnes. */
export function ResultCard({ formation, isFavorite, onToggleFavorite }: ResultCardProps) {
    const badge = REGISTRATION_BADGE[formation.registration]
    const fees = formatFees(formation.fees)

    return (
        <Card id={formation.id} className='flex h-full flex-col overflow-hidden scroll-mt-28'>
            <div className='relative h-44 shrink-0 bg-cream'>
                <Image src={formation.imageSrc} alt={formation.title} fill className='object-cover' />
                <span className='absolute top-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-secondary backdrop-blur-sm'>
                    {formation.schoolType}
                </span>
            </div>

            <div className='flex flex-1 flex-col gap-4 p-5'>
                <div className='flex items-start justify-between gap-4'>
                    <div className='flex flex-col gap-1'>
                        <span className={cn('w-fit rounded-full px-3 py-1 text-xs font-semibold', badge.className)}>
                            {badge.label}
                        </span>
                        <h3 className='mt-1 text-lg font-semibold leading-snug text-secondary group-hover:text-primary duration-300'>
                            {formation.title}
                        </h3>
                        <p className='flex flex-wrap items-center gap-x-3 gap-y-1 text-ink/70'>
                            <Link
                                href={`/etablissements/${formation.schoolId}`}
                                className='inline-flex items-center gap-1.5 hover:text-primary hover:underline'>
                                <Icon icon='tabler:building-community' className='text-secondary' />
                                {formation.school}
                            </Link>
                            <span className='inline-flex items-center gap-1.5'>
                                <Icon icon='tabler:map-pin' className='text-secondary' />
                                {formation.city}
                            </span>
                        </p>
                    </div>
                    <button
                        type='button'
                        onClick={onToggleFavorite}
                        aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        aria-pressed={isFavorite}
                        className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-100 transition-colors duration-300 hover:bg-cream hover:cursor-pointer'>
                        <Icon
                            icon={isFavorite ? 'tabler:heart-filled' : 'tabler:heart'}
                            className={cn('text-xl', isFavorite ? 'text-primary' : 'text-secondary')}
                        />
                    </button>
                </div>

                <ul className='grid grid-cols-2 gap-3 text-sm text-ink/80'>
                    {offerFacts(formation).map((fact) => (
                        <li key={fact.label} className='flex items-center gap-2'>
                            <Icon icon={fact.icon} className='text-lg text-secondary shrink-0' />
                            {fact.label}
                        </li>
                    ))}
                    <li className='flex items-center gap-2'>
                        <Icon icon='tabler:device-laptop' className='text-lg text-secondary shrink-0' />
                        {formation.modality}
                    </li>
                    <li className='flex items-center gap-2'>
                        <Icon icon='tabler:language' className='text-lg text-secondary shrink-0' />
                        {formation.languages.join(', ')}
                    </li>
                </ul>

                <div className='mt-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-gray-100 pt-4'>
                    <div>
                        {fees ? (
                            <p className='font-bold text-secondary'>
                                {fees} <span className='font-normal text-ink/60'>/ {formation.feesPeriod}</span>
                            </p>
                        ) : (
                            <p className='text-ink/60'>Frais non renseignés</p>
                        )}
                        {formation.scholarship === 'Bourses disponibles' && (
                            <p className='text-sm text-ink/60'>Bourses disponibles</p>
                        )}
                    </div>
                    <Link
                        href={`/formations/${formation.id}`}
                        className='rounded-lg border border-primary px-5 py-2.5 text-center font-semibold text-primary transition-colors duration-300 hover:bg-primary hover:text-white'>
                        {OFFER_CTA[formation.kind]}
                    </Link>
                </div>
            </div>
        </Card>
    )
}

export default ResultCard
