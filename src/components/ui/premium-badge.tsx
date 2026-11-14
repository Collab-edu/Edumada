'use client'
import { useT } from '@/i18n/client'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

/** Badge doré des établissements Premium (cartes d'offre et d'établissement, fiche). */
export function PremiumBadge({ className }: { className?: string }) {
    const t = useT()
    return (
        <span
            title={t('Établissement Premium')}
            className={cn('inline-flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-xs font-bold text-gold-ink shadow-sm', className)}>
            <Icon icon='tabler:crown' className='shrink-0 text-sm' aria-hidden='true' />
            Premium
        </span>
    )
}
