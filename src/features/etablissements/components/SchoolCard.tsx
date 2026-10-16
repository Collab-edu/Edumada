'use client'
import Image from 'next/image'
import { imageOr } from '@/lib/media'
import { cn } from '@/lib/utils'
import { Icon } from '@/components/ui/icon'
import { Card, CardAction } from '@/components/ui/card'
import type { SchoolType } from '../types'

/** `compact` : version basse et large (bandeau défilant de l'accueil). */
export function SchoolCard({ school, compact = false }: { school: SchoolType; compact?: boolean }) {
    return (
        <Card className='flex h-full flex-col overflow-hidden'>
            <div className={cn('relative bg-cream', compact ? 'h-28' : 'h-36')}>
                <Image src={imageOr(school.imageSrc)} alt={`Locaux de ${school.name}`} fill className='object-cover' />
            </div>

            <div className={cn('flex flex-1 flex-col', compact ? 'gap-2.5 px-5 pb-4' : 'gap-3 px-5 pb-5')}>
                {/* Logo de l'établissement, à cheval sur la photo */}
                <span className={cn('relative flex items-center justify-center rounded-xl bg-secondary font-bold tracking-wide text-white ring-4 ring-white', compact ? '-mt-6 h-12 w-12 text-sm' : '-mt-7 h-14 w-14 text-sm')}>
                    {school.initials}
                </span>
                <div className='flex flex-col gap-1'>
                    <h3 className='text-lg font-semibold leading-snug text-secondary group-hover:text-primary duration-300'>
                        {school.name}
                    </h3>
                    <p className={cn('flex items-center gap-1.5 text-ink/70', compact && 'min-w-0')}>
                        <Icon icon='tabler:map-pin' className='shrink-0 text-lg text-secondary' />
                        <span className={cn(compact && 'truncate')}>
                            {school.subCategory} · {school.city}
                        </span>
                    </p>
                </div>
                <p className={cn('text-ink/60', compact ? 'line-clamp-2' : 'line-clamp-3')}>{school.description}</p>
                <div className={cn('flex gap-2', compact ? 'flex-nowrap overflow-hidden' : 'flex-wrap')}>
                    {(compact ? school.tags.slice(0, 2) : school.tags).map((tag) => (
                        <span
                            key={tag}
                            className='shrink-0 whitespace-nowrap rounded-full bg-success/30 px-3 py-1 text-sm font-medium text-secondary'>
                            {tag}
                        </span>
                    ))}
                </div>
                <CardAction href={`/etablissements/${school.id}`}>Voir l&apos;établissement</CardAction>
            </div>
        </Card>
    )
}

export default SchoolCard
