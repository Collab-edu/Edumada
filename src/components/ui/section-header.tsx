'use client'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
    title: string
    description?: string
    link?: { href: string; label: string }
    className?: string
}

/** En-tête de section : titre, sous-titre et lien « voir tout » aligné à droite. */
export function SectionHeader({ title, description, link, className }: SectionHeaderProps) {
    return (
        <div className={cn('flex flex-col sm:flex-row justify-between sm:items-end gap-5 mb-10', className)}>
            <div className='flex flex-col gap-3'>
                <h2 className='font-bold tracking-tight'>{title}</h2>
                {description && <p className='text-ink/70'>{description}</p>}
            </div>
            {link && (
                <Link
                    href={link.href}
                    className='group inline-flex shrink-0 items-center gap-1.5 font-semibold text-primary hover:text-primary/80 duration-300'>
                    {link.label}
                    <Icon
                        icon='tabler:arrow-right'
                        className='text-lg transition-transform duration-300 group-hover:translate-x-1'
                    />
                </Link>
            )}
        </div>
    )
}

export default SectionHeader
