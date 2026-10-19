'use client'
import Image from 'next/image'
import { imageOr } from '@/lib/media'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/icon'
import { Card, CardAction } from '@/components/ui/card'
import { useSiteData } from '@/data/site-data'
import type { SchoolType } from '../types'
import { summarizeOffers } from '../offer-summary'
import SchoolLogo from './SchoolLogo'

/** `compact` : version basse et large (bandeau défilant de l'accueil). */
export function SchoolCard({ school, compact = false }: { school: SchoolType; compact?: boolean }) {
    const { data: formations } = useSiteData('FormationData')
    const summary = summarizeOffers(formations.filter((formation) => formation.schoolId === school.id))
    const facts = summary
        ? [
              { icon: 'tabler:books', label: summary.count },
              summary.range && { icon: 'tabler:school', label: summary.range },
              summary.fees && { icon: 'tabler:cash', label: summary.fees },
          ].filter((fact): fact is { icon: string; label: string } => Boolean(fact))
        : []

    return (
        <Card className='flex h-full flex-col overflow-hidden'>
            <div className={cn('relative bg-cream', compact ? 'h-28' : 'h-36')}>
                <Image src={imageOr(school.imageSrc)} alt={`Locaux de ${school.name}`} fill className='object-cover' />
                {summary?.registration && (
                    <span className='absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-secondary shadow-sm'>
                        <span className={cn('h-2 w-2 rounded-full', summary.registration === 'Inscriptions ouvertes' ? 'bg-emerald-500' : 'bg-amber-400')} />
                        {summary.registration}
                    </span>
                )}
            </div>

            <div className={cn('flex flex-1 flex-col', compact ? 'gap-2.5 px-5 pb-4' : 'gap-3 px-5 pb-5')}>
                {/* Logo de l'établissement, à cheval sur la photo */}
                <SchoolLogo
                    name={school.name}
                    initials={school.initials}
                    logo={school.logo}
                    className='relative -mt-7 h-14 w-14 rounded-xl text-sm shadow-md ring-4 ring-white'
                />
                <div className='flex flex-col gap-1'>
                    <h3 className='text-lg font-semibold leading-snug text-secondary group-hover:text-primary duration-300'>
                        {school.name}
                    </h3>
                    <p className={cn('flex items-center gap-1.5 text-black', compact && 'min-w-0 text-sm')}>
                        <Icon icon='tabler:map-pin' className='shrink-0 text-lg text-secondary' />
                        <span className={cn(compact && 'truncate')}>
                            {school.subCategory} · {school.city}
                        </span>
                    </p>
                </div>
                {/* Ce que propose l'établissement, d'après ses offres publiées */}
                {facts.length > 0 ? (
                    <ul className='flex flex-col gap-1.5 text-sm text-black'>
                        {facts.map((fact) => (
                            <li key={fact.icon} className='flex items-center gap-2'>
                                <Icon icon={fact.icon} className='shrink-0 text-base text-primary' />
                                <span className='truncate'>{fact.label}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className='text-sm text-ink/60'>Aucune offre publiée pour le moment.</p>
                )}
                <div className={cn('flex gap-2', compact ? 'flex-nowrap overflow-hidden' : 'flex-wrap')}>
                    {(compact ? school.tags.slice(0, 2) : school.tags).map((tag) => (
                        <span
                            key={tag}
                            className='shrink-0 whitespace-nowrap rounded-full bg-success/30 px-3 py-1 text-sm font-medium text-secondary'>
                            {tag}
                        </span>
                    ))}
                </div>
                <CardAction href={`/etablissements/${school.id}`} className={cn(compact && 'py-2.5 text-sm')}>Voir l&apos;établissement</CardAction>
            </div>
        </Card>
    )
}

export default SchoolCard
