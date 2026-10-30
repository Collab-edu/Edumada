'use client'
import { useEffect, useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

export type Testimonial = { tempId: number; testimonial: string; by: string; imgSrc: string }

interface TestimonialCardProps {
    position: number
    testimonial: Testimonial
    handleMove: (steps: number) => void
    cardSize: number
}

/** Une carte : celle du centre est mise en avant, les autres sont inclinées de part et d'autre. */
function TestimonialCard({ position, testimonial, handleMove, cardSize }: TestimonialCardProps) {
    const isCenter = position === 0
    const [name, ...role] = testimonial.by.split(', ')
    return (
        <div
            onClick={() => handleMove(position)}
            className={cn(
                'absolute left-1/2 top-1/2 flex cursor-pointer flex-col rounded-2xl border p-6 transition-all duration-500 ease-in-out sm:p-8',
                isCenter ? 'z-10 border-secondary bg-secondary text-white' : 'z-0 border-gray-200 bg-white text-ink hover:border-primary/40'
            )}
            style={{
                width: cardSize,
                height: cardSize,
                transform: `
                    translate(-50%, -50%)
                    translateX(${(cardSize / 1.5) * position}px)
                    translateY(${isCenter ? -50 : position % 2 ? 15 : -15}px)
                    rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
                `,
                // Ombre décalée de la charte : rouge pour la carte mise en avant.
                boxShadow: isCenter ? '6px 6px 0 0 #ff3b52' : '4px 4px 0 0 rgba(15,76,92,0.22)',
            }}>
            <span className='flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white'>
                <Icon icon='tabler:quote' className='text-2xl' />
            </span>
            <h3 className={cn('mt-5 text-[15px] font-medium leading-snug sm:text-lg', isCenter ? 'text-white' : 'text-secondary')}>
                {testimonial.testimonial}
            </h3>
            <div className={cn('mt-auto flex items-center gap-3 border-t pt-4', isCenter ? 'border-white/15' : 'border-gray-200')}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={testimonial.imgSrc}
                    alt={name}
                    className={cn('h-11 w-11 shrink-0 rounded-full object-cover object-top ring-2', isCenter ? 'ring-primary' : 'ring-cream')}
                />
                <div className='min-w-0'>
                    <p className={cn('truncate text-sm font-semibold', isCenter ? 'text-white' : 'text-secondary')}>{name}</p>
                    {role.length > 0 && <p className={cn('truncate text-xs', isCenter ? 'text-white/70' : 'text-ink/60')}>{role.join(', ')}</p>}
                </div>
            </div>
        </div>
    )
}

const BUTTON = 'flex h-12 w-12 items-center justify-center rounded-lg border border-gray-200 bg-white text-2xl text-secondary shadow-[3px_3px_0_0_rgba(15,76,92,0.22)] transition-colors hover:cursor-pointer hover:border-primary hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'

/** Carrousel de témoignages en cartes décalées (d'après 21st.dev). */
export function StaggerTestimonials({ testimonials }: { testimonials: Testimonial[] }) {
    const [cardSize, setCardSize] = useState(365)
    const [testimonialsList, setTestimonialsList] = useState(testimonials)

    const handleMove = (steps: number) => {
        const newList = [...testimonialsList]
        if (steps > 0) {
            for (let i = steps; i > 0; i--) {
                const item = newList.shift()
                if (!item) return
                newList.push({ ...item, tempId: Math.random() })
            }
        } else {
            for (let i = steps; i < 0; i++) {
                const item = newList.pop()
                if (!item) return
                newList.unshift({ ...item, tempId: Math.random() })
            }
        }
        setTestimonialsList(newList)
    }

    useEffect(() => {
        const updateSize = () => setCardSize(window.matchMedia('(min-width: 640px)').matches ? 365 : 290)
        updateSize()
        window.addEventListener('resize', updateSize)
        return () => window.removeEventListener('resize', updateSize)
    }, [])

    return (
        <div className='relative w-full overflow-hidden' style={{ height: 560 }}>
            {testimonialsList.map((testimonial, index) => {
                const position = testimonialsList.length % 2 ? index - (testimonialsList.length + 1) / 2 : index - testimonialsList.length / 2
                return <TestimonialCard key={testimonial.tempId} testimonial={testimonial} handleMove={handleMove} position={position} cardSize={cardSize} />
            })}
            <div className='absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2'>
                <button type='button' onClick={() => handleMove(-1)} className={BUTTON} aria-label='Témoignage précédent'>
                    <Icon icon='tabler:chevron-left' />
                </button>
                <button type='button' onClick={() => handleMove(1)} className={BUTTON} aria-label='Témoignage suivant'>
                    <Icon icon='tabler:chevron-right' />
                </button>
            </div>
        </div>
    )
}

export default StaggerTestimonials
