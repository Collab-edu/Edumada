'use client'
import { Icon } from '@iconify/react/dist/iconify.js'
import { cn } from '@/lib/utils'
import type { FormationType } from '@/features/formations/types'
import type { TestimonialType } from '../types'

const AVATAR_COLORS = ['bg-primary text-white', 'bg-secondary text-white', 'bg-success text-secondary', 'bg-cream text-primary']

function Stars({ rating, className }: { rating: number; className?: string }) {
    return (
        <span className={cn('inline-flex text-[#FBBC04]', className)} aria-label={`${rating} sur 5`}>
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

/** Témoignages d'étudiants : note moyenne et avis par formation. */
export function SchoolTestimonials({
    testimonials,
    formations,
}: {
    testimonials: TestimonialType[]
    formations: FormationType[]
}) {
    if (testimonials.length === 0) {
        return <p className='text-ink/60'>Aucun témoignage pour le moment.</p>
    }
    const average = testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
    const titleOf = (id: string) => formations.find((f) => f.id === id)?.title

    return (
        <div className='flex flex-col gap-5'>
            <div className='flex items-center gap-4 rounded-2xl bg-cream/60 px-6 py-4'>
                <span className='text-4xl font-bold text-secondary'>{average.toFixed(1).replace('.', ',')}</span>
                <div className='flex flex-col'>
                    <Stars rating={average} className='text-xl' />
                    <span className='text-sm text-ink/70'>
                        Note moyenne sur {testimonials.length} avis d&apos;étudiant{testimonials.length > 1 ? 's' : ''}
                    </span>
                </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                {testimonials.map((t, i) => (
                    <figure key={t.id} className='flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
                        <div className='flex items-center justify-between'>
                            <Stars rating={t.rating} />
                            <Icon icon='tabler:quote' className='text-3xl text-primary/20' />
                        </div>
                        <blockquote className='flex-1 text-ink/80 leading-relaxed'>« {t.quote} »</blockquote>
                        <figcaption className='flex items-center gap-3 border-t border-gray-100 pt-4'>
                            <span
                                className={cn(
                                    'flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold',
                                    AVATAR_COLORS[i % AVATAR_COLORS.length]
                                )}>
                                {initials(t.name)}
                            </span>
                            <span className='flex flex-col'>
                                <span className='font-semibold text-secondary'>{t.name}</span>
                                <span className='text-sm text-ink/60'>
                                    {titleOf(t.formationId)} · {t.status}
                                </span>
                            </span>
                        </figcaption>
                    </figure>
                ))}
            </div>
        </div>
    )
}

export default SchoolTestimonials
