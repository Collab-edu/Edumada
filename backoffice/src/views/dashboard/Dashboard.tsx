'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
    CAlert,
    CButton,
    CButtonGroup,
    CCard,
    CCardBody,
    CCardFooter,
    CCol,
    CListGroup,
    CListGroupItem,
    CProgress,
    CRow,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
    CWidgetStatsA,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowBottom, cilArrowTop, cilCheckCircle, cilCircle } from '@coreui/icons'
import { useAuth } from '@/context/AuthContext'
import { useEstablishment } from '@/context/EstablishmentContext'
import { useApi } from '@/lib/useApi'
import { formatAriary, formatDate, formatDateTime, formatNumber, percentChange } from '@/lib/format'
import { ACTION_LABELS } from '@/lib/labels'
import type { AuditLog, EstablishmentStats, Inquiry, ManagedEstablishment, Paginated, SeriesPoint } from '@/lib/types'
import { EmptyState, Loading, StatusBadge } from '@/components/ui'
import PageBanner from '@/components/PageBanner'
import { ChartLegend, Sparkline, TrafficChart, type ChartDataset } from './charts'

const PERIODS = [
    { days: 7, label: '7 jours' },
    { days: 30, label: '30 jours' },
    { days: 90, label: '90 jours' },
]

type Overview = {
    data: {
        users: { students: number; establishments: number; newLast30Days: number }
        inquiries: { total: number; processed: number; last30Days: number }
        catalog: { establishments: number; published: number; verified: number; offersPublished: number; offersUpdatedLast90Days: number }
        revenue: { thisMonth: number }
        subscriptions: Record<string, number>
        queues: { establishmentsPending: number; verificationsPending: number; claimsPending: number; reviewsPending: number; reportsOpen: number; invoicesPending: number }
        series: SeriesPoint[]
    }
}

type Inbox = Paginated<Inquiry> & { counts?: Record<string, number> }

const num = (point: SeriesPoint, key: string) => Number(point[key] ?? 0)

function Trend({ value }: { value: number | null }) {
    if (value === null) return null
    return (
        <span className='fs-6 fw-normal'>
            ({value > 0 ? '+' : ''}
            {value} % <CIcon icon={value >= 0 ? cilArrowTop : cilArrowBottom} />)
        </span>
    )
}

export function PeriodSwitch({ days, onChange }: { days: number; onChange: (days: number) => void }) {
    return (
        <CButtonGroup role='group' aria-label='Période' size='sm'>
            {PERIODS.map((p) => (
                <CButton key={p.days} color='primary' variant={days === p.days ? undefined : 'outline'} className='mx-0' onClick={() => onChange(p.days)}>
                    {p.label}
                </CButton>
            ))}
        </CButtonGroup>
    )
}

const blank = <div style={{ height: 86 }} />
const bar = (value: number) => (
    <div className='mt-3 mx-3' style={{ height: 70 }}>
        <CProgress thin color='white' className='bg-white bg-opacity-25 mt-5' value={value} />
    </div>
)

/* ------------------------------------------------------------------ */
/* Établissement                                                       */
/* ------------------------------------------------------------------ */

function EstablishmentDashboard({ e }: { e: ManagedEstablishment }) {
    const [days, setDays] = useState(30)
    const level = e.plan.features.statistics ?? 'none'
    const { data: stats } = useApi<EstablishmentStats>(level === 'none' ? null : `/establishments/${e.id}/stats`, { days })
    const { data: inbox } = useApi<Inbox>(e.plan.features.inquiryInbox ? `/establishments/${e.id}/inquiries` : null, { perPage: 5 })
    const s = stats?.data
    const t = s?.totals
    const p = s?.previousTotals

    const checklist = [
        { done: (e.description ?? '').length > 80, label: 'Présentation de quelques phrases' },
        { done: !!e.imageSrc, label: 'Photo de couverture' },
        // La galerie n'existe qu'avec Pro et Premium.
        ...(e.plan.features.photoGallery ? [{ done: e.photos.length >= 2, label: 'Au moins 2 photos des locaux' }] : []),
        { done: !!e.phone && !!e.email, label: 'Téléphone et e-mail' },
        { done: !!e.coordinates, label: 'Position sur la carte' },
        { done: e.admissionDocuments.length > 0, label: "Pièces demandées à l'inscription" },
        { done: e.publishedOffersCount > 0, label: 'Au moins une offre publiée' },
    ]
    const completion = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100)
    const series = s?.series ?? []
    const datasets: ChartDataset[] = [
        { key: 'views', label: 'Vues', color: 'primary' },
        { key: 'contactClicks', label: 'Clics de contact', color: 'success' },
        { key: 'inquiries', label: 'Demandes', color: 'danger' },
    ]

    return (
        <>
            <PageBanner
                title={e.name}
                description={`Formule ${e.plan.name} · ${e.statusLabel}`}
                actions={
                    <CButton color='light' as={Link} href='/offres/nouvelle/'>
                        Nouvelle offre
                    </CButton>
                }
            />
            {e.requestedPlan && e.requestedPlan.code !== e.plan.code && (
                <CAlert color='warning' className='d-flex flex-wrap align-items-center justify-content-between gap-3'>
                    <div>
                        <strong>Vous avez choisi la formule {e.requestedPlan.name}</strong> ({e.requestedPlan.billingCycle === 'yearly' ? 'annuel' : 'mensuel'}) lors de
                        votre inscription. Votre fiche reste en formule {e.plan.name} tant que le paiement n&apos;est pas confirmé.
                    </div>
                    <CButton color='dark' as={Link} href={`/formule/?plan=${e.requestedPlan.code}&cycle=${e.requestedPlan.billingCycle}`}>
                        Finaliser mon abonnement
                    </CButton>
                </CAlert>
            )}
            <CRow className='mb-4' xs={{ gutter: 4 }}>
                <CCol sm={6} xl={3}>
                    <CWidgetStatsA
                        color='primary'
                        className='bo-widget bo-widget-teal'
                        value={
                            <>
                                {t ? formatNumber(t.views) : '—'} {t && <Trend value={percentChange(t.views, p?.views)} />}
                            </>
                        }
                        title={`Vues (${days} jours)`}
                        chart={series.length ? <Sparkline values={series.map((x) => num(x, 'views'))} /> : blank}
                    />
                </CCol>
                <CCol sm={6} xl={3}>
                    <CWidgetStatsA
                        color='primary'
                        className='bo-widget bo-widget-red'
                        value={<>{t ? formatNumber(t.inquiries + t.applications) : inbox ? formatNumber(inbox.meta.total) : '—'}</>}
                        title={t ? `Demandes reçues (${days} jours)` : 'Demandes reçues'}
                        chart={series.length ? <Sparkline values={series.map((x) => num(x, 'inquiries'))} type='bar' /> : blank}
                    />
                </CCol>
                <CCol sm={6} xl={3}>
                    <CWidgetStatsA
                        color='primary'
                        className='bo-widget bo-widget-sage'
                        value={
                            <>
                                {e.publishedOffersCount}
                                <span className='fs-6 fw-normal'> / {e.plan.maxPublishedOffers ?? '∞'}</span>
                            </>
                        }
                        title='Offres publiées'
                        chart={bar(e.plan.maxPublishedOffers ? (e.publishedOffersCount / e.plan.maxPublishedOffers) * 100 : 100)}
                    />
                </CCol>
                <CCol sm={6} xl={3}>
                    <CWidgetStatsA color='primary' className='bo-widget bo-widget-ink' value={<>{completion} %</>} title='Fiche complète' chart={bar(completion)} />
                </CCol>
            </CRow>

            <CCard className='mb-4'>
                <CCardBody>
                    <div className='d-flex flex-wrap align-items-start gap-2'>
                        <div className='me-auto'>
                            <h4 className='card-title mb-0'>Audience</h4>
                            <div className='small text-body-secondary'>{s ? `Du ${formatDate(s.period.from)} au ${formatDate(s.period.to)}` : `Formule ${e.plan.name}`}</div>
                        </div>
                        {level !== 'none' && <PeriodSwitch days={days} onChange={setDays} />}
                    </div>
                    {level === 'none' ? (
                        <EmptyState
                            title='Statistiques non incluses dans la formule Gratuit'
                            action={
                                <CButton color='primary' as={Link} href='/formule/'>
                                    Passer à Pro
                                </CButton>
                            }
                        >
                            Vues de vos fiches, clics de contact et demandes reçues, jour par jour : inclus dans Pro et Premium.
                        </EmptyState>
                    ) : !s ? (
                        <Loading />
                    ) : (
                        <TrafficChart series={series} datasets={datasets} />
                    )}
                </CCardBody>
                {s && (
                    <CCardFooter>
                        <ChartLegend series={series} datasets={datasets} />
                    </CCardFooter>
                )}
            </CCard>

            <CRow>
                <CCol md={5}>
                    <CCard className='mb-4'>
                        <CCardBody>
                            <h5 className='card-title'>Fiche complète à {completion} %</h5>
                            <CProgress className='mb-3' color={completion === 100 ? 'success' : 'danger'} value={completion} />
                            <CListGroup flush>
                                {checklist.map((item) => (
                                    <CListGroupItem key={item.label} className='d-flex align-items-center gap-2 px-0 bg-transparent'>
                                        <CIcon icon={item.done ? cilCheckCircle : cilCircle} className={item.done ? 'text-success' : 'text-body-secondary'} />
                                        <span className={item.done ? 'text-body-secondary text-decoration-line-through' : ''}>{item.label}</span>
                                    </CListGroupItem>
                                ))}
                            </CListGroup>
                            <CButton color='primary' variant='outline' className='mt-3' as={Link} href='/fiche/'>
                                Compléter la fiche
                            </CButton>
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol md={7}>
                    <CCard className='mb-4'>
                        <CCardBody>
                            <h5 className='card-title'>Dernières demandes</h5>
                            {!e.plan.features.inquiryInbox ? (
                                <EmptyState
                                    title='Demandes reçues par e-mail'
                                    action={
                                        <CButton color='primary' as={Link} href='/formule/'>
                                            Découvrir Pro
                                        </CButton>
                                    }
                                >
                                    Avec la formule Gratuit, chaque demande vous est envoyée à {e.email || 'votre e-mail'}. La boîte de réception avec suivi des statuts est incluse dans
                                    Pro.
                                </EmptyState>
                            ) : !inbox ? (
                                <Loading />
                            ) : inbox.data.length === 0 ? (
                                <EmptyState title='Aucune demande pour le moment' />
                            ) : (
                                <CTable align='middle' hover responsive className='mb-0'>
                                    <CTableHead>
                                        <CTableRow>
                                            <CTableHeaderCell>Étudiant</CTableHeaderCell>
                                            <CTableHeaderCell>Offre</CTableHeaderCell>
                                            <CTableHeaderCell>Statut</CTableHeaderCell>
                                        </CTableRow>
                                    </CTableHead>
                                    <CTableBody>
                                        {inbox.data.map((i) => (
                                            <CTableRow key={i.id}>
                                                <CTableDataCell>
                                                    <Link href={`/demandes/?id=${i.id}`}>{i.name}</Link>
                                                    <div className='small text-body-secondary'>{formatDateTime(i.createdAt)}</div>
                                                </CTableDataCell>
                                                <CTableDataCell>{i.offer?.title ?? '—'}</CTableDataCell>
                                                <CTableDataCell>
                                                    <StatusBadge status={i.status}>{i.status === 'new' ? 'Nouvelle' : i.statusLabel}</StatusBadge>
                                                </CTableDataCell>
                                            </CTableRow>
                                        ))}
                                    </CTableBody>
                                </CTable>
                            )}
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </>
    )
}

/* ------------------------------------------------------------------ */
/* Administration                                                      */
/* ------------------------------------------------------------------ */

function AdminDashboard() {
    const { user } = useAuth()
    const [days, setDays] = useState(30)
    const { data } = useApi<Overview>('/admin/overview', { days })
    const { data: logs } = useApi<Paginated<AuditLog>>('/admin/audit-logs', { page: 1 })
    if (!data) return <Loading />
    const o = data.data
    const series = o.series
    const processed = o.inquiries.total ? Math.round((o.inquiries.processed / o.inquiries.total) * 100) : 0
    const datasets: ChartDataset[] = [
        { key: 'views', label: 'Vues des fiches', color: 'primary' },
        { key: 'inquiries', label: "Demandes d'information", color: 'success' },
        { key: 'applications', label: 'Candidatures', color: 'warning' },
        { key: 'users', label: 'Nouveaux comptes', color: 'danger' },
    ]
    const queues = [
        { label: 'Fiches à valider', value: o.queues.establishmentsPending, to: '/admin/etablissements/?status=pending_review' },
        { label: 'Vérifications demandées', value: o.queues.verificationsPending, to: '/admin/etablissements/?verification=pending' },
        { label: 'Revendications de fiche', value: o.queues.claimsPending, to: '/admin/moderation/?tab=claims' },
        { label: 'Avis à modérer', value: o.queues.reviewsPending, to: '/admin/moderation/?tab=reviews' },
        { label: 'Signalements ouverts', value: o.queues.reportsOpen, to: '/admin/moderation/?tab=reports' },
        { label: 'Paiements à confirmer', value: o.queues.invoicesPending, to: '/admin/facturation/' },
    ]
    const pending = queues.reduce((sum, q) => sum + q.value, 0)

    return (
        <>
            <PageBanner
                title={`Bonjour ${user?.name.split(' ')[0] ?? ''}`}
                description={pending ? `${pending} élément${pending > 1 ? 's' : ''} en attente de traitement sur la plateforme.` : 'Rien en attente : la plateforme est à jour.'}
            />
            <CRow className='mb-4' xs={{ gutter: 4 }}>
                <CCol sm={6} xl={3}>
                    <CWidgetStatsA
                        color='primary'
                        className='bo-widget bo-widget-teal'
                        value={
                            <>
                                {formatNumber(o.users.students)} <span className='fs-6 fw-normal'>(+{o.users.newLast30Days} en 30 j)</span>
                            </>
                        }
                        title='Étudiants inscrits'
                        chart={<Sparkline values={series.map((x) => num(x, 'users'))} />}
                    />
                </CCol>
                <CCol sm={6} xl={3}>
                    <CWidgetStatsA
                        color='primary'
                        className='bo-widget bo-widget-red'
                        value={
                            <>
                                {formatNumber(o.inquiries.last30Days)} <span className='fs-6 fw-normal'>({processed} % traitées)</span>
                            </>
                        }
                        title='Demandes (30 jours)'
                        chart={<Sparkline values={series.map((x) => num(x, 'inquiries') + num(x, 'applications'))} type='bar' />}
                    />
                </CCol>
                <CCol sm={6} xl={3}>
                    <CWidgetStatsA
                        color='primary'
                        className='bo-widget bo-widget-sage'
                        value={
                            <>
                                {o.catalog.published} <span className='fs-6 fw-normal'>/ {o.catalog.establishments} fiches</span>
                            </>
                        }
                        title={`Fiches publiées · ${o.catalog.offersPublished} offres`}
                        chart={<Sparkline values={series.map((x) => num(x, 'views'))} />}
                    />
                </CCol>
                <CCol sm={6} xl={3}>
                    <CWidgetStatsA
                        color='primary'
                        className='bo-widget bo-widget-ink'
                        value={
                            <>
                                {formatAriary(o.revenue.thisMonth)}{' '}
                                <span className='fs-6 fw-normal'>
                                    (Pro {o.subscriptions.pro ?? 0} · Premium {o.subscriptions.premium ?? 0})
                                </span>
                            </>
                        }
                        title='Encaissé ce mois'
                        chart={blank}
                    />
                </CCol>
            </CRow>

            <CCard className='mb-4'>
                <CCardBody>
                    <div className='d-flex flex-wrap align-items-start gap-2'>
                        <div className='me-auto'>
                            <h4 className='card-title mb-0'>Activité de la plateforme</h4>
                            <div className='small text-body-secondary'>{days} derniers jours</div>
                        </div>
                        <PeriodSwitch days={days} onChange={setDays} />
                    </div>
                    <TrafficChart series={series} datasets={datasets} />
                </CCardBody>
                <CCardFooter>
                    <ChartLegend series={series} datasets={datasets} />
                </CCardFooter>
            </CCard>

            <CRow>
                <CCol lg={5}>
                    <CCard className='mb-4'>
                        <CCardBody>
                            <h5 className='card-title'>À traiter</h5>
                            <CListGroup flush>
                                {queues.map((q) => (
                                    <CListGroupItem key={q.label} as={Link} href={q.to} className='list-group-item-action d-flex justify-content-between align-items-center px-0 bg-transparent'>
                                        {q.label}
                                        <StatusBadge status={q.value ? 'pending' : 'resolved'}>{q.value}</StatusBadge>
                                    </CListGroupItem>
                                ))}
                            </CListGroup>
                        </CCardBody>
                    </CCard>
                    <CCard className='mb-4'>
                        <CCardBody>
                            <h5 className='card-title'>Indicateurs du pilote</h5>
                            {[
                                { label: 'Demandes traitées par les établissements', value: processed, color: 'success' },
                                {
                                    label: 'Fiches vérifiées',
                                    value: o.catalog.establishments ? Math.round((o.catalog.verified / o.catalog.establishments) * 100) : 0,
                                    color: 'info',
                                },
                                {
                                    label: 'Offres mises à jour en 90 jours',
                                    value: o.catalog.offersPublished ? Math.min(100, Math.round((o.catalog.offersUpdatedLast90Days / o.catalog.offersPublished) * 100)) : 0,
                                    color: 'warning',
                                },
                            ].map((k) => (
                                <div key={k.label} className='mb-3'>
                                    <div className='d-flex justify-content-between small'>
                                        <span className='text-body-secondary'>{k.label}</span>
                                        <strong>{k.value} %</strong>
                                    </div>
                                    <CProgress thin color={k.color} value={k.value} />
                                </div>
                            ))}
                        </CCardBody>
                    </CCard>
                </CCol>
                <CCol lg={7}>
                    <CCard className='mb-4'>
                        <CCardBody>
                            <h5 className='card-title'>Dernières actions</h5>
                            <CTable align='middle' hover responsive className='mb-0'>
                                <CTableHead>
                                    <CTableRow>
                                        <CTableHeaderCell>Action</CTableHeaderCell>
                                        <CTableHeaderCell>Par</CTableHeaderCell>
                                        <CTableHeaderCell>Date</CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {(logs?.data ?? []).slice(0, 8).map((log) => (
                                        <CTableRow key={log.id}>
                                            <CTableDataCell>{ACTION_LABELS[log.action] ?? log.action}</CTableDataCell>
                                            <CTableDataCell>{log.user?.name ?? 'Système'}</CTableDataCell>
                                            <CTableDataCell className='small text-body-secondary'>{formatDateTime(log.createdAt)}</CTableDataCell>
                                        </CTableRow>
                                    ))}
                                </CTableBody>
                            </CTable>
                            <CButton color='link' className='px-0 mt-2' as={Link} href='/admin/journal/'>
                                Tout le journal
                            </CButton>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </>
    )
}

export default function Dashboard() {
    const { user } = useAuth()
    const { current, loading } = useEstablishment()

    if (user?.role === 'admin') return <AdminDashboard />
    if (loading) return <Loading />
    if (!current) {
        return (
            <>
                <PageBanner title='Bienvenue sur le back-office Edumada' description='Commencez par la fiche de votre établissement.' />
                <CCard className='mb-4'>
                    <CCardBody>
                        <EmptyState
                            title='Aucun établissement pour le moment'
                            action={
                                <CButton color='primary' as={Link} href='/nouvel-etablissement/'>
                                    Créer la fiche de mon établissement
                                </CButton>
                            }
                        >
                            Votre établissement est peut-être déjà sur Edumada : retrouvez-le sur le site et cliquez sur « Vous représentez cet établissement ? ».
                        </EmptyState>
                    </CCardBody>
                </CCard>
            </>
        )
    }
    return <EstablishmentDashboard e={current} />
}
