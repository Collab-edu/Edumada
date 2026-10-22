import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * Petite étiquette au-dessus d'un titre ou à côté d'une valeur : capitales espacées en rouge,
 * précédées d'un court trait (sans fond ni pastille).
 */
export function Eyebrow({ children, bar = true, className }: { children: ReactNode; bar?: boolean; className?: string }) {
    return (
        <span className={cn('inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-primary', className)}>
            {bar && <span aria-hidden='true' className='h-0.5 w-5 shrink-0 rounded-full bg-primary' />}
            {children}
        </span>
    )
}

export default Eyebrow
