'use client'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    CBadge,
    CContainer,
    CDropdown,
    CDropdownDivider,
    CDropdownHeader,
    CDropdownItem,
    CDropdownMenu,
    CDropdownToggle,
    CHeader,
    CHeaderNav,
    CHeaderToggler,
    CNavItem,
    useColorModes,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBank, cilBell, cilContrast, cilExternalLink, cilMenu, cilMoon, cilSearch, cilSun } from '@coreui/icons'
import AppBreadcrumb from './AppBreadcrumb'
import AppHeaderDropdown from './AppHeaderDropdown'
import { useAuth } from '@/context/AuthContext'
import { useEstablishment } from '@/context/EstablishmentContext'
import { useLayout } from '@/context/LayoutContext'
import { SITE_URL } from '@/lib/api'
import { useApi } from '@/lib/useApi'

export const PLAN_COLORS = { free: 'secondary', pro: 'primary', premium: 'danger' } as const

/** Choix de l'établissement géré (compte établissement avec une ou plusieurs fiches). */
function EstablishmentSwitcher() {
    const { user } = useAuth()
    const { establishments, current, select } = useEstablishment()
    if (!user || user.role !== 'establishment' || !current) return null

    return (
        <CDropdown variant='nav-item' placement='bottom-start'>
            <CDropdownToggle className='d-flex align-items-center gap-2 text-truncate' style={{ maxWidth: 'min(320px, 42vw)' }}>
                <CIcon icon={cilBank} className='text-primary flex-none' />
                <span className='text-truncate fw-semibold'>{current ? current.name : 'Aucun établissement géré'}</span>
                {current && (
                    <CBadge color={PLAN_COLORS[current.plan.code]} className='d-none d-md-inline'>
                        {current.plan.name}
                    </CBadge>
                )}
            </CDropdownToggle>
            <CDropdownMenu>
                {establishments.length > 0 && <CDropdownHeader className='bg-body-secondary fw-semibold'>Mes établissements</CDropdownHeader>}
                {establishments.map((e) => (
                    <CDropdownItem key={e.id} as='button' active={current?.id === e.id} onClick={() => select(e.id)}>
                        {e.name}
                    </CDropdownItem>
                ))}
                {current && (
                    <>
                        <CDropdownDivider />
                        {current.status === 'published' && (
                            <CDropdownItem href={`${SITE_URL}/etablissements/${current.id}/`} target='_blank' rel='noopener noreferrer'>
                                <CIcon icon={cilExternalLink} className='me-2' />
                                Voir la fiche sur le site
                            </CDropdownItem>
                        )}
                    </>
                )}
            </CDropdownMenu>
        </CDropdown>
    )
}

/** Recherche rapide : demandes (établissement) ou fiches (administration). */
function HeaderSearch() {
    const { user } = useAuth()
    const { current } = useEstablishment()
    const router = useRouter()
    const [q, setQ] = useState('')
    const admin = user?.role === 'admin'
    const target = admin ? '/admin/etablissements/' : current?.plan.features.inquiryInbox ? '/demandes/' : null
    if (!target) return null

    const submit = (e: FormEvent) => {
        e.preventDefault()
        router.push(`${target}?q=${encodeURIComponent(q.trim())}`)
    }

    return (
        <form role='search' onSubmit={submit} className='bo-header-search d-none d-md-flex'>
            <CIcon icon={cilSearch} className='bo-header-search-icon' aria-hidden='true' />
            <input
                type='search'
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={admin ? 'Rechercher un établissement, une ville…' : 'Rechercher une demande, un étudiant…'}
                aria-label='Rechercher'
            />
        </form>
    )
}

/** Cloche : nouvelles demandes (établissement) ou éléments à traiter (administration). */
function Notifications() {
    const { user } = useAuth()
    const { current } = useEstablishment()
    const admin = user?.role === 'admin'
    const hasInbox = !!current?.plan.features.inquiryInbox
    const { data: inbox } = useApi<{ counts?: { new?: number } }>(!admin && hasInbox ? `/establishments/${current?.id}/inquiries` : null, { perPage: 1 })
    const { data: overview } = useApi<{ data: { queues: Record<string, number> } }>(admin ? '/admin/overview' : null, { days: 7 })
    if (!admin && !hasInbox) return null
    const count = admin ? Object.values(overview?.data.queues ?? {}).reduce((sum, n) => sum + n, 0) : (inbox?.counts?.new ?? 0)
    const label = admin ? `${count} élément${count > 1 ? 's' : ''} à traiter` : `${count} nouvelle${count > 1 ? 's' : ''} demande${count > 1 ? 's' : ''}`

    return (
        <CNavItem>
            <Link href={admin ? '/dashboard/' : '/demandes/?status=new'} className='nav-link position-relative' aria-label={label} title={label}>
                <CIcon icon={cilBell} size='lg' />
                {count > 0 && <span className='bo-bell-count'>{count > 99 ? '99+' : count}</span>}
            </Link>
        </CNavItem>
    )
}

export default function AppHeader() {
    const headerRef = useRef<HTMLDivElement>(null)
    const { colorMode, setColorMode } = useColorModes('edumada-backoffice-theme')
    const { sidebarShow, setSidebarShow } = useLayout()

    useEffect(() => {
        const handleScroll = () => headerRef.current?.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
        document.addEventListener('scroll', handleScroll)
        return () => document.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <CHeader position='sticky' className='mb-4 p-0' ref={headerRef}>
            <CContainer className='border-bottom px-3 px-md-4 flex-nowrap' fluid>
                <CHeaderToggler onClick={() => setSidebarShow(!sidebarShow)} style={{ marginInlineStart: '-14px' }} aria-label='Menu'>
                    <CIcon icon={cilMenu} size='lg' />
                </CHeaderToggler>
                <CHeaderNav className='d-flex align-items-center gap-3 me-auto ms-1 ms-md-2 min-w-0'>
                    <HeaderSearch />
                    <EstablishmentSwitcher />
                </CHeaderNav>
                <CHeaderNav className='ms-auto'>
                    <Notifications />
                    <CNavItem className='d-none d-md-block'>
                        <a href={SITE_URL} target='_blank' rel='noopener noreferrer' className='nav-link' aria-label='Ouvrir le site Edumada'>
                            <CIcon icon={cilExternalLink} size='lg' />
                        </a>
                    </CNavItem>
                </CHeaderNav>
                <CHeaderNav>
                    <li className='nav-item py-1'>
                        <div className='vr h-100 mx-2 text-body text-opacity-75'></div>
                    </li>
                    <CDropdown variant='nav-item' placement='bottom-end'>
                        <CDropdownToggle caret={false} aria-label='Thème'>
                            <CIcon icon={colorMode === 'dark' ? cilMoon : colorMode === 'auto' ? cilContrast : cilSun} size='lg' />
                        </CDropdownToggle>
                        <CDropdownMenu>
                            {(
                                [
                                    ['light', cilSun, 'Clair'],
                                    ['dark', cilMoon, 'Sombre'],
                                    ['auto', cilContrast, 'Automatique'],
                                ] as const
                            ).map(([mode, icon, label]) => (
                                <CDropdownItem key={mode} active={colorMode === mode} as='button' type='button' onClick={() => setColorMode(mode)}>
                                    <CIcon className='me-2' icon={icon as unknown as string[]} size='lg' /> {label}
                                </CDropdownItem>
                            ))}
                        </CDropdownMenu>
                    </CDropdown>
                    <li className='nav-item py-1'>
                        <div className='vr h-100 mx-2 text-body text-opacity-75'></div>
                    </li>
                    <AppHeaderDropdown />
                </CHeaderNav>
            </CContainer>
            <CContainer className='px-4' fluid>
                <AppBreadcrumb />
            </CContainer>
        </CHeader>
    )
}
