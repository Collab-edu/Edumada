'use client'
import Image from 'next/image'
import { imageOr } from '@/lib/media'
import { Icon } from '@/components/ui/icon'
import { Card, CardAction } from '@/components/ui/card'
import type { SchoolType } from '../types'

export function SchoolCard({ school }: { school: SchoolType }) {
    return (
        <Card className='flex h-full flex-col overflow-hidden'>
            <div className='relative h-36 bg-cream'>
                <Image src={imageOr(school.imageSrc)} alt={`Locaux de ${school.name}`} fill className='object-cover' />
            </div>

            <div className='flex flex-1 flex-col gap-3 px-5 pb-5'>
                {/* Logo de l'établissement, à cheval sur la photo */}
                <span className='relative -mt-7 flex h-14 w-14 items-center justify-center rounded-xl bg-secondary text-sm font-bold tracking-wide text-white ring-4 ring-white'>
                    {school.initials}
                </span>
                <div className='flex flex-col gap-1'>
                    <h3 className='text-lg font-semibold leading-snug text-secondary group-hover:text-primary duration-300'>
                        {school.name}
                    </h3>
                    <p className='flex items-center gap-1.5 text-ink/70'>
                        <Icon icon='tabler:map-pin' className='text-lg text-secondary' />
                        {school.subCategory} · {school.city}
                    </p>
                </div>
                <p className='line-clamp-3 text-ink/60'>{school.description}</p>
                <div className='flex flex-wrap gap-2'>
                    {school.tags.map((tag) => (
                        <span
                            key={tag}
                            className='rounded-full bg-success/30 px-3 py-1 text-sm font-medium text-secondary'>
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
