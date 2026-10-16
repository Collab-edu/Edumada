import React, { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
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
  CNavLink,
  useColorModes,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBank,
  cilContrast,
  cilExternalLink,
  cilInbox,
  cilMenu,
  cilMoon,
  cilSun,
} from '@coreui/icons'

import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'
import { useAuth } from '../context/AuthContext'
import { useEstablishment } from '../context/EstablishmentContext'
import { SITE_URL } from '../lib/api'

/** Choix de l'établissement géré (plusieurs fiches, ou administrateur). */
function EstablishmentSwitcher() {
  const { user } = useAuth()
  const { establishments, current, select, leave } = useEstablishment()
  if (!current && user.role !== 'admin') return null

  return (
    <CDropdown variant="nav-item" placement="bottom-start">
      <CDropdownToggle
        className="d-flex align-items-center gap-2 text-truncate"
        style={{ maxWidth: 'min(320px, 42vw)' }}
      >
        <CIcon icon={cilBank} />
        <span className="text-truncate">{current ? current.name : 'Aucun établissement géré'}</span>
        {current && (
          <CBadge
            color={
              current.plan.code === 'free'
                ? 'secondary'
                : current.plan.code === 'pro'
                  ? 'info'
                  : 'primary'
            }
            className="d-none d-md-inline"
          >
            {current.plan.name}
          </CBadge>
        )}
      </CDropdownToggle>
      <CDropdownMenu>
        {establishments.length > 0 && (
          <CDropdownHeader className="bg-body-secondary fw-semibold">
            Mes établissements
          </CDropdownHeader>
        )}
        {establishments.map((e) => (
          <CDropdownItem
            key={e.id}
            as="button"
            active={current?.id === e.id}
            onClick={() => select(e.id)}
          >
            {e.name}
          </CDropdownItem>
        ))}
        {user.role === 'admin' && (
          <CDropdownItem href="#/admin/etablissements">Choisir dans la liste…</CDropdownItem>
        )}
        {current && (
          <>
            <CDropdownDivider />
            {current.status === 'published' && (
              <CDropdownItem
                href={`${SITE_URL}/etablissements/${current.id}/`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <CIcon icon={cilExternalLink} className="me-2" />
                Voir la fiche sur le site
              </CDropdownItem>
            )}
            {user.role === 'admin' && (
              <CDropdownItem as="button" onClick={leave}>
                Arrêter de gérer cette fiche
              </CDropdownItem>
            )}
          </>
        )}
      </CDropdownMenu>
    </CDropdown>
  )
}

const AppHeader = () => {
  const headerRef = useRef()
  const { colorMode, setColorMode } = useColorModes('edumada-backoffice-theme')
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const { current } = useEstablishment()

  useEffect(() => {
    const handleScroll = () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    }
    document.addEventListener('scroll', handleScroll)
    return () => document.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <CHeader position="sticky" className="mb-4 p-0" ref={headerRef}>
      <CContainer className="border-bottom px-3 px-md-4 flex-nowrap" fluid>
        <CHeaderToggler
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
          style={{ marginInlineStart: '-14px' }}
          aria-label="Menu"
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>
        <CHeaderNav className="d-flex me-auto ms-1 ms-md-2 min-w-0 overflow-hidden">
          <EstablishmentSwitcher />
        </CHeaderNav>
        <CHeaderNav className="ms-auto">
          {current?.plan.features.inquiryInbox && (
            <CNavItem>
              <CNavLink href="#/demandes" aria-label="Demandes">
                <CIcon icon={cilInbox} size="lg" />
              </CNavLink>
            </CNavItem>
          )}
          <CNavItem className="d-none d-md-block">
            <CNavLink
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ouvrir le site Edumada"
            >
              <CIcon icon={cilExternalLink} size="lg" />
            </CNavLink>
          </CNavItem>
        </CHeaderNav>
        <CHeaderNav>
          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>
          <CDropdown variant="nav-item" placement="bottom-end">
            <CDropdownToggle caret={false} aria-label="Thème">
              {colorMode === 'dark' ? (
                <CIcon icon={cilMoon} size="lg" />
              ) : colorMode === 'auto' ? (
                <CIcon icon={cilContrast} size="lg" />
              ) : (
                <CIcon icon={cilSun} size="lg" />
              )}
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem
                active={colorMode === 'light'}
                as="button"
                type="button"
                onClick={() => setColorMode('light')}
              >
                <CIcon className="me-2" icon={cilSun} size="lg" /> Clair
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === 'dark'}
                as="button"
                type="button"
                onClick={() => setColorMode('dark')}
              >
                <CIcon className="me-2" icon={cilMoon} size="lg" /> Sombre
              </CDropdownItem>
              <CDropdownItem
                active={colorMode === 'auto'}
                as="button"
                type="button"
                onClick={() => setColorMode('auto')}
              >
                <CIcon className="me-2" icon={cilContrast} size="lg" /> Automatique
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
          <li className="nav-item py-1">
            <div className="vr h-100 mx-2 text-body text-opacity-75"></div>
          </li>
          <AppHeaderDropdown />
        </CHeaderNav>
      </CContainer>
      <CContainer className="px-4" fluid>
        <AppBreadcrumb />
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
