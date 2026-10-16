'use client'
import { useState } from 'react'
import Link from 'next/link'
import { CButton, CCard, CCardBody, CCardFooter, CCol, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow, CWidgetStatsF } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBullhorn, cilCheckCircle, cilInbox, cilPhone, cilScreenDesktop } from '@coreui/icons'
import { useCurrentEstablishment } from '@/context/EstablishmentContext'
import { useApi } from '@/lib/useApi'
import { formatDate, formatNumber, percentChange } from '@/lib/format'
import type { EstablishmentStats } from '@/lib/types'
import { EmptyState, Loading, PageCard } from '@/components/ui'
import PageBanner from '@/components/PageBanner'
import { ChartLegend, TrafficChart, type ChartDataset } from '../dashboard/charts'
import { PeriodSwitch } from '../dashboard/Dashboard'

const trendText = (current: number, previous?: number | null) => {
    const change = percentChange(current, previous)
    return change === null ? 'pas de période précédente comparable' : `${change > 0 ? '+' : ''}${change} % vs période précédente`
}

const DATASETS: ChartDataset[] = [
    { key: 'views', label: 'Vues', color: 'primary' },
    { key: 'contactClicks', label: 'Clics de contact', color: 'success' },
    { key: 'inquiries', label: 'Demandes', color: 'danger' },
]

export default function Stats() {
    const { current: e } = useCurrentEstablishment()
    const [days, setDays] = useState(30)
    const level = e.plan.features.statistics ?? 'none'
    const { data, error } = useApi<EstablishmentStats>(level === 'none' ? null : `/establishments/${e.id}/stats`, { days })

    if (level === 'none') {
        return (
            <>
                <PageBanner />
                <PageCard>
                    <EmptyState
                        title='Inclus dans Pro et Premium'
                        action={
                            <CButton color='primary' as={Link} href='/formule/'>
                                Voir les formules
                            </CButton>
                        }
                    >
                        Combien de personnes consultent vos offres, cliquent pour vous contacter, envoient une demande ? Standard avec Pro, avancées (campagnes) avec Premium.
                    </EmptyState>
                </PageCard>
            </>
        )
    }
    if (!data) return error ? <PageCard>{String(error.message)}</PageCard> : <Loading />
    const s = data.data
    const t = s.totals
    const p = s.previousTotals
    const processed = t.inquiries + t.applications ? Math.round((t.processed / (t.inquiries + t.applications)) * 100) : null

    const tiles = [
        { icon: cilScreenDesktop, chip: '', title: 'Vues des fiches', value: formatNumber(t.views), footer: trendText(t.views, p?.views) },
        {
            icon: cilPhone,
            chip: 'chip-sage',
            title: 'Clics de contact',
            value: formatNumber(t.contactClicks + t.websiteClicks),
            footer: trendText(t.contactClicks + t.websiteClicks, p ? p.contactClicks + p.websiteClicks : 0),
        },
        { icon: cilInbox, chip: 'chip-red', title: 'Demandes reçues', value: formatNumber(t.inquiries + t.applications), footer: `dont ${t.applications} candidature(s)` },
        { icon: cilCheckCircle, chip: 'chip-gold', title: 'Demandes traitées', value: processed === null ? '—' : `${processed} %`, footer: 'statut changé au moins une fois' },
    ]

    return (
        <>
            <PageBanner description={`Du ${formatDate(s.period.from)} au ${formatDate(s.period.to)}`} />
            <CRow xs={{ gutter: 4 }} className='mb-4'>
                {tiles.map((tile) => (
                    <CCol sm={6} xl={3} key={tile.title}>
                        <CWidgetStatsF
                            className='h-100'
                            icon={
                                <span className={`bo-icon-chip ${tile.chip}`}>
                                    <CIcon width={24} icon={tile.icon} size='xl' />
                                </span>
                            }
                            padding={false}
                            title={tile.title}
                            value={tile.value}
                            footer={<span className='small text-body-secondary'>{tile.footer}</span>}
                        />
                    </CCol>
                ))}
            </CRow>

            <CCard className='mb-4'>
                <CCardBody>
                    <div className='d-flex flex-wrap align-items-start gap-2'>
                        <div className='me-auto'>
                            <h4 className='card-title mb-0'>Évolution</h4>
                            <div className='small text-body-secondary'>{days} derniers jours</div>
                        </div>
                        <PeriodSwitch days={days} onChange={setDays} />
                    </div>
                    <TrafficChart series={s.series} datasets={DATASETS} />
                </CCardBody>
                <CCardFooter>
                    <ChartLegend series={s.series} datasets={DATASETS} />
                </CCardFooter>
            </CCard>

            <PageCard title='Par offre' subtitle='Les offres qui génèrent le plus de demandes en premier'>
                <CTable align='middle' hover responsive className='mb-0'>
                    <CTableHead>
                        <CTableRow>
                            <CTableHeaderCell>Offre</CTableHeaderCell>
                            <CTableHeaderCell className='text-end'>Vues</CTableHeaderCell>
                            <CTableHeaderCell className='text-end'>Contacts</CTableHeaderCell>
                            <CTableHeaderCell className='text-end'>Demandes</CTableHeaderCell>
                        </CTableRow>
                    </CTableHead>
                    <CTableBody>
                        {s.offers.map((o) => (
                            <CTableRow key={o.id}>
                                <CTableDataCell>{o.title}</CTableDataCell>
                                <CTableDataCell className='text-end'>{o.views}</CTableDataCell>
                                <CTableDataCell className='text-end'>{o.contactClicks}</CTableDataCell>
                                <CTableDataCell className='text-end fw-semibold'>{o.inquiries}</CTableDataCell>
                            </CTableRow>
                        ))}
                    </CTableBody>
                </CTable>
            </PageCard>

            {s.level === 'advanced' && (
                <PageCard title='Campagnes' subtitle="Demandes reçues pour l'offre promue pendant la campagne : attribution indicative">
                    {!s.campaigns?.length ? (
                        <EmptyState
                            title='Aucune campagne'
                            action={
                                <CButton color='primary' as={Link} href='/campagnes/'>
                                    <CIcon icon={cilBullhorn} className='me-2' />
                                    Créer une campagne
                                </CButton>
                            }
                        />
                    ) : (
                        <CTable align='middle' responsive className='mb-0'>
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell>Campagne</CTableHeaderCell>
                                    <CTableHeaderCell className='text-end'>Impressions</CTableHeaderCell>
                                    <CTableHeaderCell className='text-end'>Clics</CTableHeaderCell>
                                    <CTableHeaderCell className='text-end'>Taux de clic</CTableHeaderCell>
                                    <CTableHeaderCell className='text-end'>Demandes</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {s.campaigns.map((c) => (
                                    <CTableRow key={c.id}>
                                        <CTableDataCell>
                                            {c.title}
                                            <div className='small text-body-secondary'>
                                                {c.offer} · {c.startsOn} → {c.endsOn}
                                            </div>
                                        </CTableDataCell>
                                        <CTableDataCell className='text-end'>{c.impressions}</CTableDataCell>
                                        <CTableDataCell className='text-end'>{c.clicks}</CTableDataCell>
                                        <CTableDataCell className='text-end'>{c.clickRate === null ? '—' : `${c.clickRate} %`}</CTableDataCell>
                                        <CTableDataCell className='text-end'>{c.inquiriesDuring}</CTableDataCell>
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
