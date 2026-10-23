'use client'
import Image from 'next/image'
import { imageOr } from '@/lib/media'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/icon'
import { Card, CardAction } from '@/components/ui/card'
import { useSiteData } from '@/data/site-data'
import type { SchoolType } from '../types'
import SchoolLogo from './SchoolLogo'
import CategoryTag from '@/features/categories/components/CategoryTag'

/** Nombre d'offres listées sur la carte ; au-delà, « + N autres offres ». */
const MAX_OFFERS = 3

/** `compact` : version basse et large (bandeau défilant de l'accueil). */
/** `distanceKm` : distance au lieu recherché, affichée à côté de la ville. */
export function SchoolCard({ school, compact = false, distanceKm }: { school: SchoolType; compact?: boolean; distanceKm?: number }) {
    const { data: formations } = useSiteData('FormationData')
    const { data: categories } = useSiteData('CategoryData')
    const category = categories.find((c) => c.id === school.category)
    const offers = formations.filter((formation) => formation.schoolId === school.id)
    const shown = offers.slice(0, MAX_OFFERS)

    return (
        <Card className='flex h-full flex-col overflow-hidden'>
            <div className={cn('relative overflow-hidden bg-cream', compact ? 'h-40' : 'h-48')}>
                <Image src={imageOr(school.imageSrc)} alt={`Locaux de ${school.name}`} fill className='object-cover transition-transform duration-500 group-hover:scale-105' />
                {/* Type d'établissement, comme sur les cartes de formation */}
                <CategoryTag categoryId={school.category} subCategory={school.subCategory} />
                {school.type && (
                    <span className='absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-secondary shadow-sm backdrop-blur-sm'>
                        {school.type}
                    </span>
                )}
            </div>

            <div className='relative flex flex-1 flex-col gap-3 px-4 pb-4'>
                {/* Logo de l'établissement, à cheval sur la photo */}
                <SchoolLogo
                    name={school.name}
                    initials={school.initials}
                    logo={school.logo}
                    className='-mt-7 h-14 w-14 rounded-xl text-sm shadow-md ring-4 ring-white'
                />
                <div className='flex flex-col gap-0.5'>
                    {category && <p className='truncate text-sm font-semibold text-secondary'>{category.shortLabel}</p>}
                    <h3 className='text-base font-bold leading-snug text-secondary group-hover:text-primary duration-300'>
                        {school.name}
                    </h3>
                </div>
                {/* Offres proposées par l'établissement */}
                <ul className='flex flex-col gap-1.5 text-sm text-ink/70'>
                    {shown.map((offer) => (
                        <li key={offer.id} className='flex min-w-0 items-center gap-1.5'>
                            <Icon icon='tabler:circle-check' className='shrink-0 text-base text-secondary' />
                            <span className='truncate'>{offer.title}</span>
                        </li>
                    ))}
                    {offers.length > shown.length && (
                        <li className='pl-6 font-semibold text-secondary'>
                            + {offers.length - shown.length} {offers.length - shown.length > 1 ? 'autres offres' : 'autre offre'}
                        </li>
                    )}
                    {offers.length === 0 && <li>Aucune offre publiée pour le moment.</li>}
                    <li className='flex items-center gap-1.5'>
                        <Icon icon='tabler:map-pin' className='shrink-0 text-base text-secondary' />
                        {school.city}
                        {distanceKm !== undefined && <span className='font-semibold text-primary'>· à {distanceKm.toLocaleString('fr-FR')} km</span>}
                    </li>
                </ul>
                <CardAction href={`/etablissements/${school.id}`} className='py-2.5 text-sm'>
                    Voir l&apos;établissement
                </CardAction>
            </div>
        </Card>
    )
}

export default SchoolCard
