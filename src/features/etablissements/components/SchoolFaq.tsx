'use client'
import { useState } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import { cn } from '@/lib/utils'
import type { FaqItem } from '../faq'

/** Questions fréquentes en accordéon : une seule réponse ouverte à la fois. */
export function SchoolFaq({ items }: { items: FaqItem[] }) {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    return (
        <div className='flex flex-col gap-3'>
            {items.map((item, i) => {
                const open = openIndex === i
                const id = `faq-${i}`
                return (
                    <div
                        key={item.question}
                        className={cn(
                            'rounded-xl border bg-white transition-colors duration-300',
                            open ? 'border-primary/30 shadow-sm' : 'border-gray-100 hover:border-primary/30'
                        )}>
                        <h3>
                            <button
                                type='button'
                                onClick={() => setOpenIndex(open ? null : i)}
                                aria-expanded={open}
                                aria-controls={id}
                                className='flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-secondary hover:cursor-pointer'>
                                {item.question}
                                <span
                                    className={cn(
                                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300',
                                        open ? 'bg-primary text-white' : 'bg-secondary/10 text-secondary'
                                    )}>
                                    <Icon icon={open ? 'tabler:minus' : 'tabler:plus'} />
                                </span>
                            </button>
                        </h3>
                        {open && (
                            <p id={id} className='px-5 pb-5 text-ink/80 leading-relaxed'>
                                {item.answer}
                            </p>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

export default SchoolFaq
