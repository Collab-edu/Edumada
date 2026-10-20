'use client'
import Link from 'next/link'
import { CCloseButton, CSidebar, CSidebarFooter, CSidebarHeader, CSidebarToggler } from '@coreui/react'
import { AppSidebarNav } from './AppSidebarNav'
import { buildNav } from '@/nav'
import { useAuth } from '@/context/AuthContext'
import { useEstablishment } from '@/context/EstablishmentContext'
import { useLayout } from '@/context/LayoutContext'
import { useApi } from '@/lib/useApi'
import { useEstablishmentCounts } from '@/lib/useEstablishmentCounts'

type Overview = { data: { queues: { establishmentsPending: number; verificationsPending: number; claimsPending: number; reviewsPending: number; reportsOpen: number; invoicesPending: number } } }

export default function AppSidebar() {
    const { sidebarShow, setSidebarShow, sidebarUnfoldable, setSidebarUnfoldable } = useLayout()
    const { user } = useAuth()
    const { current } = useEstablishment()

    // Pastilles du menu : nouvelles demandes, files d'attente de l'administration.
    const hasInbox = !!current?.plan.features.inquiryInbox
    const { data: inbox } = useApi<{ counts?: { new?: number } }>(hasInbox ? `/establishments/${current?.id}/inquiries` : null, { perPage: 1 })
    const admin = user?.role === 'admin'
    const { data: overview } = useApi<Overview>(admin ? '/admin/overview' : null, { days: 7 })
    const { data: establishmentCounts } = useEstablishmentCounts(admin)
    const q = overview?.data.queues
    const counts = {
        newInquiries: inbox?.counts?.new,
        // Nouvelles demandes d'adhésion (fiches en attente de validation).
        establishments: establishmentCounts?.data.total.new,
        moderation: q && q.claimsPending + q.reviewsPending + q.reportsOpen,
        invoices: q?.invoicesPending,
    }

    // Sur mobile, la barre se referme après un choix.
    const closeOnMobile = () => {
        if (window.matchMedia('(max-width: 991.98px)').matches) setSidebarShow(false)
    }

    return (
        <CSidebar
            colorScheme='dark'
            position='fixed'
            unfoldable={sidebarUnfoldable}
            visible={sidebarShow}
            onVisibleChange={(visible) => setSidebarShow(visible)}
        >
            <CSidebarHeader className='border-bottom'>
                <Link href='/dashboard/' className='sidebar-brand text-decoration-none d-flex align-items-center gap-2' onClick={closeOnMobile}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src='/edumada-logo-white.svg' alt='Edumada' height={34} className='sidebar-brand-full' />
                    <span className='sidebar-brand-full small text-uppercase fw-semibold ms-1' style={{ color: 'var(--edu-sage)' }}>
                        Back-office
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src='/favicon.svg' alt='Edumada' height={30} className='sidebar-brand-narrow' />
                </Link>
                <CCloseButton className='d-lg-none' dark onClick={() => setSidebarShow(false)} />
            </CSidebarHeader>
            <AppSidebarNav items={buildNav({ user, current, counts, categories: establishmentCounts?.data.categories })} onNavigate={closeOnMobile} />
            <CSidebarFooter className='border-top d-none d-lg-flex'>
                <CSidebarToggler onClick={() => setSidebarUnfoldable(!sidebarUnfoldable)} aria-label='Réduire le menu' />
            </CSidebarFooter>
        </CSidebar>
    )
}
