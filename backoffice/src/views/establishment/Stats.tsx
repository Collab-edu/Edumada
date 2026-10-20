'use client'
import { useState } from 'react'
import Link from 'next/link'
import { CButton, CCol, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBullhorn, cilCheckCircle, cilInbox, cilPhone, cilScreenDesktop } from '@coreui/icons'
import { useCurrentEstablishment } from '@/context/EstablishmentContext'
import { useApi } from '@/lib/useApi'
import { formatDate, formatDay, formatNumber, percentChange } from '@/lib/format'
import type { EstablishmentStats } from '@/lib/types'
import { EmptyState, Loading, PageCard } from '@/components/ui'
import PageBanner from '@/components/PageBanner'
import { ChartCard, KpiCard } from '../dashboard/charts'
import { PeriodSwitch } from '../dashboard/Dashboard'

/** Couleurs de la charte pour les graphiques. */
const COLORS = { teal: '#0f4c5c', sage: '#2f9e74', red: '#ff3b52' }

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0)

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

    const contacts = t.contactClicks + t.websiteClicks
    const requests = t.inquiries + t.applications
    const comparison = p ? 'vs période précédente' : 'aucune période à comparer'
    const period = `Du ${formatDate(s.period.from)} au ${formatDate(s.period.to)}`
    const shortPeriod = `${formatDay(s.period.from)} → ${formatDay(s.period.to)}`
    const best = (key: string) => {
        const top = [...s.series].sort((x, y) => Number(y[key] ?? 0) - Number(x[key] ?? 0))[0]
        return top && Number(top[key] ?? 0) > 0 ? ` · pic le ${formatDay(String(top.date))}` : ''
    }

    const tiles = [
        { icon: cilScreenDesktop, title: 'Vues des fiches', value: formatNumber(t.views), change: p ? percentChange(t.views, p.views) : null, caption: comparison },
        {
            icon: cilPhone,
            title: 'Clics de contact',
            value: formatNumber(contacts),
            change: p ? percentChange(contacts, p.contactClicks + p.websiteClicks) : null,
            caption: comparison,
        },
        {
            icon: cilInbox,
            title: 'Demandes reçues',
            value: formatNumber(requests),
            change: p ? percentChange(requests, p.inquiries + p.applications) : null,
            caption: `dont ${t.applications} candidature${t.applications > 1 ? 's' : ''}`,
        },
        { icon: cilCheckCircle, title: 'Demandes traitées', value: processed === null ? '—' : `${processed} %`, change: null, caption: 'avec un statut mis à jour' },
    ]

    return (
        <>
            <PageBanner description={period} actions={<PeriodSwitch days={days} onChange={setDays} />} />
            <CRow xs={{ gutter: 4 }} className='mb-4'>
                {tiles.map((tile) => (
                    <CCol sm={6} xl={3} key={tile.title}>
                        <KpiCard icon={<CIcon icon={tile.icon} size='lg' />} title={tile.title} value={tile.value} change={tile.change} caption={tile.caption} />
                    </CCol>
                ))}
            </CRow>

            <CRow xs={{ gutter: 4 }} className='mb-4'>
                <CCol lg={4}>
                    <ChartCard
                        series={s.series}
                        dataKey='views'
                        type='bar'
                        color={COLORS.teal}
                        title='Vues des fiches'
                        subtitle={`${formatNumber(sum(s.series.map((x) => Number(x.views ?? 0))))} vues sur ${days} jours${best('views')}`}
                        footer={shortPeriod}
                    />
                </CCol>
                <CCol lg={4}>
                    <ChartCard
                        series={s.series}
                        dataKey='contactClicks'
                        color={COLORS.sage}
                        title='Clics de contact'
                        subtitle={`Appels, e-mails et visites de votre site${best('contactClicks')}`}
                        footer={shortPeriod}
                    />
                </CCol>
                <CCol lg={4}>
                    <ChartCard
                        series={s.series}
                        dataKey='inquiries'
                        color={COLORS.red}
                        title='Demandes reçues'
                        subtitle={`Demandes d’information et candidatures${best('inquiries')}`}
                        footer={shortPeriod}
                    />
                </CCol>
            </CRow>

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
