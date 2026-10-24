'use client'
import Image from 'next/image'
import { imageOr } from '@/lib/media'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/icon'
import { Card, CardAction } from '@/components/ui/card'
import { OFFER_CTA, offerFacts } from '../format'
import type { FormationType } from '../types'
import SchoolLogo from '@/features/etablissements/components/SchoolLogo'
import CategoryTag from '@/features/categories/components/CategoryTag'
import { useT } from '@/i18n/client'

interface FormationCardProps {
    formation: FormationType
    isFavorite: boolean
    onToggleFavorite: () => void
    /** Version basse (bandeaux défilants, grilles de 4). */
    compact?: boolean
}

/** Carte d'offre : photo avec le type d'établissement, titre, établissement, infos clés et bouton vers la fiche. */
export function FormationCard({ formation, isFavorite, onToggleFavorite, compact = false }: FormationCardProps) {
    const t = useT()
    return (
        <Card className='flex h-full flex-col overflow-hidden'>
            <div className={cn('relative overflow-hidden bg-cream', compact ? 'h-40' : 'h-48')}>
                <Image src={imageOr(formation.imageSrc)} alt='' fill className='object-cover transition-transform duration-500 group-hover:scale-105' />
                <CategoryTag categoryId={formation.category} schoolId={formation.schoolId} />
                <button
                    type='button'
                    onClick={onToggleFavorite}
                    aria-label={isFavorite ? t('Retirer des favoris') : t('Ajouter aux favoris')}
                    aria-pressed={isFavorite}
                    className='absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-colors duration-300 hover:bg-white hover:cursor-pointer'>
                    <Icon icon={isFavorite ? 'tabler:heart-filled' : 'tabler:heart'} className={cn('text-lg', isFavorite ? 'text-primary' : 'text-secondary')} />
                </button>
            </div>

            <div className='relative flex flex-1 flex-col gap-3 px-4 pb-4'>
                {/* Logo de l'établissement, à cheval sur la photo */}
                <SchoolLogo
                    name={formation.school}
                    logo={formation.schoolLogo}
                    className='-mt-7 h-14 w-14 rounded-xl text-sm shadow-md ring-4 ring-white'
                />
                <div className='flex flex-col gap-0.5'>
                    <p className='truncate text-sm font-semibold text-secondary'>{formation.school}</p>
                    <h3 className='text-base font-bold leading-snug text-secondary group-hover:text-primary duration-300'>
                        {formation.title}
                    </h3>
                </div>
                <ul className='flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-ink/70'>
                    {offerFacts(formation).map((fact) => (
                        <li key={fact.label} className='flex items-center gap-1.5'>
                            <Icon icon={fact.icon} className='shrink-0 text-base text-secondary' />
                            {t(fact.label)}
                        </li>
                    ))}
                    {formation.domain && (
                        <li className='flex items-center gap-1.5'>
                            <Icon icon='tabler:book-2' className='shrink-0 text-base text-secondary' />
                            {t(formation.domain)}
                        </li>
                    )}
                    <li className='flex items-center gap-1.5'>
                        <Icon icon='tabler:map-pin' className='shrink-0 text-base text-secondary' />
                        {formation.city}
                        {formation.distanceKm !== undefined && <span className='font-semibold text-primary'>· {t('à {km} km', { km: formation.distanceKm.toLocaleString('fr-FR') })}</span>}
                    </li>
                </ul>
                <CardAction href={`/formations/${formation.id}`} className='py-2.5 text-sm'>
                    {t(OFFER_CTA[formation.kind])}
                </CardAction>
            </div>
        </Card>
    )
}

export default FormationCard
