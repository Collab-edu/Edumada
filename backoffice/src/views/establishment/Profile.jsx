import React, { useState } from 'react'
import { CAlert, CBadge, CButton, CCol, CListGroup, CListGroupItem, CRow } from '@coreui/react'
import { useEstablishment } from '../../context/EstablishmentContext'
import { useToast } from '../../context/ToastContext'
import { api } from '../../lib/api'
import { useApi } from '../../lib/useApi'
import { formatDate, formatDateTime } from '../../lib/format'
import { PageCard, StatusBadge } from '../../components/ui'
import EstablishmentForm from './EstablishmentForm'

const Profile = () => {
  const { current: e, reload } = useEstablishment()
  const toast = useToast()
  const { data: reports } = useApi(`/establishments/${e.id}/reports`)
  const [requesting, setRequesting] = useState(false)
  const open = (reports?.data ?? []).filter((r) => r.status === 'open')

  const requestVerification = async () => {
    setRequesting(true)
    try {
      await api(`/establishments/${e.id}/verification-request`, { method: 'POST' })
      toast.success('Demande envoyée : Edumada vous contactera pour la vérification.')
      reload()
    } catch (err) {
      toast.error(err.summary ?? err.message)
    } finally {
      setRequesting(false)
    }
  }

  return (
    <CRow>
      <CCol xl={8}>
        {e.status === 'pending_review' && (
          <CAlert color="info">
            Fiche en cours de validation par Edumada : elle sera visible sur le site dès sa
            publication.
          </CAlert>
        )}
        {e.status === 'suspended' && (
          <CAlert color="danger">Fiche suspendue : elle n&apos;apparaît plus sur le site.</CAlert>
        )}
        <EstablishmentForm key={e.updatedAt} establishment={e} onSaved={() => reload()} />
      </CCol>
      <CCol xl={4}>
        <PageCard title="Statut">
          <CListGroup flush>
            <CListGroupItem className="d-flex justify-content-between px-0">
              Publication <StatusBadge status={e.status}>{e.statusLabel}</StatusBadge>
            </CListGroupItem>
            <CListGroupItem className="d-flex justify-content-between px-0">
              Formule <CBadge color="info">{e.plan.name}</CBadge>
            </CListGroupItem>
            <CListGroupItem className="d-flex justify-content-between px-0">
              Vérification{' '}
              <StatusBadge
                status={
                  e.verification.status === 'Vérifié'
                    ? 'approved'
                    : e.verification.status === 'En cours'
                      ? 'pending'
                      : 'draft'
                }
              >
                {e.verification.status}
              </StatusBadge>
            </CListGroupItem>
            <CListGroupItem className="d-flex justify-content-between px-0">
              Dernière mise à jour{' '}
              <span className="text-body-secondary">{formatDate(e.updatedAt)}</span>
            </CListGroupItem>
          </CListGroup>
          {e.verification.status === 'Non vérifié' && (
            <CButton
              color="primary"
              variant="outline"
              className="mt-3 w-100"
              disabled={requesting}
              onClick={requestVerification}
            >
              Demander le badge « vérifié »
            </CButton>
          )}
          <p className="small text-body-secondary mt-3 mb-0">
            Le badge est attribué après un contrôle réel par Edumada ; il ne s&apos;achète pas.
          </p>
        </PageCard>

        <PageCard title="Signalements" subtitle="Informations jugées inexactes par des visiteurs">
          {open.length === 0 ? (
            <p className="text-body-secondary mb-0">Aucun signalement ouvert.</p>
          ) : (
            <CListGroup flush>
              {open.map((r) => (
                <CListGroupItem key={r.id} className="px-0">
                  <div className="d-flex justify-content-between">
                    <CBadge color="danger">{r.reasonLabel}</CBadge>
                    <span className="small text-body-secondary">{formatDateTime(r.createdAt)}</span>
                  </div>
                  {r.offer && <div className="small fw-semibold mt-1">{r.offer.title}</div>}
                  <div className="mt-1">{r.message}</div>
                </CListGroupItem>
              ))}
            </CListGroup>
          )}
        </PageCard>

        {e.members && (
          <PageCard title="Équipe" subtitle="Pour ajouter un collègue, écrivez à Edumada">
            <CListGroup flush>
              {e.members.map((m) => (
                <CListGroupItem
                  key={m.id}
                  className="d-flex justify-content-between align-items-center px-0"
                >
                  <div>
                    <div className="fw-semibold">{m.name}</div>
                    <div className="small text-body-secondary">{m.email}</div>
                  </div>
                  <CBadge color="secondary">
                    {m.role === 'owner' ? 'Propriétaire' : 'Éditeur'}
                  </CBadge>
                </CListGroupItem>
              ))}
            </CListGroup>
          </PageCard>
        )}
      </CCol>
    </CRow>
  )
}

export default Profile
