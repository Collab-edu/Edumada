'use client'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useSearchParams } from 'next/navigation'
import {
    CButton,
    CButtonGroup,
    CCol,
    CDropdown,
    CDropdownDivider,
    CDropdownItem,
    CDropdownMenu,
    CDropdownToggle,
    CForm,
    CFormInput,
    CFormSelect,
    CFormTextarea,
    CListGroup,
    CListGroupItem,
    CModal,
    CModalBody,
    CModalFooter,
    CModalHeader,
    CModalTitle,
    CNav,
    CNavItem,
    CNavLink,
    CRow,
    CSpinner,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheckAlt, cilEnvelopeClosed, cilPhone, cilX } from '@coreui/icons'
import { useToast } from '@/context/ToastContext'
import { api, assetUrl, errorMessage, SITE_URL } from '@/lib/api'
import { useApi } from '@/lib/useApi'
import { notifyEstablishmentsChanged, useEstablishmentCounts } from '@/lib/useEstablishmentCounts'
import { formatDate, formatDateTime } from '@/lib/format'
import type { ManagedEstablishment, Paginated, Plan } from '@/lib/types'
import { EmptyState, ErrorAlert, Loading, NumberedPager, PageCard, Pager, PlanBadge, RequestedPlanBadge, StatusBadge } from '@/components/ui'
import PageBanner from '@/components/PageBanner'
import ActivatePlanModal from './ActivatePlanModal'

function Members({ establishment, onDone }: { establishment: ManagedEstablishment; onDone: () => void }) {
    const toast = useToast()
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('owner')
    const [error, setError] = useState<unknown>(null)

    const add = async (ev: FormEvent) => {
        ev.preventDefault()
        setError(null)
        try {
            await api(`/admin/establishments/${establishment.id}/members`, { method: 'POST', body: { email, role } })
            toast.success('Accès donné')
            onDone()
        } catch (err) {
            setError(err)
        }
    }
    const remove = async (m: { id: number }) => {
        try {
            await api(`/admin/establishments/${establishment.id}/members/${m.id}`, { method: 'DELETE' })
            toast.success('Accès retiré')
            onDone()
        } catch (err) {
            toast.error(errorMessage(err))
        }
    }

    return (
        <>
            <CListGroup className='mb-3'>
                {(establishment.members ?? []).map((m) => (
                    <CListGroupItem key={m.id} className='d-flex justify-content-between align-items-center'>
                        <span>
                            {m.name} <span className='small text-body-secondary'>· {m.email}</span>
                        </span>
                        <CButton size='sm' color='danger' variant='ghost' onClick={() => remove(m)}>
                            Retirer
                        </CButton>
                    </CListGroupItem>
                ))}
                {!establishment.members?.length && <CListGroupItem className='text-body-secondary'>Aucun gestionnaire</CListGroupItem>}
            </CListGroup>
            <CForm onSubmit={add}>
                <ErrorAlert error={error} />
                <CRow className='g-2 align-items-end'>
                    <CCol md={6}>
                        <CFormInput label="E-mail d'un compte établissement" type='email' value={email} onChange={(e) => setEmail(e.target.value)} />
                    </CCol>
                    <CCol md={3}>
                        <CFormSelect label='Rôle' value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value='owner'>Propriétaire</option>
                            <option value='editor'>Éditeur</option>
                        </CFormSelect>
                    </CCol>
                    <CCol md={3}>
                        <CButton type='submit' color='primary' className='w-100'>
                            Donner l&apos;accès
                        </CButton>
                    </CCol>
                </CRow>
            </CForm>
        </>
    )
}

/** Refus d'une demande d'adhésion : la fiche repasse en brouillon, l'établissement reçoit le message par e-mail. */
function RefuseModal({ establishment, onClose, onDone }: { establishment: ManagedEstablishment; onClose: () => void; onDone: () => void }) {
    const toast = useToast()
    const [note, setNote] = useState('')
    const [saving, setSaving] = useState(false)

    const refuse = async () => {
        setSaving(true)
        try {
            await api(`/establishments/${establishment.id}/moderation`, { method: 'PUT', body: { status: 'draft', note: note || null } })
            toast.success('Adhésion refusée : l’établissement est prévenu par e-mail.')
            onDone()
        } catch (err) {
            toast.error(errorMessage(err))
        } finally {
            setSaving(false)
        }
    }

    return (
        <CModal visible onClose={onClose} alignment='center'>
            <CModalHeader>
                <CModalTitle>Refuser l&apos;adhésion</CModalTitle>
            </CModalHeader>
            <CModalBody>
                <p>
                    La fiche <strong>{establishment.name}</strong> repasse en brouillon : elle n&apos;apparaît pas sur le site. L&apos;établissement peut la compléter et
                    redemander sa publication.
                </p>
                <CFormTextarea
                    label="Motif envoyé à l'établissement (conseillé)"
                    rows={3}
                    placeholder='Ex. : merci d’ajouter une adresse et un numéro de téléphone joignable.'
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
            </CModalBody>
            <CModalFooter>
                <CButton color='secondary' variant='ghost' onClick={onClose}>
                    Annuler
                </CButton>
                <CButton color='danger' className='text-white' disabled={saving} onClick={refuse}>
                    {saving && <CSpinner size='sm' className='me-2' />}
                    Refuser l&apos;adhésion
                </CButton>
            </CModalFooter>
        </CModal>
    )
}

/** Fiche en lecture seule : l'administration vérifie, l'établissement rédige. */
function EstablishmentDetail({
    establishment: e,
    categoryLabel,
    onClose,
    onAccept,
    onActivatePlan,
}: {
    establishment: ManagedEstablishment
    categoryLabel: string
    onClose: () => void
    onAccept?: () => void
    onActivatePlan: () => void
}) {
    const rows: [string, ReactNode][] = [
        ['Catégorie', [e.subCategory || categoryLabel, e.type].filter(Boolean).join(' · ')],
        ['Adresse', [e.address, e.city].filter(Boolean).join(', ') || '—'],
        ['Téléphone', e.phone || '—'],
        ['E-mail', e.email || '—'],
        [
            'Site web',
            e.website ? (
                <a href={e.website} target='_blank' rel='noopener noreferrer'>
                    {e.website}
                </a>
            ) : (
                '—'
            ),
        ],
        ['Accréditation déclarée', e.accreditation ? `${e.accreditation} ${e.accreditationVerified ? '(vérifiée)' : '(à vérifier)'}` : '—'],
        ['Pièces demandées', e.admissionDocuments.length ? e.admissionDocuments.join(', ') : '—'],
        ['Infrastructures', e.infrastructures.length ? e.infrastructures.join(', ') : '—'],
        ['Offres publiées', String(e.publishedOffersCount)],
        ['Gestionnaires', e.members?.length ? e.members.map((m) => `${m.name} (${m.email})`).join(', ') : 'Aucun compte rattaché'],
        ['Créée le', formatDate(e.createdAt ?? e.updatedAt)],
    ]

    return (
        <CModal visible onClose={onClose} size='lg' scrollable>
            <CModalHeader>
                <CModalTitle className='d-flex flex-wrap align-items-center gap-2'>
                    {e.name}
                    <StatusBadge status={e.status}>{e.statusLabel}</StatusBadge>
                    {e.status === 'published' && <PlanBadge code={e.plan.code} />}
                    {e.requestedPlan && e.requestedPlan.code !== e.plan.code && <RequestedPlanBadge plan={e.requestedPlan} />}
                </CModalTitle>
            </CModalHeader>
            <CModalBody>
                {e.imageSrc && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={assetUrl(e.imageSrc)} alt='' className='w-100 rounded-3 mb-3' style={{ maxHeight: 220, objectFit: 'cover' }} />
                )}
                {e.description ? <p style={{ whiteSpace: 'pre-line' }}>{e.description}</p> : <p className='text-body-secondary'>Pas de présentation.</p>}
                <CTable small className='mb-3'>
                    <CTableBody>
                        {rows.map(([label, value]) => (
                            <CTableRow key={label}>
                                <CTableHeaderCell className='text-body-secondary fw-normal' style={{ width: '35%' }}>
                                    {label}
                                </CTableHeaderCell>
                                <CTableDataCell>{value}</CTableDataCell>
                            </CTableRow>
                        ))}
                    </CTableBody>
                </CTable>
                {e.photos.length > 0 && (
                    <div className='d-flex flex-wrap gap-2'>
                        {e.photos.map((url) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={url} src={assetUrl(url)} alt='' className='bo-thumb' />
                        ))}
                    </div>
                )}
                <p className='small text-body-secondary mt-3 mb-0'>
                    Le contenu de la fiche est rédigé par l&apos;établissement. Pour une correction, contactez-le ou refusez l&apos;adhésion avec un motif.
                </p>
            </CModalBody>
            <CModalFooter>
                {e.status === 'published' && (
                    <CButton color='secondary' variant='ghost' href={`${SITE_URL}/etablissements/${e.id}/`} target='_blank' rel='noopener noreferrer'>
                        Voir sur le site
                    </CButton>
                )}
                <CButton color='secondary' variant='outline' onClick={onClose}>
                    Fermer
                </CButton>
                <CButton color='primary' variant='outline' onClick={onActivatePlan}>
                    Activer une formule
                </CButton>
                {onAccept && (
                    <CButton color='success' className='text-white' onClick={onAccept}>
                        <CIcon icon={cilCheckAlt} className='me-1' />
                        Accepter l&apos;adhésion
                    </CButton>
                )}
            </CModalFooter>
        </CModal>
    )
}

const verificationStatus = (status: string) => (status === 'Vérifié' ? 'approved' : status === 'En cours' ? 'pending' : 'draft')

type Tab = 'nouveaux' | 'inscrits' | 'toutes'
const TAB_STATUS: Record<Tab, string> = { nouveaux: 'pending_review', inscrits: 'published', toutes: '' }
const PLAN_FILTERS: { code: '' | Plan['code']; label: string }[] = [
    { code: '', label: 'Toutes formules' },
    { code: 'free', label: 'Gratuit' },
    { code: 'pro', label: 'Pro' },
    { code: 'premium', label: 'Premium' },
]

function EstablishmentList({ category }: { category: string | null }) {
    const params = useSearchParams()
    const toast = useToast()
    const { data: counts, reload: reloadCounts } = useEstablishmentCounts(true, category)
    const requestedTab: Tab | null = params.get('status') === 'pending_review' ? 'nouveaux' : params.get('verification') ? 'toutes' : (params.get('onglet') as Tab | null)
    const [tab, setTab] = useState<Tab>(requestedTab ?? 'inscrits')
    const [filters, setFilters] = useState({ plan: '', verification: params.get('verification') ?? '', q: '', page: 1 })
    const { data, loading, reload } = useApi<Paginated<ManagedEstablishment>>('/admin/establishments', {
        category,
        status: TAB_STATUS[tab],
        plan: tab === 'inscrits' ? filters.plan : '',
        verification: filters.verification,
        q: filters.q,
        page: filters.page,
    })
    const [team, setTeam] = useState<ManagedEstablishment | null>(null)
    const [refusing, setRefusing] = useState<ManagedEstablishment | null>(null)
    const [viewing, setViewing] = useState<ManagedEstablishment | null>(null)
    const [activating, setActivating] = useState<ManagedEstablishment | null>(null)

    const scope = category ? counts?.data.categories.find((c) => c.id === category) : counts?.data.total

    // Sans onglet demandé, on ouvre « Nouveaux » s'il y a des demandes d'adhésion en attente.
    const opened = useRef(!!requestedTab)
    useEffect(() => {
        if (opened.current || !scope) return
        opened.current = true
        if (scope.new > 0) setTab('nouveaux')
    }, [scope])
    const label = category ? (counts?.data.categories.find((c) => c.id === category)?.label ?? 'Établissements') : 'Tous les établissements'
    const categoryLabel = (id: string) => counts?.data.categories.find((c) => c.id === id)?.shortLabel ?? id

    const refresh = () => {
        reload()
        reloadCounts()
        notifyEstablishmentsChanged()
    }

    const moderate = async (e: ManagedEstablishment, body: Record<string, unknown>, message: string) => {
        try {
            await api(`/establishments/${e.id}/moderation`, { method: 'PUT', body })
            toast.success(message)
            refresh()
        } catch (err) {
            toast.error(errorMessage(err))
        }
    }

    const changeTab = (next: Tab) => {
        setTab(next)
        setFilters({ ...filters, plan: '', page: 1 })
    }

    const tabs: { id: Tab; label: string; count?: number }[] = [
        { id: 'nouveaux', label: 'Nouveaux', count: scope?.new },
        { id: 'inscrits', label: 'Inscrits', count: scope?.registered },
        { id: 'toutes', label: 'Toutes les fiches', count: scope ? scope.new + scope.registered + scope.other : undefined },
    ]

    return (
        <>
            <PageBanner
                title={label}
                description={
                    scope
                        ? `${scope.registered} inscrit${scope.registered > 1 ? 's' : ''} · ${scope.new} nouvelle${scope.new > 1 ? 's' : ''} demande${scope.new > 1 ? 's' : ''} d'adhésion`
                        : undefined
                }
            />

            <PageCard>
                <CNav variant='underline-border' className='mb-3 flex-nowrap bo-tabs'>
                    {tabs.map((t) => (
                        <CNavItem key={t.id}>
                            <CNavLink as='button' active={tab === t.id} onClick={() => changeTab(t.id)} className='text-nowrap'>
                                {t.label}
                                {t.count !== undefined && (
                                    <span className={`badge ms-2 ${t.id === 'nouveaux' && t.count ? 'bg-warning' : 'bg-secondary-subtle text-body-secondary'}`}>{t.count}</span>
                                )}
                            </CNavLink>
                        </CNavItem>
                    ))}
                </CNav>

                {tab === 'inscrits' && (
                    <div className='d-flex flex-wrap gap-2 mb-3'>
                        <CButtonGroup role='group' aria-label='Formule' size='sm' className='flex-wrap'>
                            {PLAN_FILTERS.map((p) => (
                                <CButton
                                    key={p.code}
                                    color='primary'
                                    variant={filters.plan === p.code ? undefined : 'outline'}
                                    onClick={() => setFilters({ ...filters, plan: p.code, page: 1 })}
                                >
                                    {p.label}
                                    {p.code && counts && <span className='ms-1 opacity-75'>({counts.data.plans[p.code]})</span>}
                                </CButton>
                            ))}
                        </CButtonGroup>
                    </div>
                )}

                <CRow className='g-2 mb-3'>
                    <CCol md={8}>
                        <CFormInput placeholder='Rechercher un nom ou une ville' value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value, page: 1 })} />
                    </CCol>
                    <CCol md={4}>
                        <CFormSelect aria-label='Vérification' value={filters.verification} onChange={(e) => setFilters({ ...filters, verification: e.target.value, page: 1 })}>
                            <option value=''>Toutes les vérifications</option>
                            <option value='pending'>Vérification demandée</option>
                            <option value='verified'>Vérifiées</option>
                            <option value='unverified'>Non vérifiées</option>
                        </CFormSelect>
                    </CCol>
                </CRow>

                {/* Pendant un changement d'onglet, l'ancienne liste ne doit pas s'afficher avec les boutons d'adhésion. */}
                {!data || loading ? (
                    <Loading />
                ) : data.data.length === 0 ? (
                    <EmptyState title={tab === 'nouveaux' ? 'Aucune demande d’adhésion en attente' : 'Aucune fiche ne correspond'}>
                        {tab === 'nouveaux' ? 'Les établissements qui créent leur fiche apparaîtront ici avant publication.' : undefined}
                    </EmptyState>
                ) : tab === 'nouveaux' ? (
                    <>
                        <p className='small text-body-secondary mb-3'>
                            Vérifiez que l&apos;établissement existe et que ses coordonnées sont joignables avant d&apos;accepter : il est prévenu par e-mail de votre décision.
                        </p>
                        <div className='bo-rows bo-rows--requests' role='list'>
                            <div className='bo-rows-head' aria-hidden='true'>
                                <span>Établissement</span>
                                <span>Contact</span>
                                <span>Demandé par</span>
                                <span>Reçue le</span>
                                <span className='text-end'>Adhésion</span>
                            </div>
                            {data.data.map((e) => {
                                const owner = e.members?.[0]
                                const fallbackPhone = !e.phone ? owner?.phone : null
                                return (
                                    <div key={e.id} className='bo-row' role='listitem'>
                                        <div className='bo-row-main'>
                                            <div className='d-flex align-items-center gap-3' style={{ minWidth: 0 }}>
                                                {e.logo ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={assetUrl(e.logo)} alt='' className='bo-row-logo' />
                                                ) : (
                                                    <span className='bo-row-logo bo-row-logo--initials'>{e.initials.replace(/[^\p{L}\p{N}]/gu, '').slice(0, 3)}</span>
                                                )}
                                                <div style={{ minWidth: 0 }}>
                                                    <button type='button' className='btn btn-link p-0 fw-semibold text-start text-decoration-none lh-sm' onClick={() => setViewing(e)}>
                                                        {e.name}
                                                    </button>
                                                    <div className='small text-body-secondary text-truncate'>
                                                        {[e.subCategory || categoryLabel(e.category), e.type, e.city].filter(Boolean).join(' · ')}
                                                    </div>
                                                    {e.requestedPlan && <RequestedPlanBadge plan={e.requestedPlan} className='mt-1' />}
                                                </div>
                                            </div>
                                            <div className='small bo-col-optional'>
                                                {e.email && (
                                                    <a href={`mailto:${e.email}`} className='d-block text-truncate text-decoration-none'>
                                                        <CIcon icon={cilEnvelopeClosed} className='me-1' />
                                                        {e.email}
                                                    </a>
                                                )}
                                                {e.phone && (
                                                    <a href={`tel:${e.phone.replace(/\s/g, '')}`} className='d-block text-decoration-none'>
                                                        <CIcon icon={cilPhone} className='me-1' />
                                                        {e.phone}
                                                    </a>
                                                )}
                                                {fallbackPhone && (
                                                    <a href={`tel:${fallbackPhone.replace(/\s/g, '')}`} className='d-block text-decoration-none'>
                                                        <CIcon icon={cilPhone} className='me-1' />
                                                        {fallbackPhone}
                                                        <span className='text-body-secondary'> (responsable)</span>
                                                    </a>
                                                )}
                                                {!e.email && !e.phone && !fallbackPhone && <span className='text-warning-emphasis'>Fiche à compléter</span>}
                                            </div>
                                            <div className='d-flex align-items-center gap-2 small bo-col-optional' style={{ minWidth: 0 }}>
                                                {owner ? (
                                                    <>
                                                        <span className='bo-row-avatar' style={{ background: '#dbe7ea', color: '#0f4c5c' }}>
                                                            {owner.name
                                                                .split(/\s+/)
                                                                .slice(0, 2)
                                                                .map((w) => w[0]?.toUpperCase())
                                                                .join('')}
                                                        </span>
                                                        <div style={{ minWidth: 0 }}>
                                                            <div className='fw-semibold text-truncate'>{owner.name}</div>
                                                            <div className='text-body-secondary text-truncate'>{owner.jobTitle || owner.email}</div>
                                                            {owner.jobTitle && <div className='text-body-secondary text-truncate'>{owner.email}</div>}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <span className='text-body-secondary'>Aucun compte rattaché</span>
                                                )}
                                            </div>
                                            <span className='small text-body-secondary text-nowrap bo-col-optional'>{formatDate(e.createdAt ?? e.updatedAt)}</span>
                                            <div className='d-flex justify-content-end gap-2'>
                                                <CButton
                                                    size='sm'
                                                    color='success'
                                                    className='text-white text-nowrap'
                                                    onClick={() => moderate(e, { status: 'published' }, `${e.name} est inscrit et publié sur Edumada.`)}
                                                >
                                                    <CIcon icon={cilCheckAlt} className='me-1' />
                                                    Accepter
                                                </CButton>
                                                <CButton size='sm' color='danger' variant='outline' className='text-nowrap' onClick={() => setRefusing(e)}>
                                                    <CIcon icon={cilX} className='me-1' />
                                                    Refuser
                                                </CButton>
                                            </div>
                                        </div>
                                        {e.requestedPlan && (
                                            <div className='d-flex flex-wrap align-items-center justify-content-between gap-2 border-top px-4 py-2 small'>
                                                <span className='text-body-secondary'>
                                                    A choisi la formule <strong>{e.requestedPlan.name}</strong> : activez-la dès que le paiement est reçu.
                                                </span>
                                                <CButton size='sm' color='primary' variant='outline' onClick={() => setActivating(e)}>
                                                    Activer {e.requestedPlan.name}
                                                </CButton>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        <NumberedPager meta={data.meta} onChange={(page) => setFilters({ ...filters, page })} />
                    </>
                ) : (
                    <>
                        <CTable align='middle' hover responsive className='mb-0'>
                            <CTableHead className='text-nowrap'>
                                <CTableRow>
                                    <CTableHeaderCell>Établissement</CTableHeaderCell>
                                    <CTableHeaderCell>Formule</CTableHeaderCell>
                                    {tab === 'toutes' && <CTableHeaderCell>Publication</CTableHeaderCell>}
                                    <CTableHeaderCell>Vérification</CTableHeaderCell>
                                    <CTableHeaderCell>Offres</CTableHeaderCell>
                                    <CTableHeaderCell className='text-end'>Actions</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {data.data.map((e) => (
                                    <CTableRow key={e.id}>
                                        <CTableDataCell style={{ minWidth: 240 }}>
                                            <button type='button' className='btn btn-link p-0 fw-semibold text-start text-decoration-none' onClick={() => setViewing(e)}>
                                                {e.name}
                                            </button>
                                            <div className='small text-body-secondary'>
                                                {e.subCategory || categoryLabel(e.category)} · {e.city} · modifiée le {formatDateTime(e.updatedAt)}
                                            </div>
                                            {e.accreditation && (
                                                <div className='small'>
                                                    Accréditation déclarée : {e.accreditation} {e.accreditationVerified ? '(vérifiée)' : '(à vérifier)'}
                                                </div>
                                            )}
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <PlanBadge code={e.plan.code} />
                                            {e.requestedPlan && e.requestedPlan.code !== e.plan.code && <RequestedPlanBadge plan={e.requestedPlan} className='ms-1' />}
                                        </CTableDataCell>
                                        {tab === 'toutes' && (
                                            <CTableDataCell>
                                                <StatusBadge status={e.status}>{e.statusLabel}</StatusBadge>
                                            </CTableDataCell>
                                        )}
                                        <CTableDataCell>
                                            <StatusBadge status={verificationStatus(e.verification.status)}>{e.verification.status}</StatusBadge>
                                        </CTableDataCell>
                                        <CTableDataCell>{e.publishedOffersCount}</CTableDataCell>
                                        <CTableDataCell className='text-end text-nowrap'>
                                            {e.status === 'pending_review' && (
                                                <CButton
                                                    size='sm'
                                                    color='success'
                                                    className='text-white me-2'
                                                    onClick={() => moderate(e, { status: 'published' }, `${e.name} est inscrit et publié sur Edumada.`)}
                                                >
                                                    Accepter
                                                </CButton>
                                            )}
                                            <CButton size='sm' color='primary' variant='outline' className='me-2' onClick={() => setViewing(e)}>
                                                Détails
                                            </CButton>
                                            <CDropdown alignment='end' className='d-inline-block'>
                                                <CDropdownToggle color='secondary' variant='outline' size='sm'>
                                                    Décider
                                                </CDropdownToggle>
                                                <CDropdownMenu>
                                                    {e.status !== 'published' && (
                                                        <CDropdownItem as='button' onClick={() => moderate(e, { status: 'published' }, 'Fiche publiée')}>
                                                            Publier
                                                        </CDropdownItem>
                                                    )}
                                                    {e.status === 'published' && (
                                                        <CDropdownItem as='button' onClick={() => moderate(e, { status: 'suspended' }, 'Fiche suspendue')}>
                                                            Suspendre
                                                        </CDropdownItem>
                                                    )}
                                                    {e.verification.status !== 'Vérifié' ? (
                                                        <CDropdownItem as='button' onClick={() => moderate(e, { verification: 'verified' }, 'Badge « vérifié » accordé')}>
                                                            Accorder le badge « vérifié »
                                                        </CDropdownItem>
                                                    ) : (
                                                        <CDropdownItem as='button' onClick={() => moderate(e, { verification: 'unverified' }, 'Badge retiré')}>
                                                            Retirer le badge
                                                        </CDropdownItem>
                                                    )}
                                                    {e.accreditation && (
                                                        <CDropdownItem
                                                            as='button'
                                                            onClick={() => moderate(e, { accreditationVerified: !e.accreditationVerified }, 'Accréditation mise à jour')}
                                                        >
                                                            {e.accreditationVerified ? "Annuler l'accréditation vérifiée" : 'Accréditation vérifiée'}
                                                        </CDropdownItem>
                                                    )}
                                                    <CDropdownDivider />
                                                    <CDropdownItem as='button' onClick={() => setActivating(e)}>
                                                        Activer une formule
                                                    </CDropdownItem>
                                                    <CDropdownItem as='button' onClick={() => setTeam(e)}>
                                                        Gérer l&apos;équipe
                                                    </CDropdownItem>
                                                    {e.status === 'published' && (
                                                        <CDropdownItem href={`${SITE_URL}/etablissements/${e.id}/`} target='_blank' rel='noopener noreferrer'>
                                                            Voir sur le site
                                                        </CDropdownItem>
                                                    )}
                                                </CDropdownMenu>
                                            </CDropdown>
                                        </CTableDataCell>
                                    </CTableRow>
                                ))}
                            </CTableBody>
                        </CTable>
                        <Pager meta={data.meta} onChange={(page) => setFilters({ ...filters, page })} />
                    </>
                )}
            </PageCard>

            <CModal visible={!!team} onClose={() => setTeam(null)} size='lg'>
                <CModalHeader>
                    <CModalTitle>Équipe — {team?.name}</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    {team && (
                        <Members
                            establishment={team}
                            onDone={() => {
                                setTeam(null)
                                reload()
                            }}
                        />
                    )}
                </CModalBody>
            </CModal>

            {activating && (
                <ActivatePlanModal
                    establishment={activating}
                    onClose={() => setActivating(null)}
                    onDone={() => {
                        setActivating(null)
                        refresh()
                    }}
                />
            )}
            {viewing && (
                <EstablishmentDetail
                    establishment={viewing}
                    categoryLabel={categoryLabel(viewing.category)}
                    onClose={() => setViewing(null)}
                    onActivatePlan={() => {
                        setActivating(viewing)
                        setViewing(null)
                    }}
                    onAccept={
                        viewing.status === 'pending_review'
                            ? () => {
                                  moderate(viewing, { status: 'published' }, `${viewing.name} est inscrit et publié sur Edumada.`)
                                  setViewing(null)
                              }
                            : undefined
                    }
                />
            )}

            {refusing && (
                <RefuseModal
                    establishment={refusing}
                    onClose={() => setRefusing(null)}
                    onDone={() => {
                        setRefusing(null)
                        refresh()
                    }}
                />
            )}
        </>
    )
}

/** /admin/etablissements/ (toutes catégories) ou /admin/etablissements/?categorie=… (une entrée du menu par catégorie). */
export default function Establishments() {
    const category = useSearchParams().get('categorie')
    return <EstablishmentList key={category ?? 'all'} category={category} />
}
