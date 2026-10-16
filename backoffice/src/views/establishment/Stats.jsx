import React, { useState } from 'react'
import {
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CWidgetStatsF,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBullhorn, cilCheckCircle, cilInbox, cilPhone, cilScreenDesktop } from '@coreui/icons'
import { useEstablishment } from '../../context/EstablishmentContext'
import { useApi } from '../../lib/useApi'
import { formatNumber, percentChange } from '../../lib/format'
import { EmptyState, Loading, PageCard } from '../../components/ui'
import { ChartLegend, TrafficChart } from '../dashboard/charts'

const trendText = (current, previous) => {
  const change = percentChange(current, previous)
  return change === null
    ? 'pas de période précédente comparable'
    : `${change > 0 ? '+' : ''}${change} % vs période précédente`
}

const Stats = () => {
  const { current: e } = useEstablishment()
  const [days, setDays] = useState(30)
  const level = e.plan.features.statistics ?? 'none'
  const { data, loading } = useApi(level === 'none' ? null : `/establishments/${e.id}/stats`, {
    days,
  })

  if (level === 'none') {
    return (
      <PageCard title="Statistiques">
        <EmptyState
          title="Inclus dans Pro et Premium"
          action={
            <CButton color="primary" href="#/formule">
              Voir les formules
            </CButton>
          }
        >
          Combien de personnes consultent vos offres, cliquent pour vous contacter, envoient une
          demande ? Standard avec Pro, avancées (campagnes) avec Premium.
        </EmptyState>
      </PageCard>
    )
  }
  if (loading && !data) return <Loading />
  const s = data.data
  const t = s.totals
  const p = s.previousTotals
  const processed =
    t.inquiries + t.applications
      ? Math.round((t.processed / (t.inquiries + t.applications)) * 100)
      : null
  const datasets = [
    { key: 'views', label: 'Vues', color: 'info' },
    { key: 'contactClicks', label: 'Clics de contact', color: 'success' },
    { key: 'inquiries', label: 'Demandes', color: 'danger' },
  ]

  return (
    <>
      <CRow xs={{ gutter: 4 }} className="mb-4">
        <CCol sm={6} xl={3}>
          <CWidgetStatsF
            icon={<CIcon width={24} icon={cilScreenDesktop} size="xl" />}
            title="Vues des fiches"
            value={formatNumber(t.views)}
            color="info"
            footer={<span className="small">{trendText(t.views, p?.views)}</span>}
          />
        </CCol>
        <CCol sm={6} xl={3}>
          <CWidgetStatsF
            icon={<CIcon width={24} icon={cilPhone} size="xl" />}
            title="Clics de contact"
            value={formatNumber(t.contactClicks + t.websiteClicks)}
            color="success"
            footer={
              <span className="small">
                {trendText(
                  t.contactClicks + t.websiteClicks,
                  p ? p.contactClicks + p.websiteClicks : 0,
                )}
              </span>
            }
          />
        </CCol>
        <CCol sm={6} xl={3}>
          <CWidgetStatsF
            icon={<CIcon width={24} icon={cilInbox} size="xl" />}
            title="Demandes reçues"
            value={formatNumber(t.inquiries + t.applications)}
            color="danger"
            footer={<span className="small">dont {t.applications} candidature(s)</span>}
          />
        </CCol>
        <CCol sm={6} xl={3}>
          <CWidgetStatsF
            icon={<CIcon width={24} icon={cilCheckCircle} size="xl" />}
            title="Demandes traitées"
            value={processed === null ? '—' : `${processed} %`}
            color="primary"
            footer={<span className="small">statut changé au moins une fois</span>}
          />
        </CCol>
      </CRow>

      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol sm={6}>
              <h4 className="card-title mb-0">Évolution</h4>
              <div className="small text-body-secondary">
                {s.period.from} → {s.period.to}
              </div>
            </CCol>
            <CCol sm={6}>
              <CButtonGroup className="float-end" role="group" aria-label="Période">
                {[7, 30, 90].map((d) => (
                  <CButton
                    key={d}
                    color="outline-secondary"
                    active={days === d}
                    onClick={() => setDays(d)}
                  >
                    {d} jours
                  </CButton>
                ))}
              </CButtonGroup>
            </CCol>
          </CRow>
          <TrafficChart series={s.series} datasets={datasets} />
        </CCardBody>
        <CCardFooter>
          <ChartLegend series={s.series} datasets={datasets} />
        </CCardFooter>
      </CCard>

      <PageCard title="Par offre" subtitle="Les offres qui génèrent le plus de demandes en premier">
        <CTable align="middle" hover responsive className="mb-0 border">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell className="bg-body-tertiary">Offre</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary text-end">Vues</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary text-end">Contacts</CTableHeaderCell>
              <CTableHeaderCell className="bg-body-tertiary text-end">Demandes</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {s.offers.map((o) => (
              <CTableRow key={o.id}>
                <CTableDataCell>{o.title}</CTableDataCell>
                <CTableDataCell className="text-end">{o.views}</CTableDataCell>
                <CTableDataCell className="text-end">{o.contactClicks}</CTableDataCell>
                <CTableDataCell className="text-end fw-semibold">{o.inquiries}</CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </PageCard>

      {s.level === 'advanced' && (
        <PageCard
          title="Campagnes"
          subtitle="Demandes reçues pour l'offre promue pendant la campagne : attribution indicative"
        >
          {!s.campaigns?.length ? (
            <EmptyState
              title="Aucune campagne"
              action={
                <CButton color="primary" href="#/campagnes">
                  <CIcon icon={cilBullhorn} className="me-2" />
                  Créer une campagne
                </CButton>
              }
            />
          ) : (
            <CTable align="middle" responsive className="mb-0 border">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell className="bg-body-tertiary">Campagne</CTableHeaderCell>
                  <CTableHeaderCell className="bg-body-tertiary text-end">
                    Impressions
                  </CTableHeaderCell>
                  <CTableHeaderCell className="bg-body-tertiary text-end">Clics</CTableHeaderCell>
                  <CTableHeaderCell className="bg-body-tertiary text-end">
                    Taux de clic
                  </CTableHeaderCell>
                  <CTableHeaderCell className="bg-body-tertiary text-end">
                    Demandes
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {s.campaigns.map((c) => (
                  <CTableRow key={c.id}>
                    <CTableDataCell>
                      {c.title}
                      <div className="small text-body-secondary">
                        {c.offer} · {c.startsOn} → {c.endsOn}
                      </div>
                    </CTableDataCell>
                    <CTableDataCell className="text-end">{c.impressions}</CTableDataCell>
                    <CTableDataCell className="text-end">{c.clicks}</CTableDataCell>
                    <CTableDataCell className="text-end">
                      {c.clickRate === null ? '—' : `${c.clickRate} %`}
                    </CTableDataCell>
                    <CTableDataCell className="text-end">{c.inquiriesDuring}</CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </PageCard>
      )}
    </>
  )
}

export default Stats
