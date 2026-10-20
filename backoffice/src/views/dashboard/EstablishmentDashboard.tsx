'use client'
import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { CAlert, CButton, CCol, CRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
    cilArrowBottom,
    cilArrowRight,
    cilArrowTop,
    cilBullhorn,
    cilChartLine,
    cilCheckAlt,
    cilCheckCircle,
    cilCircle,
    cilClipboard,
    cilClock,
    cilEducation,
    cilExternalLink,
    cilInbox,
    cilLocationPin,
    cilPencil,
    cilScreenDesktop,
} from '@coreui/icons'
import { useApi } from '@/lib/useApi'
import { assetUrl, SITE_URL } from '@/lib/api'
import { formatDate, formatDateTime, formatNumber, percentChange } from '@/lib/format'
import type { EstablishmentStats, Inquiry, ManagedEstablishment, Paginated, SeriesPoint } from '@/lib/types'
import { EmptyState, Loading, StatusBadge } from '@/components/ui'
import { ChartLegend, Sparkline, TrafficChart, type ChartDataset } from './charts'
import { PeriodSwitch } from './Dashboard'

type Inbox = Paginated<Inquiry> & { counts?: Record<string, number> }

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
    return first.length > 110 ? `${first.slice(0, 107)}…` : first
}

function Evolution({ value, label }: { value: number | null; label: string }) {
    if (value === null) return <span>{label}</span>
    return (
        <span>
            <CIcon icon={value >= 0 ? cilArrowTop : cilArrowBottom} size='sm' className='me-1' />
            {value > 0 ? '+' : ''}
            {value} % {label}
        </span>
    )
}

/** Indicateur coloré : icône, chiffre, petite courbe et pied d'évolution. */
function Tile({ tone, icon, value, label, chart, footer }: { tone: string; icon: string[]; value: ReactNode; label: string; chart?: ReactNode; footer: ReactNode }) {
    return (
        <div className={`bo-tile bo-tile-${tone}`}>
            <div className='bo-tile-top'>
                <div>
                    <span className='bo-tile-icon' aria-hidden='true'>
                        <CIcon icon={icon} />
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

type Activity = { at: string; icon: string[]; tone: string; title: string; detail: string; href: string }

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
    const datasets: ChartDataset[] = [
        { key: 'views', label: 'Vues', color: 'primary' },
        { key: 'contactClicks', label: 'Clics de contact', color: 'success' },
        { key: 'inquiries', label: 'Demandes', color: 'danger' },
    ]
    const requests = t ? t.inquiries + t.applications : inbox ? inbox.meta.total : null
    const comparison = `par rapport aux ${days} jours précédents`
    const siteUrl = `${SITE_URL}/etablissements/${e.id}/`
    const bar = (value: number) => (
        <div className='bo-tile-bar'>
            <span style={{ width: `${Math.min(100, value)}%` }} />
        </div>
    )

    // Activité récente : demandes reçues ou traitées, offres publiées ou modifiées.
    const activity: Activity[] = [
        ...(inbox?.data ?? []).map((i) => ({
            at: i.updatedAt ?? i.createdAt,
            icon: i.status === 'accepted' ? cilCheckAlt : cilInbox,
            tone: i.status === 'accepted' ? 'green' : i.status === 'refused' ? 'grey' : 'red',
            title:
                i.status === 'new'
                    ? i.type === 'application'
                        ? 'Nouvelle candidature reçue'
                        : 'Nouvelle demande reçue'
                    : i.status === 'accepted'
                      ? 'Une demande a été acceptée'
                      : `Demande : ${i.statusLabel.toLowerCase()}`,
            detail: `${i.name}${i.offer ? ` · ${i.offer.title}` : ''}`,
            href: `/demandes/?id=${i.id}`,
        })),
        ...(e.offers ?? []).map((o) => ({
            at: o.updatedAt,
            icon: o.status === 'published' ? cilEducation : cilPencil,
            tone: o.status === 'published' ? 'teal' : 'grey',
            title: o.status === 'published' ? 'Offre publiée ou mise à jour' : o.status === 'draft' ? 'Brouillon d’offre enregistré' : 'Offre archivée',
            detail: o.title,
            href: `/offres/modifier/?id=${o.id}`,
        })),
    ]
        .sort((a, b) => b.at.localeCompare(a.at))
        .slice(0, 5)

    const premium = e.plan.code === 'premium'

    return (
        <>
            {/* Couverture */}
            <div className='bo-cover bo-cover-standalone mb-4'>
                {e.imageSrc && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={assetUrl(e.imageSrc)} alt='' className='bo-cover-img' />
                )}
                <div className='bo-cover-inner'>
                    <div className='bo-cover-logo'>
                        {e.logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={assetUrl(e.logo)} alt={`Logo de ${e.name}`} />
                        ) : (
                            <span>{initials(e.name)}</span>
                        )}
                    </div>
                    <div className='bo-cover-text'>
                        <h1 className='d-flex flex-wrap align-items-center gap-2'>
                            {e.name}
                            <span className='bo-cover-plan'>Formule {e.plan.name}</span>
                        </h1>
                        <p className='mb-1'>
                            <CIcon icon={cilLocationPin} className='me-1' />
                            {e.city} · {e.statusLabel}
                        </p>
                        {tagline(e.description) && <p className='fst-italic mb-0 opacity-75'>{tagline(e.description)}</p>}
                    </div>
                    <div className='bo-cover-actions'>
                        {e.status === 'published' && (
                            <CButton color='light' href={siteUrl} target='_blank' rel='noopener noreferrer'>
                                <CIcon icon={cilExternalLink} className='me-2' />
                                Voir ma fiche
                            </CButton>
                        )}
                        <CButton color='danger' className='text-white' as={Link} href='/offres/nouvelle/'>
                            Nouvelle offre
                        </CButton>
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
            <CRow className='mb-4' xs={{ gutter: 4 }}>
                <CCol sm={6} xl={3}>
                    <Tile
                        tone='teal'
                        icon={cilScreenDesktop}
                        value={t ? formatNumber(t.views) : '—'}
                        label={`Vues (${days} jours)`}
                        chart={series.length ? <Sparkline values={series.map((x) => num(x, 'views'))} /> : null}
                        footer={t ? <Evolution value={p ? percentChange(t.views, p.views) : null} label={p ? comparison : 'Formule ' + e.plan.name} /> : 'Inclus dans Pro et Premium'}
                    />
                </CCol>
                <CCol sm={6} xl={3}>
                    <Tile
                        tone='red'
                        icon={cilInbox}
                        value={requests === null ? '—' : formatNumber(requests)}
                        label={t ? `Demandes reçues (${days} jours)` : 'Demandes reçues'}
                        chart={series.length ? <Sparkline values={series.map((x) => num(x, 'inquiries'))} /> : null}
                        footer={
                            t ? (
                                <Evolution value={p ? percentChange(t.inquiries + t.applications, p.inquiries + p.applications) : null} label={p ? comparison : `dont ${t.applications} candidature(s)`} />
                            ) : (
                                'Reçues par e-mail avec la formule Gratuit'
                            )
                        }
                    />
                </CCol>
                <CCol sm={6} xl={3}>
                    <Tile
                        tone='sage'
                        icon={cilEducation}
                        value={
                            <>
                                {e.publishedOffersCount}
                                <small> / {e.plan.maxPublishedOffers ?? '∞'}</small>
                            </>
                        }
                        label='Offres publiées'
                        chart={bar(e.plan.maxPublishedOffers ? (e.publishedOffersCount / e.plan.maxPublishedOffers) * 100 : 100)}
                        footer={e.plan.maxPublishedOffers ? `${Math.max(0, e.plan.maxPublishedOffers - e.publishedOffersCount)} offre(s) encore possible(s)` : 'Offres illimitées avec votre formule'}
                    />
                </CCol>
                <CCol sm={6} xl={3}>
                    <Tile
                        tone='ink'
                        icon={cilCheckCircle}
                        value={`${completion} %`}
                        label='Fiche complète'
                        chart={bar(completion)}
                        footer={remaining === 0 ? 'Toutes les informations sont à jour' : `${remaining} point(s) à compléter`}
                    />
                </CCol>
            </CRow>

            <CRow xs={{ gutter: 4 }} className='mb-4'>
                {/* Audience */}
                <CCol xl={8}>
                    <div className='card'>
                        <div className='card-body'>
                            <div className='d-flex flex-wrap align-items-start gap-2 mb-2'>
                                <span className='bo-card-icon me-1' aria-hidden='true'>
                                    <CIcon icon={cilChartLine} />
                                </span>
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
                        </div>
                        {s && (
                            <div className='card-footer bg-transparent'>
                                <ChartLegend series={series} datasets={datasets} />
                            </div>
                        )}
                    </div>
                </CCol>

                {/* Activité récente et visibilité */}
                <CCol xl={4} className='d-flex flex-column gap-4'>
                    <div className='card'>
                        <div className='card-body'>
                            <h4 className='card-title d-flex align-items-center gap-2 mb-3'>
                                <CIcon icon={cilClock} />
                                Activité récente
                            </h4>
                            {activity.length === 0 ? (
                                <p className='text-body-secondary mb-0'>Rien de nouveau pour le moment.</p>
                            ) : (
                                <ul className='bo-activity list-unstyled mb-0'>
                                    {activity.map((item, index) => (
                                        <li key={`${item.href}-${index}`}>
                                            <span className={`bo-activity-icon is-${item.tone}`} aria-hidden='true'>
                                                <CIcon icon={item.icon} size='sm' />
                                            </span>
                                            <Link href={item.href} className='text-decoration-none'>
                                                <strong>{item.title}</strong>
                                                <span className='d-block small text-body-secondary text-truncate'>{item.detail}</span>
                                                <span className='d-block small text-body-tertiary'>{formatDateTime(item.at)}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                    <div className='bo-visibility'>
                        <CIcon icon={cilBullhorn} size='xl' className='text-danger mb-2' />
                        <h4 className='h5 fw-bold'>Gagnez en visibilité</h4>
                        <p className='small mb-3'>Mettez vos formations en avant pendant vos recrutements, auprès des étudiants qui cherchent.</p>
                        <CButton color='danger' className='text-white' as={Link} href={premium ? '/campagnes/' : '/formule/'}>
                            {premium ? 'Créer une campagne' : 'Découvrir Premium'}
                            <CIcon icon={cilArrowRight} className='ms-2' />
                        </CButton>
                    </div>
                </CCol>
            </CRow>

            <CRow xs={{ gutter: 4 }}>
                {/* Fiche complète */}
                <CCol xl={7}>
                    <div className='card h-100'>
                        <div className='card-body'>
                            <h4 className='card-title d-flex align-items-center gap-2'>
                                <CIcon icon={cilClipboard} />
                                Fiche complète à {completion} %
                            </h4>
                            <div className='progress mb-3' style={{ height: 8 }}>
                                <div className={`progress-bar ${completion === 100 ? 'bg-success' : 'bg-danger'}`} style={{ width: `${completion}%` }} />
                            </div>
                            <ul className='bo-checklist list-unstyled'>
                                {checklist.map((item) => (
                                    <li key={item.label} className={item.done ? 'is-done' : ''}>
                                        <CIcon icon={item.done ? cilCheckCircle : cilCircle} className={item.done ? 'text-success' : 'text-body-secondary'} />
                                        {item.label}
                                    </li>
                                ))}
                            </ul>
                            <CButton color='primary' variant='outline' as={Link} href='/fiche/'>
                                <CIcon icon={cilPencil} className='me-2' />
                                Compléter la fiche
                            </CButton>
                        </div>
                    </div>
                </CCol>

                {/* Dernières demandes */}
                <CCol xl={5}>
                    <div className='card h-100'>
                        <div className='card-body'>
                            <div className='d-flex align-items-center mb-3'>
                                <h4 className='card-title mb-0 me-auto'>Dernières demandes</h4>
                                {e.plan.features.inquiryInbox && (
                                    <Link href='/demandes/' className='small fw-semibold text-decoration-none'>
                                        Voir tout <CIcon icon={cilArrowRight} size='sm' />
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
                                <ul className='bo-requests list-unstyled mb-0'>
                                    {inbox.data.map((i) => (
                                        <li key={i.id}>
                                            <span className='bo-member-avatar bg-danger'>{initials(i.name)}</span>
                                            <Link href={`/demandes/?id=${i.id}`} className='me-auto text-decoration-none' style={{ minWidth: 0 }}>
                                                <strong className='d-block text-truncate'>{i.name}</strong>
                                                <span className='d-block small text-body-secondary text-truncate'>{i.offer?.title ?? '—'}</span>
                                                <span className='d-block small text-body-tertiary'>{formatDateTime(i.createdAt)}</span>
                                            </Link>
                                            <StatusBadge status={i.status}>{i.status === 'new' ? 'Nouvelle' : i.statusLabel}</StatusBadge>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </CCol>
            </CRow>
        </>
    )
}

