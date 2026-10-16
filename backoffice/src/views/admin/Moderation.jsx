import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CFormSelect,
  CNav,
  CNavItem,
  CNavLink,
} from '@coreui/react'
import { useToast } from '../../context/ToastContext'
import { api, SITE_URL } from '../../lib/api'
import { useApi } from '../../lib/useApi'
import { formatDateTime } from '../../lib/format'
import { EmptyState, Loading, PageCard, Pager, StatusBadge } from '../../components/ui'

const TABS = [
  ['claims', 'Revendications', '/admin/claims', 'pending'],
  ['reviews', 'Avis', '/admin/reviews', 'pending'],
  ['reports', 'Signalements', '/admin/reports', 'open'],
]

const Moderation = () => {
  const [params] = useSearchParams()
  const toast = useToast()
  const [tab, setTab] = useState(params.get('tab') ?? 'claims')
  const [onlyPending, setOnlyPending] = useState(true)
  const [page, setPage] = useState(1)
  const [, , path, pendingStatus] = TABS.find((t) => t[0] === tab)
  const { data, reload } = useApi(path, { status: onlyPending ? pendingStatus : '', page })

  const act = async (url, status, message) => {
    try {
      await api(url, { method: 'PUT', body: { status } })
      toast.success(message)
      reload()
    } catch (err) {
      toast.error(err.summary ?? err.message)
    }
  }

  return (
    <PageCard
      title="Modération"
      actions={
        <CFormSelect
          size="sm"
          style={{ width: 'auto' }}
          value={onlyPending ? 'pending' : 'all'}
          onChange={(e) => setOnlyPending(e.target.value === 'pending')}
          aria-label="Afficher"
        >
          <option value="pending">À traiter</option>
          <option value="all">Tout</option>
        </CFormSelect>
      }
    >
      <CNav variant="underline-border" className="mb-3">
        {TABS.map(([value, label]) => (
          <CNavItem key={value}>
            <CNavLink
              as="button"
              active={tab === value}
              onClick={() => {
                setTab(value)
                setPage(1)
              }}
            >
              {label}
            </CNavLink>
          </CNavItem>
        ))}
      </CNav>

      {!data ? (
        <Loading />
      ) : data.data.length === 0 ? (
        <EmptyState title="Rien à traiter" />
      ) : (
        <>
          {tab === 'claims' &&
            data.data.map((c) => (
              <CCard key={c.id} className="mb-3">
                <CCardBody>
                  <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                    <StatusBadge status={c.status}>{c.statusLabel}</StatusBadge>
                    <span className="small text-body-secondary">{formatDateTime(c.createdAt)}</span>
                  </div>
                  <h6>
                    {c.user.name} demande à gérer « {c.establishment.name} »
                  </h6>
                  <div className="small text-body-secondary mb-2">
                    {c.user.email}
                    {c.user.phone ? ` · ${c.user.phone}` : ''} — e-mail officiel de la fiche :{' '}
                    {c.establishment.email ?? 'non renseigné'}
                  </div>
                  <p className="bg-body-tertiary rounded p-2">{c.message}</p>
                  {c.status === 'pending' && (
                    <>
                      <CButton
                        color="success"
                        size="sm"
                        className="me-2 text-white"
                        onClick={() => act(`/admin/claims/${c.id}`, 'approved', 'Accès accordé')}
                      >
                        Accepter
                      </CButton>
                      <CButton
                        color="secondary"
                        variant="outline"
                        size="sm"
                        onClick={() => act(`/admin/claims/${c.id}`, 'rejected', 'Demande refusée')}
                      >
                        Refuser
                      </CButton>
                    </>
                  )}
                </CCardBody>
              </CCard>
            ))}
          {tab === 'reviews' &&
            data.data.map((r) => (
              <CCard key={r.id} className="mb-3">
                <CCardBody>
                  <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                    <StatusBadge
                      status={
                        r.moderation === 'pending'
                          ? 'pending'
                          : r.moderation === 'published'
                            ? 'published'
                            : 'rejected'
                      }
                    >
                      {r.moderationLabel}
                    </StatusBadge>
                    <CBadge color="warning" textColor="dark">
                      {r.rating} / 5
                    </CBadge>
                  </div>
                  <h6>
                    {r.schoolName}
                    {r.formationTitle ? ` — ${r.formationTitle}` : ''}
                  </h6>
                  <p>« {r.quote} »</p>
                  <div className="small text-body-secondary mb-2">
                    {r.name}
                    {r.status ? ` · ${r.status}` : ''}
                  </div>
                  {r.moderation !== 'published' && (
                    <CButton
                      color="success"
                      size="sm"
                      className="me-2 text-white"
                      onClick={() => act(`/admin/reviews/${r.id}`, 'published', 'Avis publié')}
                    >
                      Publier
                    </CButton>
                  )}
                  {r.moderation !== 'rejected' && (
                    <CButton
                      color="secondary"
                      variant="outline"
                      size="sm"
                      onClick={() => act(`/admin/reviews/${r.id}`, 'rejected', 'Avis refusé')}
                    >
                      Refuser
                    </CButton>
                  )}
                </CCardBody>
              </CCard>
            ))}
          {tab === 'reports' &&
            data.data.map((r) => (
              <CCard key={r.id} className="mb-3">
                <CCardBody>
                  <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                    <StatusBadge status={r.status}>{r.statusLabel}</StatusBadge>
                    <CBadge color="info">{r.reasonLabel}</CBadge>
                    <span className="small text-body-secondary">{formatDateTime(r.createdAt)}</span>
                  </div>
                  <h6>
                    <a
                      href={`${SITE_URL}/${r.offer ? `formations/${r.offer.id}` : `etablissements/${r.establishment.id}`}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {r.establishment.name}
                      {r.offer ? ` — ${r.offer.title}` : ''}
                    </a>
                  </h6>
                  <p>{r.message}</p>
                  {r.email && (
                    <div className="small text-body-secondary mb-2">Contact : {r.email}</div>
                  )}
                  {r.status === 'open' && (
                    <>
                      <CButton
                        color="success"
                        size="sm"
                        className="me-2 text-white"
                        onClick={() =>
                          act(`/admin/reports/${r.id}`, 'resolved', 'Signalement clôturé')
                        }
                      >
                        Corrigé
                      </CButton>
                      <CButton
                        color="secondary"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          act(`/admin/reports/${r.id}`, 'dismissed', 'Signalement classé')
                        }
                      >
                        Sans suite
                      </CButton>
                    </>
                  )}
                </CCardBody>
              </CCard>
            ))}
          <Pager meta={data.meta} onChange={setPage} />
        </>
      )}
    </PageCard>
  )
}

export default Moderation
