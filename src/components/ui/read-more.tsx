'use client'
import { useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { useT } from '@/i18n/client'
import { cn } from '@/lib/utils'

/**
 * Texte long replié sur téléphone (« Lire la suite »), affiché en entier dès la tablette.
 * Le texte reste dans la page : il est seulement masqué visuellement.
 */
export function ReadMore({ children, className }: { children: React.ReactNode; className?: string }) {
    const t = useT()
    const [open, setOpen] = useState(false)
    return (
        <div className={className}>
            <div className={cn('relative', !open && 'max-h-44 overflow-hidden sm:max-h-none sm:overflow-visible')}>
                {children}
                {!open && <div aria-hidden='true' className='absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent sm:hidden' />}
            </div>
            {!open && (
                <button
                    type='button'
                    onClick={() => setOpen(true)}
                    className='mt-3 inline-flex items-center gap-1 font-semibold text-primary hover:cursor-pointer sm:hidden'>
                    {t('Lire la suite')}
                    <Icon icon='tabler:chevron-down' className='text-lg' />
                </button>
            )}
        </div>
    )
}

export default ReadMore
