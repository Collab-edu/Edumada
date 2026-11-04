import AutoScroll from '@/components/ui/auto-scroll'
import { Card } from '@/components/ui/card'

export type Testimonial = { testimonial: string; by: string; imgSrc: string }

function ReviewCard({ testimonial, by, imgSrc }: Testimonial) {
    const [name, ...role] = by.split(', ')
    return (
        <Card className='flex h-full flex-col gap-3 p-5'>
            <div className='flex items-center gap-3'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgSrc} alt='' width={40} height={40} loading='lazy' className='h-10 w-10 shrink-0 rounded-full object-cover object-top' />
                <div className='min-w-0'>
                    <p className='truncate text-sm font-semibold text-secondary'>{name}</p>
                    {role.length > 0 && <p className='truncate text-xs text-ink/60'>{role.join(', ')}</p>}
                </div>
            </div>
            <p className='text-ink'>{testimonial}</p>
        </Card>
    )
}

/** Deux rangées de témoignages qui défilent en sens inverse ; pause au survol d'une rangée. */
export default function TestimonialMarquee({ testimonials }: { testimonials: Testimonial[] }) {
    const middle = Math.ceil(testimonials.length / 2)
    const rows = [testimonials.slice(0, middle), testimonials.slice(middle)]
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
