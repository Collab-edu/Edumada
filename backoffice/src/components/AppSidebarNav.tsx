'use client'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'
import { CBadge, CNavItem, CNavTitle, CSidebarNav } from '@coreui/react'
import type { NavEntry } from '@/nav'

type NavItem = Extract<NavEntry, { kind: 'item' }>

const clean = (path: string) => path.replace(/\/+$/, '') || '/'

/** « /admin/etablissements?categorie=x » → lien « /admin/etablissements/?categorie=x » (export avec barre finale). */
const href = (to: string) => {
    const [path, query] = to.split('?')
    return `${path}/${query ? `?${query}` : ''}`
}

/**
 * Entrées du menu. L'entrée active couvre ses sous-pages (/offres → /offres/nouvelle) ;
 * une entrée avec paramètres (catégorie) n'est active que si l'adresse a les mêmes paramètres.
 */
export function AppSidebarNav({ items, onNavigate }: { items: NavEntry[]; onNavigate?: () => void }) {
    const pathname = clean(usePathname())
    const search = useSearchParams()

    const matches = (item: NavItem) => {
        const [path, query] = item.to.split('?')
        if (pathname !== path && !pathname.startsWith(`${path}/`)) return false
        const wanted = new URLSearchParams(query)
        return [...wanted.entries()].every(([key, value]) => search.get(key) === value)
    }
    // L'entrée la plus précise l'emporte (une catégorie plutôt que « Tous les établissements »).
    const active = items
        .filter((i): i is NavItem => i.kind === 'item')
        .filter(matches)
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
                        <Link href={href(entry.to)} className={`nav-link${active === entry.to ? ' active' : ''}`} onClick={onNavigate}>
                            {entry.icon}
                            <span className='bo-nav-label'>{entry.name}</span>
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
