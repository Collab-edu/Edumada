'use client'
import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { CAlert, CButton, CButtonGroup, CCol, CRow } from '@coreui/react'
import { CChartLine } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import {
    cilArrowBottom,
    cilArrowRight,
    cilArrowTop,
    cilBank,
    cilBullhorn,
    cilChartLine,
    cilCheckAlt,
    cilCheckCircle,
    cilClipboard,
    cilClock,
    cilEducation,
    cilInbox,
    cilLocationPin,
    cilOptions,
    cilPencil,
} from '@coreui/icons'
import { useApi } from '@/lib/useApi'
import { assetUrl, SITE_URL } from '@/lib/api'
import { formatDate, formatDateTime, formatNumber, percentChange } from '@/lib/format'
import type { EstablishmentStats, Inquiry, ManagedEstablishment, Paginated, SeriesPoint } from '@/lib/types'
import { EmptyState, Loading, StatusBadge } from '@/components/ui'
import { ChartLegend, TrafficChart, type ChartDataset } from './charts'

type Inbox = Paginated<Inquiry> & { counts?: Record<string, number> }

// Œil (absent du jeu d'icônes libres CoreUI).
const cilEyeOpen = [
    '24 24',
    '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M1.5 12S5.5 5 12 5s10.5 7 10.5 7-4 7-10.5 7S1.5 12 1.5 12z"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/>',
]

const PERIODS = [7, 30, 90]

const num = (point: SeriesPoint, key: string) => Number(point[key] ?? 0)

const initials = (name: string) =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join('')

/** Première phrase de la présentation, pour l'accroche de la couverture. */
const tagline = (text?: string | null) => {
    const first = (text ?? '').split(/(?<=[.!?])\s/)[0]?.trim() ?? ''
    return first.length > 90 ? `${first.slice(0, 87)}…` : first
}

function Periods({ days, onChange }: { days: number; onChange: (days: number) => void }) {
    return (
        <CButtonGroup role='group' aria-label='Période' className='bo-periods'>
            {PERIODS.map((d) => (
                <button key={d} type='button' className={days === d ? 'is-active' : ''} aria-pressed={days === d} onClick={() => onChange(d)}>
                    {d} jours
                </button>
            ))}
        </CButtonGroup>
    )
}

/** Courbe adoucie, remplie en dégradé blanc, sans points. */
function TileSpark({ values }: { values: number[] }) {
    return (
        <CChartLine
            style={{ height: '64px' }}
            data={{
                labels: values.map((_, i) => i + 1),
                datasets: [
                    {
                        data: values,
                        borderColor: 'rgba(255,255,255,.85)',
                        fill: true,
                        backgroundColor: (ctx: { chart: { ctx: CanvasRenderingContext2D; chartArea?: { top: number; bottom: number } } }) => {
                            const area = ctx.chart.chartArea
                            if (!area) return 'rgba(255,255,255,.15)'
                            const g = ctx.chart.ctx.createLinearGradient(0, area.top, 0, area.bottom)
                            g.addColorStop(0, 'rgba(255,255,255,.35)')
                            g.addColorStop(1, 'rgba(255,255,255,0)')
                            return g
                        },
                    },
                ],
            }}
            options={{
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                maintainAspectRatio: false,
                scales: { x: { display: false }, y: { display: false, beginAtZero: true } },
                elements: { line: { borderWidth: 1.5, tension: 0.45 }, point: { radius: 0 } },
            }}
        />
    )
}

function Evolution({ value, days }: { value: number | null; days: number }) {
    if (value === null) return null
    return (
        <>
            <CIcon icon={value >= 0 ? cilArrowTop : cilArrowBottom} size='sm' className='me-1' />
            {value > 0 ? '+' : ''}
            {value}% par rapport aux {days} derniers jours
        </>
    )
}

/** Indicateur coloré : icône, chiffre, courbe à droite, évolution en pied. */
function Tile({ tone, icon, value, label, chart, footer }: { tone: string; icon: (string | string[])[]; value: ReactNode; label: string; chart?: ReactNode; footer: ReactNode }) {
    return (
        <div className={`bo-tile bo-tile-${tone}`}>
            <div className='bo-tile-top'>
                <div className='bo-tile-main'>
                    <span className='bo-tile-icon' aria-hidden='true'>
                        <CIcon icon={icon as string[]} />
                    </span>
                    <div className='bo-tile-value'>{value}</div>
                    <div className='bo-tile-label'>{label}</div>
                </div>
                <div className='bo-tile-chart' aria-hidden='true'>
                    {chart}
                </div>
            </div>
            <div className='bo-tile-footer'>{footer}</div>
        </div>
    )
}

type Activity = { at: string; icon: (string | string[])[]; tone: string; title: string; detail: string; href: string }

export default function EstablishmentDashboard({ e }: { e: ManagedEstablishment }) {
    const [days, setDays] = useState(30)
    const level = e.plan.features.statistics ?? 'none'
    const { data: stats } = useApi<EstablishmentStats>(level === 'none' ? null : `/establishments/${e.id}/stats`, { days })
    const { data: inbox } = useApi<Inbox>(e.plan.features.inquiryInbox ? `/establishments/${e.id}/inquiries` : null, { perPage: 5 })
    const s = stats?.data
    const t = s?.totals
    const p = s?.previousTotals
    const series = s?.series ?? []

    const checklist = [
        { done: (e.description ?? '').length > 80, label: 'Présentation de quelques phrases' },
        { done: !!e.imageSrc, label: 'Photo de couverture' },
        ...(e.plan.features.photoGallery ? [{ done: e.photos.length >= 2, label: 'Au moins 2 photos des locaux' }] : []),
        { done: !!e.phone && !!e.email, label: 'Téléphone et e-mail' },
        { done: !!e.coordinates, label: 'Position sur la carte' },
        { done: e.admissionDocuments.length > 0, label: "Pièces demandées à l'inscription" },
        { done: e.publishedOffersCount > 0, label: 'Au moins une offre publiée' },
    ]
    const remaining = checklist.filter((c) => !c.done).length
    const completion = Math.round(((checklist.length - remaining) / checklist.length) * 100)
    // Deux colonnes remplies de haut en bas, comme sur la maquette.
    const half = Math.ceil(checklist.length / 2)
    const datasets: ChartDataset[] = [
        { key: 'views', label: 'Vues', color: 'primary' },
        { key: 'contactClicks', label: 'Clics de contact', color: 'success' },
        { key: 'inquiries', label: 'Demandes', color: 'danger' },
    ]
    const requests = t ? t.inquiries + t.applications : inbox ? inbox.meta.total : null
    const siteUrl = `${SITE_URL}/etablissements/${e.id}/`
    const premium = e.plan.code === 'premium'
    const offersMax = e.plan.maxPublishedOffers
    const offersShare = offersMax ? Math.round((e.publishedOffersCount / offersMax) * 100) : null

    // Activité récente : demandes reçues ou traitées, offres publiées ou modifiées.
    const activity: Activity[] = [
        ...(inbox?.data ?? []).map((i) => ({
            at: i.updatedAt ?? i.createdAt,
            icon: i.status === 'accepted' ? cilCheckAlt : i.status === 'new' ? cilInbox : cilEyeOpen,
            tone: i.status === 'accepted' ? 'green' : i.status === 'new' ? 'red' : 'sky',
            title:
                i.status === 'new'
                    ? i.type === 'application'
                        ? 'Nouvelle candidature reçue'
                        : 'Nouvelle demande reçue'
                    : i.status === 'accepted'
                      ? i.type === 'application'
                          ? 'Une candidature a été acceptée'
                          : 'Une demande a été acceptée'
                      : `Une demande a été ${i.statusLabel.toLowerCase()}`,
            detail: i.status === 'new' ? (i.offer?.title ?? i.name) : i.name,
            href: `/demandes/?id=${i.id}`,
        })),
        ...(e.offers ?? []).map((o) => ({
            at: o.updatedAt,
            icon: o.status === 'published' ? cilBullhorn : cilPencil,
            tone: o.status === 'published' ? 'blue' : 'violet',
            title: o.status === 'published' ? 'Offre publiée' : o.status === 'draft' ? 'Brouillon enregistré' : 'Offre archivée',
            detail: o.title,
            href: `/offres/modifier/?id=${o.id}`,
        })),
    ]
        .sort((a, b) => b.at.localeCompare(a.at))
        .slice(0, 5)

    return (
        <>
            {/* Couverture */}
            <div className='bo-dash-cover mb-4'>
                {e.imageSrc && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={assetUrl(e.imageSrc)} alt='' className='bo-dash-cover-img' />
                )}
                <div className='bo-dash-cover-inner'>
                    <div className='bo-dash-cover-logo'>
                        {e.logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={assetUrl(e.logo)} alt={`Logo de ${e.name}`} />
                        ) : (
                            <CIcon icon={cilEducation} size='3xl' />
                        )}
                    </div>
                    <div className='bo-dash-cover-text'>
                        <h1>
                            {e.name}
                            <span className='bo-dash-plan'>Formule {e.plan.name}</span>
                        </h1>
                        <p className='bo-dash-city'>
                            <CIcon icon={cilLocationPin} size='sm' className='me-1' />
                            {e.city}
                        </p>
                        {tagline(e.description) && <p className='bo-dash-tagline'>{tagline(e.description)}</p>}
                    </div>
                    <div className='bo-dash-cover-actions'>
                        {e.status === 'published' && (
                            <a className='bo-dash-btn' href={siteUrl} target='_blank' rel='noopener noreferrer'>
                                <CIcon icon={cilEyeOpen} size='sm' className='me-2' />
                                Voir ma fiche
                            </a>
                        )}
                        <Link className='bo-dash-btn is-icon' href='/fiche/' title='Modifier la fiche' aria-label='Modifier la fiche'>
                            <CIcon icon={cilOptions} size='sm' />
                        </Link>
                    </div>
                </div>
            </div>

            {e.requestedPlan && e.requestedPlan.code !== e.plan.code && (
                <CAlert color='warning' className='d-flex flex-wrap align-items-center justify-content-between gap-3'>
                    <div>
                        <strong>Vous avez choisi la formule {e.requestedPlan.name}</strong> ({e.requestedPlan.billingCycle === 'yearly' ? 'annuel' : 'mensuel'}) lors de votre
                        inscription. Votre fiche reste en formule {e.plan.name} tant que le paiement n&apos;est pas confirmé.
                    </div>
                    <CButton color='dark' as={Link} href={`/formule/?plan=${e.requestedPlan.code}&cycle=${e.requestedPlan.billingCycle}`}>
                        Finaliser mon abonnement
                    </CButton>
                </CAlert>
            )}

            {/* Indicateurs */}
            <CRow className='mb-4' xs={{ gutter: 3 }}>
                <CCol sm={6} xl={3}>
                    <Tile
                        tone='teal'
                        icon={cilEyeOpen}
                        value={t ? formatNumber(t.views) : '—'}
                        label={`Vues (${days} jours)`}
                        chart={series.length ? <TileSpark values={series.map((x) => num(x, 'views'))} /> : null}
                        footer={t && p ? <Evolution value={percentChange(t.views, p.views)} days={days} /> : t ? `Formule ${e.plan.name}` : 'Inclus dans Pro et Premium'}
                    />
                </CCol>
                <CCol sm={6} xl={3}>
                    <Tile
                        tone='red'
                        icon={cilInbox}
                        value={requests === null ? '—' : formatNumber(requests)}
                        label={t ? `Demandes reçues (${days} jours)` : 'Demandes reçues'}
                        chart={series.length ? <TileSpark values={series.map((x) => num(x, 'inquiries'))} /> : null}
                        footer={
                            t && p ? (
                                <Evolution value={percentChange(t.inquiries + t.applications, p.inquiries + p.applications)} days={days} />
                            ) : t ? (
                                `Dont ${t.applications} candidature(s)`
                            ) : (
                                'Reçues par e-mail avec la formule Gratuit'
                            )
                        }
                    />
                </CCol>
                <CCol sm={6} xl={3}>
                    <Tile
                        tone='green'
                        icon={cilEducation}
                        value={`${e.publishedOffersCount} / ${offersMax ?? '∞'}`}
                        label='Offres publiées'
                        chart={series.length ? <TileSpark values={series.map((x) => num(x, 'contactClicks'))} /> : null}
                        footer={offersMax ? `${offersShare}% de votre quota utilisé` : 'Offres illimitées avec votre formule'}
                    />
                </CCol>
                <CCol sm={6} xl={3}>
                    <Tile
                        tone='violet'
                        icon={cilCheckCircle}
                        value={`${completion} %`}
                        label='Fiche complète'
                        chart={null}
                        footer={
                            <>
                                <div className='bo-tile-bar'>
                                    <span style={{ width: `${completion}%` }} />
                                </div>
                                {remaining === 0 ? 'Toutes les informations sont à jour' : `${remaining} point(s) à compléter`}
                            </>
                        }
                    />
                </CCol>
            </CRow>

            <CRow xs={{ gutter: 3 }}>
                <CCol xl={9}>
                    {/* Audience */}
                    <div className='card bo-dash-card mb-3'>
                        <div className='card-body'>
                            <div className='d-flex flex-wrap align-items-start gap-3 mb-3'>
                                <CIcon icon={cilChartLine} size='lg' className='bo-dash-title-icon mt-1' />
                                <div className='me-auto'>
                                    <h2 className='bo-dash-title mb-1'>Audience</h2>
                                    <div className='small text-body-secondary'>{s ? `Du ${formatDate(s.period.from)} au ${formatDate(s.period.to)}` : `Formule ${e.plan.name}`}</div>
                                </div>
                                {level !== 'none' && <Periods days={days} onChange={setDays} />}
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
                                <>
                                    <div className='bo-dash-chart'>
                                        <TrafficChart series={series} datasets={datasets} />
                                    </div>
                                    <div className='bo-dash-legend'>
                                        <ChartLegend series={series} datasets={datasets} />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <CRow xs={{ gutter: 3 }}>
                        {/* Fiche complète */}
                        <CCol lg={7}>
                            <div className='card bo-dash-card h-100'>
                                <div className='card-body position-relative'>
                                    <h2 className='bo-dash-title d-flex align-items-center gap-2 mb-3'>
                                        <CIcon icon={cilClipboard} className='bo-dash-title-icon' />
                                        Fiche complète à {completion} %
                                    </h2>
                                    <div className='bo-dash-progress mb-4'>
                                        <span style={{ width: `${completion}%` }} />
                                    </div>
                                    <div className='bo-checklist'>
                                        {[checklist.slice(0, half), checklist.slice(half)].map((column, c) => (
                                            <ul key={c} className='list-unstyled mb-0'>
                                                {column.map((item) => (
                                                    <li key={item.label} className={item.done ? 'is-done' : ''}>
                                                        <span className='bo-check' aria-hidden='true'>
                                                            {item.done && <CIcon icon={cilCheckAlt} />}
                                                        </span>
                                                        {item.label}
                                                    </li>
                                                ))}
                                            </ul>
                                        ))}
                                    </div>
                                    <Link href='/fiche/' className='bo-dash-outline'>
                                        <CIcon icon={cilPencil} size='sm' className='me-2' />
                                        Compléter la fiche
                                    </Link>
                                    <div className='bo-fiche-illus' aria-hidden='true'>
                                        <span className='bo-fiche-leaf is-left' />
                                        <span className='bo-fiche-leaf is-right' />
                                        <div className='bo-fiche-doc'>
                                            <CIcon icon={cilBank} />
                                            <i />
                                            <i />
                                            <i className='is-short' />
                                        </div>
                                        <span className='bo-fiche-ok'>
                                            <CIcon icon={cilCheckAlt} />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CCol>

                        {/* Dernières demandes */}
                        <CCol lg={5}>
                            <div className='card bo-dash-card h-100'>
                                <div className='card-body'>
                                    <div className='d-flex align-items-center mb-3'>
                                        <h2 className='bo-dash-title mb-0 me-auto'>Dernières demandes</h2>
                                        {e.plan.features.inquiryInbox && (
                                            <Link href='/demandes/' className='bo-dash-link'>
                                                Voir tout <CIcon icon={cilArrowRight} size='sm' className='ms-1' />
                                            </Link>
                                        )}
                                    </div>
                                    {!e.plan.features.inquiryInbox ? (
                                        <EmptyState
                                            title='Demandes reçues par e-mail'
                                            action={
                                                <CButton color='primary' as={Link} href='/formule/'>
                                                    Découvrir Pro
                                                </CButton>
                                            }
                                        >
                                            Avec la formule Gratuit, chaque demande vous est envoyée à {e.email || 'votre e-mail'}.
                                        </EmptyState>
                                    ) : !inbox ? (
                                        <Loading />
                                    ) : inbox.data.length === 0 ? (
                                        <EmptyState title='Aucune demande pour le moment' />
                                    ) : (
                                        <table className='bo-dash-table'>
                                            <thead>
                                                <tr>
                                                    <th>Étudiant</th>
                                                    <th>Offre</th>
                                                    <th className='text-end'>Statut</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {inbox.data.map((i) => (
                                                    <tr key={i.id}>
                                                        <td>
                                                            <Link href={`/demandes/?id=${i.id}`} className='d-flex align-items-center gap-2 text-reset text-decoration-none'>
                                                                <span className='bo-dash-avatar'>{initials(i.name)}</span>
                                                                <span style={{ minWidth: 0 }}>
                                                                    <span className='d-block fw-medium'>{i.name}</span>
                                                                    <span className='d-block bo-dash-muted'>{formatDateTime(i.createdAt)}</span>
                                                                </span>
                                                            </Link>
                                                        </td>
                                                        <td>{i.offer?.title ?? '—'}</td>
                                                        <td className='text-end'>
                                                            <StatusBadge status={i.status}>{i.status === 'new' ? 'Nouvelle' : i.statusLabel}</StatusBadge>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </CCol>
                    </CRow>
                </CCol>

                {/* Colonne de droite */}
                <CCol xl={3} className='d-flex flex-column gap-3'>
                    <div className='card bo-dash-card'>
                        <div className='card-body'>
                            <h2 className='bo-dash-title d-flex align-items-center gap-2 mb-3'>
                                <CIcon icon={cilClock} className='bo-dash-title-icon' />
                                Activité récente
                            </h2>
                            {activity.length === 0 ? (
                                <p className='small text-body-secondary mb-0'>Rien de nouveau pour le moment.</p>
                            ) : (
                                <ul className='bo-activity list-unstyled mb-0'>
                                    {activity.map((item, index) => (
                                        <li key={`${item.href}-${index}`}>
                                            <span className={`bo-activity-icon is-${item.tone}`} aria-hidden='true'>
                                                <CIcon icon={item.icon as string[]} size='sm' />
                                            </span>
                                            <Link href={item.href} className='text-decoration-none'>
                                                <span className='bo-activity-title'>{item.title}</span>
                                                <span className='bo-activity-detail'>{item.detail}</span>
                                                <span className='bo-dash-muted d-block'>{formatDateTime(item.at)}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                    <div className='bo-visibility'>
                        <CIcon icon={cilBullhorn} size='xl' className='bo-visibility-icon' />
                        <h2 className='bo-dash-title mb-2'>Gagnez en visibilité</h2>
                        <p>Notre équipe vous accompagne pour attirer plus d&apos;étudiants.</p>
                        <Link href={premium ? '/campagnes/' : '/formule/'} className='bo-dash-cta'>
                            {premium ? 'Découvrir les campagnes' : 'Découvrir Premium'}
                            <CIcon icon={cilArrowRight} size='sm' className='ms-2' />
                        </Link>
                    </div>
                </CCol>
            </CRow>
        </>
    )
}

