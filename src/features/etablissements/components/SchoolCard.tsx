'use client'
import Image from 'next/image'
import { imageOr } from '@/lib/media'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/icon'
import { Card, CardWave } from '@/components/ui/card'
import { useSiteData } from '@/data/site-data'
import type { SchoolType } from '../types'
import SchoolLogo from './SchoolLogo'
import CategoryTag from '@/features/categories/components/CategoryTag'
import Link, { useT } from '@/i18n/client'

/** Nombre d'offres listées sur la carte ; au-delà, « + N autres offres ». */
const MAX_OFFERS = 3

/** `compact` : version basse et large (bandeau défilant de l'accueil). */
/** `distanceKm` : distance au lieu recherché, affichée à côté de la ville. */
export function SchoolCard({ school, compact = false, distanceKm }: { school: SchoolType; compact?: boolean; distanceKm?: number }) {
    const t = useT()
    const { data: formations } = useSiteData('FormationData')
    const { data: categories } = useSiteData('CategoryData')
    const category = categories.find((c) => c.id === school.category)
    const offers = formations.filter((formation) => formation.schoolId === school.id)
    const shown = offers.slice(0, MAX_OFFERS)

    return (
        <Card className='flex h-full flex-col overflow-hidden shadow-[0_6px_14px_-8px_rgba(15,76,92,0.3)]'>
            <div className={cn('relative shrink-0 bg-cream', compact ? 'h-40' : 'h-48')}>
                <Image src={imageOr(school.imageSrc)} alt={`Locaux de ${school.name}`} fill className='object-cover' />
                {/* Type d'établissement, comme sur les cartes de formation */}
                <div className='absolute top-3 right-3 left-3 flex flex-wrap items-center gap-1.5'>
                    <CategoryTag categoryId={school.category} subCategory={school.subCategory} className='static max-w-full rounded-full' />
                    {school.type && <span className='rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-secondary'>{t(school.type)}</span>}
                </div>
                <CardWave />
            </div>

            <div className='relative flex flex-1 flex-col gap-4 px-5 pb-5'>
                {/* Logo de l'établissement, à cheval sur la photo */}
                <SchoolLogo
                    name={school.name}
                    initials={school.initials}
                    logo={school.logo}
                    className='relative -mt-8 h-16 w-16 rounded-2xl text-sm shadow-md ring-4 ring-white'
                />
                <div>
                    <h3 className='text-lg font-bold leading-snug text-secondary'>{school.name}</h3>
                    <span className='mt-2 block h-0.5 w-12 rounded-full bg-primary' aria-hidden='true' />
                </div>
                {category && (
                    <p className='flex w-fit max-w-full items-center gap-2 rounded-full bg-offwhite px-3 py-1.5 text-sm font-medium text-secondary'>
                        <Icon icon={category.icon} className='shrink-0 text-base' />
                        <span className='truncate'>{t(category.shortLabel)}</span>
                    </p>
                )}
                {/* Offres proposées par l'établissement */}
                <ul className='flex flex-col gap-2 text-sm text-ink/80'>
                    {shown.map((offer) => (
                        <li key={offer.id} className='flex min-w-0 items-center gap-1.5'>
                            <Icon icon='tabler:circle-check' className='shrink-0 text-base text-secondary' />
                            <span className='truncate'>{offer.title}</span>
                        </li>
                    ))}
                    {offers.length > shown.length && (
                        <li className='pl-6 font-semibold text-secondary'>
                            {offers.length - shown.length > 1 ? t('+ {n} autres offres', { n: offers.length - shown.length }) : t('+ 1 autre offre')}
                        </li>
                    )}
                    {offers.length === 0 && <li>{t('Aucune offre publiée pour le moment.')}</li>}
                    <li className='flex items-center gap-1.5'>
                        <Icon icon='tabler:map-pin' className='shrink-0 text-base text-secondary' />
                        {school.city}
                        {distanceKm !== undefined && <span className='font-semibold text-primary'>· {t('à {km} km', { km: distanceKm.toLocaleString('fr-FR') })}</span>}
                    </li>
                </ul>
                <Link
                    href={`/etablissements/${school.id}`}
                    className='mt-auto flex min-h-11 w-fit items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors duration-300 hover:bg-primary/90 sm:min-h-10'>
                    {t('Voir l’établissement')}
                    <Icon icon='tabler:arrow-right' className='text-base' />
                </Link>
            </div>
        </Card>
    )
}

export default SchoolCard
