'use client'
import { Icon } from '@/components/ui/icon'
import AutoScroll from '@/components/ui/auto-scroll'
import { cn } from '@/lib/utils'
import type { FormationType } from '@/features/formations/types'
import type { TestimonialType } from '../types'
import { useT } from '@/i18n/client'

const AVATAR_COLORS = ['bg-primary text-white', 'bg-secondary text-white', 'bg-success text-secondary', 'bg-cream text-primary']

function Stars({ rating, className }: { rating: number; className?: string }) {
    return (
        <span className={cn('inline-flex text-[#FBBC04]', className)} aria-label={`${rating} / 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <Icon key={i} icon={i < Math.round(rating) ? 'tabler:star-filled' : 'tabler:star'} />
            ))}
        </span>
    )
}

const initials = (name: string) =>
    name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()

/** Témoignages d'étudiants, en format compact : note moyenne sur une ligne, avis en défilement continu. */
export function SchoolTestimonials({
    testimonials,
    formations,
}: {
    testimonials: TestimonialType[]
    formations: FormationType[]
}) {
    const tr = useT()
    if (testimonials.length === 0) {
        return <p className='text-ink/60'>{tr('Aucun témoignage pour le moment.')}</p>
    }
    const average = testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
    const titleOf = (id: string) => formations.find((f) => f.id === id)?.title

    return (
        <div className='flex flex-col gap-4'>
            <div className='flex items-center gap-2 text-sm text-ink/70'>
                <Stars rating={average} />
                <span className='font-semibold text-secondary'>{average.toFixed(1).replace('.', ',')}</span>
                <span>· {tr(`${testimonials.length} avis`)}</span>
            </div>

            <AutoScroll duration={30} itemClassName='w-[340px]'>
                {testimonials.map((t, i) => (
                    <figure key={t.id} className='flex h-full flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4'>
                        <blockquote className='line-clamp-3 text-[15px] text-ink/80 leading-snug'>« {t.quote} »</blockquote>
                        <figcaption className='mt-auto flex items-center gap-2.5'>
                            <span
                                className={cn(
                                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                                    AVATAR_COLORS[i % AVATAR_COLORS.length]
                                )}>
                                {initials(t.name)}
                            </span>
                            <span className='flex min-w-0 flex-col text-sm leading-tight'>
                                <span className='flex items-center gap-2'>
                                    <span className='font-semibold text-secondary'>{t.name}</span>
                                    <Stars rating={t.rating} className='text-xs' />
                                </span>
                                <span className='truncate text-ink/60'>{titleOf(t.formationId)}</span>
                            </span>
                        </figcaption>
                    </figure>
                ))}
            </AutoScroll>
        </div>
    )
}

export default SchoolTestimonials
