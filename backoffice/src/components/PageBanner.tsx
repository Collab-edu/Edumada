'use client'
import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import CIcon from '@coreui/icons-react'
import { findRoute } from '@/routes'

/** Bandeau coloré en tête de page : icône, titre et description de la route (ou personnalisés). */
export default function PageBanner({ title, description, actions }: { title?: ReactNode; description?: ReactNode; actions?: ReactNode }) {
    const route = findRoute(usePathname())
    return (
        <div className='bo-banner d-flex flex-wrap align-items-center gap-3'>
            {route && (
                <div className='bo-banner-icon'>
                    <CIcon icon={route.icon} size='xl' />
                </div>
            )}
            <div className='me-auto min-w-0' style={{ flex: '1 1 220px' }}>
                <h1 className='text-truncate'>{title ?? route?.name}</h1>
                {(description ?? route?.description) && <p>{description ?? route?.description}</p>}
            </div>
            {actions && <div className='bo-banner-actions d-flex flex-wrap gap-2'>{actions}</div>}
        </div>
    )
}
