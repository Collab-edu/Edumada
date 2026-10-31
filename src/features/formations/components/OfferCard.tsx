'use client'
import Image from 'next/image'
import Link, { useT } from '@/i18n/client'
import { Card, CardWave } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { imageOr } from '@/lib/media'
import { cn } from '@/lib/utils'
import CategoryTag from '@/features/categories/components/CategoryTag'
import SchoolLogo from '@/features/etablissements/components/SchoolLogo'
import { OFFER_CTA, offerFacts } from '../format'
import { offerHref } from '../href'
import type { FormationType } from '../types'

export interface OfferCardProps {
    formation: FormationType
    isFavorite: boolean
    onToggleFavorite: () => void
    /** Emplacement payant d'une campagne Premium : toujours signalé comme tel. */
    sponsored?: boolean
    id?: string
    /** Photo moins haute (bandeaux défilants, grilles de 4). */
    compact?: boolean
}

/** Carte d'une offre, commune à tout le site : photo, établissement, infos clés et bouton vers la fiche. */
export default function OfferCard({ formation, isFavorite, onToggleFavorite, sponsored = false, id, compact = false }: OfferCardProps) {
    const t = useT()
    const distance = formation.distanceKm !== undefined ? ` · ${t('à {km} km', { km: formation.distanceKm.toLocaleString('fr-FR') })}` : ''
    const facts = [
        ...offerFacts(formation),
        ...(formation.languages.length ? [{ icon: 'tabler:language', label: formation.languages.join(', ') }] : []),
        { icon: 'tabler:map-pin', label: `${formation.city}${distance}` },
    ]

    return (
        <Card id={id} className={cn('flex h-full flex-col overflow-hidden scroll-mt-28 shadow-[0_6px_14px_-8px_rgba(15,76,92,0.3)]', sponsored && 'ring-2 ring-primary/30')}>
            <div className={cn('relative shrink-0 bg-cream', compact ? 'h-40' : 'h-48')}>
                <Image src={imageOr(formation.imageSrc)} alt='' fill className='object-cover' />
                <div className='absolute top-3 right-3 left-3 flex flex-wrap items-center gap-1.5'>
                    <CategoryTag categoryId={formation.category} schoolId={formation.schoolId} className='static max-w-full rounded-full' />
                    {formation.schoolType && <span className='rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-secondary'>{t(formation.schoolType)}</span>}
                    {sponsored && <span className='rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-white'>{t('Sponsorisé')}</span>}
                </div>
                <CardWave />
            </div>

            <div className='relative flex flex-1 flex-col gap-4 px-5 pb-5'>
                <Link href={`/etablissements/${formation.schoolId}`} aria-label={formation.school} className='relative -mt-8 w-fit'>
                    <SchoolLogo name={formation.school} logo={formation.schoolLogo} className='h-16 w-16 rounded-2xl text-sm shadow-md ring-4 ring-white' />
                </Link>

                <div>
                    <h3 className='text-lg font-bold leading-snug text-secondary'>{formation.title}</h3>
                    <span className='mt-2 block h-0.5 w-12 rounded-full bg-primary' aria-hidden='true' />
                </div>

                <Link href={`/etablissements/${formation.schoolId}`} className='flex w-fit max-w-full items-center gap-2 rounded-full bg-offwhite px-3 py-1.5 text-sm font-medium text-secondary hover:text-primary'>
                    <Icon icon='tabler:building-bank' className='shrink-0 text-base' />
                    <span className='truncate'>{formation.school}</span>
                </Link>

                <ul className='flex flex-wrap gap-x-4 gap-y-2 text-sm text-ink/80'>
                    {facts.map((fact) => (
                        <li key={fact.label} className='flex items-center gap-1.5'>
                            <Icon icon={fact.icon} className='shrink-0 text-base text-secondary' />
                            {t(fact.label)}
                        </li>
                    ))}
                </ul>

                <div className='mt-auto flex items-center justify-between gap-3 pt-1'>
                    <Link
                        href={offerHref(formation)}
                        className='flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors duration-300 hover:bg-primary/90 sm:min-h-10'>
                        {t(OFFER_CTA[formation.kind])}
                        <Icon icon='tabler:arrow-right' className='text-base' />
                    </Link>
                    <button
                        type='button'
                        onClick={onToggleFavorite}
                        aria-label={isFavorite ? t('Retirer des favoris') : t('Ajouter aux favoris')}
                        aria-pressed={isFavorite}
                        className='flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white transition-colors duration-300 hover:bg-cream hover:cursor-pointer sm:h-10 sm:w-10'>
                        <Icon icon={isFavorite ? 'tabler:heart-filled' : 'tabler:heart'} className='text-xl text-primary' />
                    </button>
                </div>
            </div>
        </Card>
    )
}
