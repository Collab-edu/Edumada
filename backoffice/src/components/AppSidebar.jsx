import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'

import { AppSidebarNav } from './AppSidebarNav'
import { buildNav } from '../_nav'
import { useAuth } from '../context/AuthContext'
import { useEstablishment } from '../context/EstablishmentContext'
import { useApi } from '../lib/useApi'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const { user } = useAuth()
  const { current } = useEstablishment()

  // Pastilles du menu : nouvelles demandes, files d'attente de l'administration.
  const hasInbox = !!current?.plan.features.inquiryInbox
  const { data: inbox } = useApi(hasInbox ? `/establishments/${current.id}/inquiries` : null, {
    perPage: 1,
  })
  const { data: overview } = useApi(user?.role === 'admin' ? '/admin/overview' : null, { days: 7 })
  const q = overview?.data.queues
  const counts = {
    newInquiries: inbox?.counts?.new,
    establishments: q && q.establishmentsPending + q.verificationsPending,
    moderation: q && q.claimsPending + q.reviewsPending + q.reportsOpen,
    invoices: q?.invoicesPending,
  }

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => dispatch({ type: 'set', sidebarShow: visible })}
    >
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand to="/" className="text-decoration-none d-flex align-items-center gap-2">
          <img
            src="./edumada-logo-white.svg"
            alt="Edumada"
            height={34}
            className="sidebar-brand-full"
          />
          <span className="sidebar-brand-full small text-uppercase fw-semibold text-white-50 ms-1">
            Back-office
          </span>
          <img src="./favicon.svg" alt="Edumada" height={30} className="sidebar-brand-narrow" />
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>
      <AppSidebarNav items={buildNav({ user, current, counts })} />
      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default AppSidebar
