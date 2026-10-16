'use client'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import {
    CAlert,
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
import { useEstablishment } from '@/context/EstablishmentContext'
import { useToast } from '@/context/ToastContext'
import { api, errorMessage, SITE_URL } from '@/lib/api'
import { useApi } from '@/lib/useApi'
import { notifyEstablishmentsChanged, useEstablishmentCounts } from '@/lib/useEstablishmentCounts'
import { formatDate, formatDateTime } from '@/lib/format'
import type { ManagedEstablishment, Paginated, Plan } from '@/lib/types'
import { EmptyState, ErrorAlert, Loading, PageCard, Pager, PlanBadge, StatusBadge } from '@/components/ui'
import PageBanner from '@/components/PageBanner'

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
    const { select } = useEstablishment()
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
                <CNav variant='underline-border' className='mb-3 flex-nowrap overflow-auto'>
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
                        <CAlert color='info' className='small'>
                            Vérifiez que l&apos;établissement existe et que les coordonnées sont joignables avant d&apos;accepter. L&apos;établissement est prévenu par e-mail de
                            votre décision.
                        </CAlert>
                        {data.data.map((e) => (
                            <div key={e.id} className='border rounded-3 p-3 mb-3 border-start border-4 border-warning'>
                                <div className='d-flex flex-wrap align-items-start gap-3'>
                                    <div className='me-auto' style={{ minWidth: 220 }}>
                                        <div className='fw-semibold fs-5'>{e.name}</div>
                                        <div className='small text-body-secondary'>
                                            {[e.subCategory || categoryLabel(e.category), e.type, e.city].filter(Boolean).join(' · ')} · demande du {formatDate(e.createdAt ?? e.updatedAt)}
                                        </div>
                                        <div className='small mt-2 d-flex flex-wrap gap-3'>
                                            {e.email && (
                                                <a href={`mailto:${e.email}`} className='text-decoration-none'>
                                                    <CIcon icon={cilEnvelopeClosed} className='me-1' />
                                                    {e.email}
                                                </a>
                                            )}
                                            {e.phone && (
                                                <a href={`tel:${e.phone.replace(/\s/g, '')}`} className='text-decoration-none'>
                                                    <CIcon icon={cilPhone} className='me-1' />
                                                    {e.phone}
                                                </a>
                                            )}
                                        </div>
                                        <div className='small text-body-secondary mt-1'>
                                            Demandé par : {e.members?.length ? e.members.map((m) => `${m.name} (${m.email})`).join(', ') : 'aucun compte rattaché'}
                                        </div>
                                        {e.accreditation && <div className='small mt-1'>Accréditation déclarée : {e.accreditation}</div>}
                                    </div>
                                    <div className='d-flex flex-wrap gap-2'>
                                        <CButton color='success' className='text-white' onClick={() => moderate(e, { status: 'published' }, `${e.name} est inscrit et publié sur Edumada.`)}>
                                            <CIcon icon={cilCheckAlt} className='me-1' />
                                            Accepter l&apos;adhésion
                                        </CButton>
                                        <CButton color='danger' variant='outline' onClick={() => setRefusing(e)}>
                                            <CIcon icon={cilX} className='me-1' />
                                            Refuser
                                        </CButton>
                                        <CButton color='secondary' variant='ghost' onClick={() => select(e.id, '/fiche/')}>
                                            Voir la fiche
                                        </CButton>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Pager meta={data.meta} onChange={(page) => setFilters({ ...filters, page })} />
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
                                            <strong>{e.name}</strong>
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
                                            <CButton size='sm' color='primary' className='me-2' onClick={() => select(e.id, '/fiche/')}>
                                                Gérer
                                            </CButton>
                                            <CDropdown alignment='end'>
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
