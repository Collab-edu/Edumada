import React, { useState } from 'react'
import {
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { useApi } from '../../lib/useApi'
import { formatDateTime } from '../../lib/format'
import { Loading, PageCard, Pager } from '../../components/ui'

export const ACTION_LABELS = {
  'establishment.moderated': 'Fiche modérée',
  'establishment.deleted': 'Fiche supprimée',
  'establishment.verification_requested': 'Vérification demandée',
  'establishment.claim_approved': 'Revendication acceptée',
  'establishment.claim_rejected': 'Revendication refusée',
  'establishment.member_added': 'Accès donné',
  'establishment.member_removed': 'Accès retiré',
  'offer.status_changed': "Statut d'offre modifié",
  'offer.deleted': 'Offre supprimée',
  'inquiries.exported': 'Export des demandes',
  'subscription.requested': 'Formule demandée',
  'subscription.activated': 'Formule activée',
  'subscription.cancelled': 'Abonnement résilié',
  'subscription.expired': 'Abonnement expiré',
  'invoice.cancelled': 'Facture annulée',
  'plan.updated': 'Formule modifiée',
  'review.moderated': 'Avis modéré',
  'user.role_changed': 'Type de compte modifié',
  'user.deleted': 'Compte supprimé',
  'campaign.created': 'Campagne créée',
}

const AuditLog = () => {
  const [page, setPage] = useState(1)
  const { data } = useApi('/admin/audit-logs', { page })

  return (
    <PageCard
      title="Journal d'audit"
      subtitle="Validations, changements de formule, suppressions et exports"
    >
      {!data ? (
        <Loading />
      ) : (
        <>
          <CTable align="middle" hover responsive className="mb-0 border">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell className="bg-body-tertiary">Date</CTableHeaderCell>
                <CTableHeaderCell className="bg-body-tertiary">Action</CTableHeaderCell>
                <CTableHeaderCell className="bg-body-tertiary">Par</CTableHeaderCell>
                <CTableHeaderCell className="bg-body-tertiary">Détails</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {data.data.map((log) => (
                <CTableRow key={log.id}>
                  <CTableDataCell className="small text-nowrap">
                    {formatDateTime(log.createdAt)}
                  </CTableDataCell>
                  <CTableDataCell>
                    {ACTION_LABELS[log.action] ?? log.action}
                    {log.subjectType && (
                      <div className="small text-body-secondary">
                        {log.subjectType} #{log.subjectId}
                      </div>
                    )}
                  </CTableDataCell>
                  <CTableDataCell>{log.user ? log.user.name : 'Système'}</CTableDataCell>
                  <CTableDataCell>
                    {Object.keys(log.meta).length > 0 && (
                      <code className="small text-wrap">{JSON.stringify(log.meta)}</code>
                    )}
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
          <Pager meta={data.meta} onChange={setPage} />
        </>
      )}
    </PageCard>
  )
}

export default AuditLog
