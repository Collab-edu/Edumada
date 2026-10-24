'use client'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/client'

interface DialogProps {
    open: boolean
    onClose: () => void
    title: string
    description?: string
    children: ReactNode
    className?: string
}

/**
 * Fenêtre modale : feuille glissée depuis le bas sur mobile, boîte centrée sur grand écran.
 * Échap et clic à l'extérieur la ferment ; le défilement de la page est bloqué pendant l'ouverture.
 */
export function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
    const t = useT()
    const titleId = useId()
    const panelRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
        document.addEventListener('keydown', onKey)
        document.body.style.overflow = 'hidden'
        panelRef.current?.querySelector<HTMLElement>('input, textarea, select, button')?.focus()
        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = ''
        }
    }, [open, onClose])

    if (!open) return null

    return (
        <div className='fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50' onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
            <div
                ref={panelRef}
                role='dialog'
                aria-modal='true'
                aria-labelledby={titleId}
                className={cn(
                    'relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 pb-8 shadow-xl sm:max-w-lg sm:rounded-2xl sm:p-7',
                    className
                )}>
                <div className='mb-5 flex items-start justify-between gap-4'>
                    <div className='flex flex-col gap-1'>
                        <h2 id={titleId} className='text-xl font-bold text-secondary'>{t(title)}</h2>
                        {description && <p className='text-sm text-black'>{description}</p>}
                    </div>
                    <button
                        type='button'
                        onClick={onClose}
                        aria-label={t('Fermer')}
                        className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-offwhite text-ink hover:bg-cream hover:text-primary hover:cursor-pointer'>
                        <Icon icon='tabler:x' className='text-xl' />
                    </button>
                </div>
                {children}
            </div>
        </div>
    )
}

export default Dialog
