'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
    CAlert,
    CBadge,
    CButton,
    CCloseButton,
    CCol,
    CInputGroup,
    CInputGroupText,
    CFormInput,
    CFormSelect,
    CFormTextarea,
    CListGroup,
    CListGroupItem,
    COffcanvas,
    COffcanvasBody,
    COffcanvasHeader,
    COffcanvasTitle,
    CRow,
    CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilChevronRight, cilEnvelopeClosed, cilPaperclip, cilPhone, cilSearch, cilVerticalAlignBottom } from '@coreui/icons'
import { useCurrentEstablishment } from '@/context/EstablishmentContext'
import { useToast } from '@/context/ToastContext'
import { api, downloadFile, errorMessage } from '@/lib/api'
import { useApi } from '@/lib/useApi'
import { formatDateTime } from '@/lib/format'
import { INQUIRY_STATUS_LABELS as STATUS_LABELS } from '@/lib/labels'
import type { Inquiry, InquiryStatus, Paginated } from '@/lib/types'
import { EmptyState, Loading, PageCard, Pager, STATUS_COLORS, StatusBadge } from '@/components/ui'
import PageBanner from '@/components/PageBanner'

function InquiryDetail({ inquiry, onChanged }: { inquiry: Inquiry; onChanged: (updated: Inquiry) => void }) {
    const toast = useToast()
    const [status, setStatus] = useState<InquiryStatus>(inquiry.status === 'new' ? 'in_review' : inquiry.status)
    const [note, setNote] = useState('')
    const [saving, setSaving] = useState(false)

    const save = async () => {
        setSaving(true)
        try {
            const res = await api<{ data: Inquiry }>(`/inquiries/${inquiry.id}/status`, { method: 'PUT', body: { status, note: note || undefined } })
            toast.success("Statut mis à jour : l'étudiant est prévenu par e-mail.")
            setNote('')
            onChanged(res.data)
        } catch (err) {
            toast.error(errorMessage(err))
        } finally {
            setSaving(false)
        }
    }

    return (
        <>
            <div className='d-flex flex-wrap gap-2 mb-3'>
                <CBadge color={inquiry.type === 'application' ? 'primary' : 'secondary'}>{inquiry.typeLabel}</CBadge>
                <StatusBadge status={inquiry.status}>{STATUS_LABELS[inquiry.status]}</StatusBadge>
                <span className='small text-body-secondary'>{formatDateTime(inquiry.createdAt)}</span>
            </div>
            <CListGroup className='mb-3'>
                <CListGroupItem as='a' href={`mailto:${inquiry.email}`}>
                    <CIcon icon={cilEnvelopeClosed} className='me-2' />
                    {inquiry.email}
                </CListGroupItem>
                {inquiry.phone && (
                    <CListGroupItem as='a' href={`tel:${inquiry.phone.replace(/\s/g, '')}`}>
                        <CIcon icon={cilPhone} className='me-2' />
                        {inquiry.phone}
                    </CListGroupItem>
                )}
                <CListGroupItem>Offre : {inquiry.offer?.title ?? "l'établissement"}</CListGroupItem>
            </CListGroup>
            {inquiry.message && <p style={{ whiteSpace: 'pre-line' }}>{inquiry.message}</p>}

            {!!inquiry.attachments?.length && (
                <>
                    <h6>Documents joints</h6>
                    <CListGroup className='mb-3'>
                        {inquiry.attachments.map((f) => (
                            <CListGroupItem
                                key={f.id}
                                as='button'
                                type='button'
                                className='d-flex align-items-center'
                                onClick={() => downloadFile(`/inquiries/${inquiry.id}/attachments/${f.id}`, f.name).catch((e) => toast.error(errorMessage(e)))}
                            >
                                <CIcon icon={cilPaperclip} className='me-2' />
                                <span className='me-auto text-truncate'>{f.name}</span>
                                <small className='text-body-secondary'>{Math.round(f.size / 1024)} Ko</small>
                            </CListGroupItem>
                        ))}
                    </CListGroup>
                </>
            )}

            {!!inquiry.history?.length && (
                <>
                    <h6>Historique</h6>
                    <ul className='list-unstyled border-start border-2 ps-3 mb-4' style={{ borderColor: 'var(--edu-sage) !important' }}>
                        {inquiry.history.map((step, i) => (
                            <li key={i} className='mb-2'>
                                <div className='fw-semibold'>{STATUS_LABELS[step.to]}</div>
                                <div className='small text-body-secondary'>{formatDateTime(step.at)}</div>
                                {step.note && <div className='small bg-body-tertiary rounded px-2 py-1 mt-1'>{step.note}</div>}
                            </li>
                        ))}
                    </ul>
                </>
            )}

            <h6>Traiter la demande</h6>
            <CFormSelect className='mb-2' label='Nouveau statut' value={status} onChange={(e) => setStatus(e.target.value as InquiryStatus)}>
                {Object.entries(STATUS_LABELS)
                    .filter(([key]) => key !== 'new')
                    .map(([key, label]) => (
                        <option key={key} value={key}>
                            {label}
                        </option>
                    ))}
            </CFormSelect>
            <CFormTextarea className='mb-3' label="Message pour l'étudiant (facultatif)" rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
            <CButton color='primary' className='w-100' disabled={saving} onClick={save}>
                {saving && <CSpinner size='sm' className='me-2' />}
                Mettre à jour et prévenir l&apos;étudiant
            </CButton>
        </>
    )
}

const initials = (name: string) =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join('')

type Inbox = Paginated<Inquiry> & { counts?: Partial<Record<InquiryStatus, number>> }

export default function Inquiries() {
    const { current: e } = useCurrentEstablishment()
    const toast = useToast()
    const router = useRouter()
    const params = useSearchParams()
    const openId = params.get('id')
    const [filters, setFilters] = useState({ status: params.get('status') ?? '', type: '', offer: '', q: params.get('q') ?? '', page: 1 })
    // Recherche lancée depuis l'en-tête alors que la page est déjà ouverte.
    const urlQuery = params.get('q')
    const urlStatus = params.get('status')
    useEffect(() => {
        if (urlQuery !== null || urlStatus !== null) setFilters((f) => ({ ...f, q: urlQuery ?? f.q, status: urlStatus ?? f.status, page: 1 }))
    }, [urlQuery, urlStatus])
    const hasInbox = !!e.plan.features.inquiryInbox
    const { data, loading, reload } = useApi<Inbox>(hasInbox ? `/establishments/${e.id}/inquiries` : null, filters)
    const [selected, setSelected] = useState<Inquiry | null>(null)

    useEffect(() => {
        if (!openId) {
            setSelected(null)
            return
        }
        api<{ data: Inquiry }>(`/inquiries/${openId}`)
            .then((res) => setSelected(res.data))
            .catch(() => setSelected(null))
    }, [openId])

    if (!hasInbox) {
        return (
            <>
                <PageBanner />
                <PageCard title='Demandes et candidatures' subtitle={`Formule ${e.plan.name}`}>
                    <CAlert color='info'>
                        Avec la formule Gratuit, chaque demande et candidature vous est envoyée par e-mail
                        {e.email ? ` à ${e.email}` : ''}, avec les coordonnées de l&apos;étudiant.
                    </CAlert>
                    <p>La boîte de réception (Pro et Premium) centralise toutes les demandes, avec statuts, notes envoyées à l&apos;étudiant, filtres et export CSV.</p>
                    <CButton color='primary' as={Link} href='/formule/'>
                        Passer à Pro
                    </CButton>
                </PageCard>
            </>
        )
    }

    const counts = data?.counts ?? {}
    const total = Object.values(counts).reduce((a, b) => a + Number(b), 0)
    const close = () => router.push('/demandes/')

    const tabs: [string, string, number][] = [
        ['', 'Toutes', total],
        ...Object.entries(STATUS_LABELS).map(([key, label]) => [key, label, Number(counts[key as InquiryStatus] ?? 0)] as [string, string, number]),
    ]
    const openRow = (id: number | string) => router.push(`/demandes/?id=${id}`)

    return (
        <>
            <div className='bo-page-head'>
                <div>
                    <h1>Demandes</h1>
                    <p>{counts.new ? `${counts.new} nouvelle(s) demande(s) à traiter.` : 'Demandes d’information et candidatures reçues.'}</p>
                </div>
                <CButton
                    className='bo-btn-white'
                    onClick={() =>
                        downloadFile(
                            `/establishments/${e.id}/inquiries/export?status=${filters.status}&type=${filters.type}&offer=${filters.offer}`,
                            `demandes-${e.id}.csv`
                        ).catch((err) => toast.error(errorMessage(err)))
                    }
                >
                    <CIcon icon={cilVerticalAlignBottom} className='me-2' />
                    Exporter (CSV)
                </CButton>
            </div>

            <div className='card bo-list-card'>
                <div className='bo-list-tools'>
                    <div className='bo-segmented' role='tablist' aria-label='Statut'>
                        {tabs.map(([value, label, count]) => (
                            <button
                                key={value}
                                type='button'
                                role='tab'
                                aria-selected={filters.status === value}
                                className={filters.status === value ? 'is-active' : ''}
                                onClick={() => setFilters({ ...filters, status: value, page: 1 })}
                            >
                                {label}
                                <span className='bo-segmented-count'>{count}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <CRow className='g-2 bo-list-filters'>
                    <CCol md={4}>
                        <CInputGroup className='bo-icon-input'>
                            <CInputGroupText>
                                <CIcon icon={cilSearch} />
                            </CInputGroupText>
                            <CFormInput
                                placeholder='Rechercher un nom ou un e-mail'
                                aria-label='Rechercher un nom ou un e-mail'
                                value={filters.q}
                                onChange={(ev) => setFilters({ ...filters, q: ev.target.value, page: 1 })}
                            />
                        </CInputGroup>
                    </CCol>
                    <CCol md={4}>
                        <CFormSelect value={filters.type} onChange={(ev) => setFilters({ ...filters, type: ev.target.value, page: 1 })} aria-label='Type'>
                            <option value=''>Tous les types</option>
                            <option value='information'>Demandes d&apos;information</option>
                            <option value='application'>Candidatures</option>
                        </CFormSelect>
                    </CCol>
                    <CCol md={4}>
                        <CFormSelect value={filters.offer} onChange={(ev) => setFilters({ ...filters, offer: ev.target.value, page: 1 })} aria-label='Offre'>
                            <option value=''>Toutes les offres</option>
                            {(e.offers ?? []).map((o) => (
                                <option key={o.id} value={o.id}>
                                    {o.title}
                                </option>
                            ))}
                        </CFormSelect>
                    </CCol>
                </CRow>

                {loading && !data ? (
                    <div className='p-4'>
                        <Loading />
                    </div>
                ) : !data?.data.length ? (
                    <div className='p-4'>
                        <EmptyState title='Aucune demande'>Les demandes des étudiants apparaîtront ici.</EmptyState>
                    </div>
                ) : (
                    <>
                        <div className='table-responsive'>
                            <table className='bo-list-table'>
                                <thead>
                                    <tr>
                                        <th>Étudiant</th>
                                        <th>Type</th>
                                        <th>Offre</th>
                                        <th>Statut</th>
                                        <th>Reçue</th>
                                        <th aria-hidden='true' />
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.data.map((i) => (
                                        <tr
                                            key={i.id}
                                            role='button'
                                            tabIndex={0}
                                            onClick={() => openRow(i.id)}
                                            onKeyDown={(ev) => ev.key === 'Enter' && openRow(i.id)}
                                            className={i.status === 'new' ? 'is-new' : ''}
                                        >
                                            <td>
                                                <div className='d-flex align-items-center gap-3'>
                                                    <span className='bo-list-avatar'>{initials(i.name)}</span>
                                                    <div style={{ minWidth: 0 }}>
                                                        <div className='bo-list-name'>{i.name}</div>
                                                        <div className='bo-list-sub'>{i.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className='bo-tag'>{i.typeLabel}</span>
                                            </td>
                                            <td className='bo-list-offer'>{i.offer?.title ?? '—'}</td>
                                            <td>
                                                <span className={`bo-pill bo-pill-${STATUS_COLORS[i.status] ?? 'secondary'}`}>{STATUS_LABELS[i.status]}</span>
                                            </td>
                                            <td className='text-nowrap'>{formatDateTime(i.createdAt)}</td>
                                            <td className='bo-list-chevron'>
                                                <CIcon icon={cilChevronRight} size='sm' />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className='bo-list-foot'>
                            <span>
                                {data.meta.total} résultat{data.meta.total > 1 ? 's' : ''}
                            </span>
                            <Pager meta={data.meta} onChange={(page) => setFilters({ ...filters, page })} />
                        </div>
                    </>
                )}
            </div>

            <COffcanvas placement='end' visible={!!selected} onHide={close} style={{ width: 'min(480px, 100vw)' }}>
                <COffcanvasHeader>
                    <COffcanvasTitle>{selected?.name}</COffcanvasTitle>
                    <CCloseButton className='text-reset' onClick={close} />
                </COffcanvasHeader>
                <COffcanvasBody>
                    {selected && (
                        <InquiryDetail
                            key={selected.updatedAt}
                            inquiry={selected}
                            onChanged={(updated) => {
                                setSelected(updated)
                                reload()
                            }}
                        />
                    )}
                </COffcanvasBody>
            </COffcanvas>
        </>
    )
}
