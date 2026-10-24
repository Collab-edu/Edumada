'use client'
import Link, { useT } from '@/i18n/client'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

interface SectionHeaderProps {
    title: string
    description?: string
    link?: { href: string; label: string }
    className?: string
}

/** En-tête de section : titre, sous-titre et lien « voir tout » aligné à droite. */
export function SectionHeader({ title, description, link, className }: SectionHeaderProps) {
    const t = useT()
    return (
        <div className={cn('flex flex-col sm:flex-row justify-between sm:items-end gap-3 sm:gap-5 mb-6 sm:mb-10', className)}>
            <div className='flex flex-col gap-3'>
                <h2 className='font-bold'>{t(title)}</h2>
                {description && <p className='text-black'>{t(description)}</p>}
            </div>
            {link && (
                <Link
                    href={link.href}
                    className='group inline-flex shrink-0 items-center gap-1.5 py-2 font-semibold text-primary hover:text-primary/80 duration-300'>
                    {t(link.label)}
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
