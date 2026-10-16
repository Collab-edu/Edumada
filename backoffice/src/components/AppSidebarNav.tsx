'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'
import { CBadge, CNavItem, CNavTitle, CSidebarNav } from '@coreui/react'
import type { NavEntry } from '@/nav'

const clean = (path: string) => path.replace(/\/+$/, '') || '/'

/** Entrées du menu ; l'entrée active couvre aussi ses sous-pages (/offres → /offres/nouvelle). */
export function AppSidebarNav({ items, onNavigate }: { items: NavEntry[]; onNavigate?: () => void }) {
    const pathname = clean(usePathname())
    // L'entrée la plus précise l'emporte (Établissements ne s'allume pas sur une autre page admin).
    const active = items
        .filter((i): i is Extract<NavEntry, { kind: 'item' }> => i.kind === 'item')
        .filter((i) => pathname === i.to || pathname.startsWith(`${i.to}/`))
        .sort((a, b) => b.to.length - a.to.length)[0]?.to

    return (
        <CSidebarNav as={SimpleBar}>
            {items.map((entry, index) =>
                entry.kind === 'title' ? (
                    <CNavTitle key={`t-${index}`} className='text-truncate'>
                        {entry.name}
                    </CNavTitle>
                ) : (
                    <CNavItem key={entry.to} as='div'>
                        <Link href={`${entry.to}/`} className={`nav-link${active === entry.to ? ' active' : ''}`} onClick={onNavigate}>
                            {entry.icon}
                            {entry.name}
                            {entry.badge && (
                                <CBadge color={entry.badge.color} className='ms-auto' size='sm'>
                                    {entry.badge.text}
                                </CBadge>
                            )}
                        </Link>
                    </CNavItem>
                )
            )}
        </CSidebarNav>
    )
}
