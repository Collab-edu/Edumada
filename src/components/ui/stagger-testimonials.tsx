'use client'
import { useEffect, useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

export type Testimonial = { tempId: number; testimonial: string; by: string; imgSrc: string }

const SQRT_5000 = Math.sqrt(5000)

interface TestimonialCardProps {
    position: number
    testimonial: Testimonial
    handleMove: (steps: number) => void
    cardSize: number
}

/** Une carte : celle du centre est mise en avant, les autres sont inclinées de part et d'autre. */
function TestimonialCard({ position, testimonial, handleMove, cardSize }: TestimonialCardProps) {
    const isCenter = position === 0
    return (
        <div
            onClick={() => handleMove(position)}
            className={cn(
                'absolute left-1/2 top-1/2 flex cursor-pointer flex-col border-2 p-6 sm:p-8 transition-all duration-500 ease-in-out',
                isCenter ? 'z-10 border-secondary bg-secondary text-white' : 'z-0 border-gray-200 bg-white text-ink hover:border-primary/50'
            )}
            style={{
                width: cardSize,
                height: cardSize,
                clipPath: 'polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)',
                transform: `
                    translate(-50%, -50%)
                    translateX(${(cardSize / 1.5) * position}px)
                    translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
                    rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
                `,
                boxShadow: isCenter ? '0px 8px 0px 4px #ff3b52' : '0px 0px 0px 0px transparent',
            }}>
            <span className='absolute block origin-top-right rotate-45 bg-gray-200' style={{ right: -2, top: 48, width: SQRT_5000, height: 2 }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={testimonial.imgSrc}
                alt={testimonial.by.split(',')[0]}
                className='mb-4 h-14 w-12 bg-offwhite object-cover object-top'
                style={{ boxShadow: '3px 3px 0px #f6f8fa' }}
            />
            <h3 className={cn('text-[15px] font-medium leading-snug sm:text-xl', isCenter ? 'text-white' : 'text-secondary')}>« {testimonial.testimonial} »</h3>
            <p className={cn('mt-auto pt-3 text-sm italic', isCenter ? 'text-white/80' : 'text-ink/60')}>— {testimonial.by}</p>
        </div>
    )
}

const BUTTON = 'flex h-14 w-14 items-center justify-center border-2 border-gray-200 bg-white text-2xl text-secondary transition-colors hover:border-primary hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'

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
        <div className='relative w-full overflow-hidden' style={{ height: 600 }}>
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
