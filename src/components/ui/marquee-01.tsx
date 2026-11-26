'use client'
import AutoScroll from '@/components/ui/auto-scroll'
import { useT } from '@/i18n/client'
import { Card } from '@/components/ui/card'

export type Testimonial = { testimonial: string; by: string }

/** Couleurs d'avatar, assez foncées pour une lettre blanche lisible. */
const AVATAR_COLORS = ['#0f4c5c', '#e0263d', '#1a73e8', '#188038', '#8e24aa', '#e8710a', '#00897b', '#c2185b', '#5f6368', '#6d4c41']

function ReviewCard({ testimonial, by, color }: Testimonial & { color: string }) {
    const t = useT()
    const [name, ...role] = by.split(', ')
    return (
        <Card className='flex h-full flex-col gap-3 p-5'>
            <div className='flex items-center gap-3'>
                {/* Pas de photo : l'initiale du nom tient lieu d'avatar, sur une couleur différente pour chaque avis (comme les avis Google). */}
                <span
                    aria-hidden
                    style={{ backgroundColor: color }}
                    className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-heading text-base font-bold text-white'>
                    {name.charAt(0).toUpperCase()}
                </span>
                <div className='min-w-0'>
                    <p className='truncate text-sm font-semibold text-secondary'>{t(name)}</p>
                    {role.length > 0 && <p className='truncate text-xs text-ink/60'>{role.map((part) => t(part)).join(', ')}</p>}
                </div>
            </div>
            <p className='text-ink'>{t(testimonial)}</p>
        </Card>
    )
}

/** Deux rangées de témoignages qui défilent en sens inverse ; pause au survol d'une rangée. */
export default function TestimonialMarquee({ testimonials }: { testimonials: Testimonial[] }) {
    // Couleur selon la position dans la liste : deux avis voisins n'ont jamais la même.
    const colored = testimonials.map((review, i) => ({ ...review, color: AVATAR_COLORS[i % AVATAR_COLORS.length] }))
    const middle = Math.ceil(colored.length / 2)
    const rows = [colored.slice(0, middle), colored.slice(middle)]
    return (
        <div className='relative flex w-full flex-col overflow-hidden'>
            {rows.map((row, i) => (
                <AutoScroll key={i} reverse={i === 1} duration={30} minItemsPerLoop={10} itemClassName='w-[300px] sm:w-[340px]'>
                    {row.map((review) => (
                        <ReviewCard key={review.by} {...review} />
                    ))}
                </AutoScroll>
            ))}
            <div className='pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-offwhite sm:w-1/6' />
            <div className='pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-offwhite sm:w-1/6' />
        </div>
    )
}
