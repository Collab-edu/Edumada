import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CAlert,
  CBadge,
  CButton,
  CButtonGroup,
  CDropdown,
  CDropdownDivider,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus } from '@coreui/icons'
import { useEstablishment } from '../../context/EstablishmentContext'
import { useToast } from '../../context/ToastContext'
import { api, SITE_URL } from '../../lib/api'
import { formatAriary, formatDateTime } from '../../lib/format'
import { EmptyState, PageCard, StatusBadge } from '../../components/ui'

const FILTERS = [
  ['all', 'Toutes'],
  ['published', 'Publiées'],
  ['draft', 'Brouillons'],
  ['archived', 'Archivées'],
]

const Offers = () => {
  const { current: e, reload } = useEstablishment()
  const toast = useToast()
  const [filter, setFilter] = useState('all')
  const offers = (e.offers ?? []).filter((o) => filter === 'all' || o.status === filter)
  const limit = e.plan.maxPublishedOffers
  const atLimit = limit !== null && e.publishedOffersCount >= limit

  const run = async (action, message) => {
    try {
      await action()
      toast.success(message)
      reload()
    } catch (err) {
      toast.error(err.summary ?? err.message)
    }
  }
  const setStatus = (offer, status) =>
    run(
      () => api(`/offers/${offer.id}`, { method: 'PATCH', body: { status } }),
      status === 'published'
        ? 'Offre publiée'
        : status === 'archived'
          ? 'Offre archivée'
          : 'Offre repassée en brouillon',
    )
  const remove = (offer) =>
    window.confirm(`Supprimer « ${offer.title} » ?`) &&
    run(() => api(`/offers/${offer.id}`, { method: 'DELETE' }), 'Offre supprimée')

  return (
    <PageCard
      title="Offres"
      subtitle={
        limit
          ? `${e.publishedOffersCount} publiée(s) sur ${limit} avec la formule ${e.plan.name}`
          : `Formule ${e.plan.name} : offres illimitées`
      }
      actions={
        <CButton color="primary" as={Link} to="/offres/nouvelle">
          <CIcon icon={cilPlus} className="me-2" />
          Nouvelle offre
        </CButton>
      }
    >
      {atLimit && (
        <CAlert color="warning">
          Limite de la formule {e.plan.name} atteinte : les nouvelles offres restent en brouillon.{' '}
          <Link to="/formule">Passer à Pro</Link> pour publier sans limite.
        </CAlert>
      )}
      <CButtonGroup className="mb-3" role="group" aria-label="Filtrer">
        {FILTERS.map(([value, label]) => (
          <CButton
            key={value}
            color="outline-secondary"
            active={filter === value}
            onClick={() => setFilter(value)}
          >
            {label}
          </CButton>
        ))}
      </CButtonGroup>

      {offers.length === 0 ? (
        <EmptyState
          title="Aucune offre ici"
          action={
            <CButton color="primary" as={Link} to="/offres/nouvelle">
              Ajouter une offre
            </CButton>
          }
        >
          Formations, niveaux scolaires ou modes d&apos;accueil : ils apparaîtront dans la recherche
          du site.
        </EmptyState>
      ) : (
        <CTable align="middle" hover responsive className="mb-0 border">
          <CTableHead className="text-nowrap">
            <CTableRow>
              <CTableHeaderCell className="bg-body-tertiary">Offre</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary">Statut</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary">Inscriptions</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary">Frais</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary">Modifiée</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary text-end">Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {offers.map((o) => (
              <CTableRow key={o.id}>
                <CTableDataCell>
                  <div className="d-flex align-items-center gap-3">
                    {o.imageSrc ? (
                      <img src={o.imageSrc} alt="" className="bo-thumb" />
                    ) : (
                      <div className="bo-thumb" />
                    )}
                    <div>
                      <Link to={`/offres/${o.id}`} className="fw-semibold text-decoration-none">
                        {o.title}
                      </Link>
                      <div className="small text-body-secondary">
                        {[o.diploma, o.modality, o.domain].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                  </div>
                </CTableDataCell>
                <CTableDataCell>
                  <StatusBadge status={o.status}>{o.statusLabel}</StatusBadge>
                </CTableDataCell>
                <CTableDataCell>
                  <CBadge
                    color={
                      o.registration === 'Ouvertes'
                        ? 'success'
                        : o.registration === 'À venir'
                          ? 'warning'
                          : 'secondary'
                    }
                  >
                    {o.registration}
                  </CBadge>
                </CTableDataCell>
                <CTableDataCell className="text-nowrap">
                  {o.fees === null
                    ? 'Non communiqués'
                    : `${formatAriary(o.fees)} / ${o.feesPeriod}`}
                </CTableDataCell>
                <CTableDataCell className="small text-body-secondary text-nowrap">
                  {formatDateTime(o.updatedAt)}
                </CTableDataCell>
                <CTableDataCell className="text-end">
                  <CDropdown alignment="end">
                    <CDropdownToggle color="secondary" variant="outline" size="sm">
                      Actions
                    </CDropdownToggle>
                    <CDropdownMenu>
                      <CDropdownItem as={Link} to={`/offres/${o.id}`}>
                        Modifier
                      </CDropdownItem>
                      {o.status !== 'published' && (
                        <CDropdownItem as="button" onClick={() => setStatus(o, 'published')}>
                          Publier
                        </CDropdownItem>
                      )}
                      {o.status === 'published' && (
                        <>
                          <CDropdownItem
                            href={`${SITE_URL}/formations/${o.id}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Voir sur le site
                          </CDropdownItem>
                          <CDropdownItem as="button" onClick={() => setStatus(o, 'draft')}>
                            Repasser en brouillon
                          </CDropdownItem>
                          <CDropdownItem as="button" onClick={() => setStatus(o, 'archived')}>
                            Archiver
                          </CDropdownItem>
                        </>
                      )}
                      {o.status !== 'published' && (
                        <>
                          <CDropdownDivider />
                          <CDropdownItem
                            as="button"
                            className="text-danger"
                            onClick={() => remove(o)}
                          >
                            Supprimer
                          </CDropdownItem>
                        </>
                      )}
                    </CDropdownMenu>
                  </CDropdown>
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      )}
    </PageCard>
  )
}

export default Offers
