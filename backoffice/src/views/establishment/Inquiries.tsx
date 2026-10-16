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
    CFormInput,
    CFormSelect,
    CFormTextarea,
    CListGroup,
    CListGroupItem,
    CNav,
    CNavItem,
    CNavLink,
    COffcanvas,
    COffcanvasBody,
    COffcanvasHeader,
    COffcanvasTitle,
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
import { cilCloudDownload, cilEnvelopeClosed, cilPaperclip, cilPhone } from '@coreui/icons'
import { useCurrentEstablishment } from '@/context/EstablishmentContext'
import { useToast } from '@/context/ToastContext'
import { api, downloadFile, errorMessage } from '@/lib/api'
import { useApi } from '@/lib/useApi'
import { formatDateTime } from '@/lib/format'
import { INQUIRY_STATUS_LABELS as STATUS_LABELS } from '@/lib/labels'
import type { Inquiry, InquiryStatus, Paginated } from '@/lib/types'
import { EmptyState, Loading, PageCard, Pager, StatusBadge } from '@/components/ui'
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

type Inbox = Paginated<Inquiry> & { counts?: Partial<Record<InquiryStatus, number>> }

export default function Inquiries() {
    const { current: e } = useCurrentEstablishment()
    const toast = useToast()
    const router = useRouter()
    const openId = useSearchParams().get('id')
    const [filters, setFilters] = useState({ status: '', type: '', offer: '', q: '', page: 1 })
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

    return (
        <>
            <PageBanner
                description={counts.new ? `${counts.new} nouvelle(s) demande(s) à traiter.` : undefined}
                actions={
                    <CButton
                        color='light'
                        onClick={() =>
                            downloadFile(
                                `/establishments/${e.id}/inquiries/export?status=${filters.status}&type=${filters.type}&offer=${filters.offer}`,
                                `demandes-${e.id}.csv`
                            ).catch((err) => toast.error(errorMessage(err)))
                        }
                    >
                        <CIcon icon={cilCloudDownload} className='me-2' />
                        Exporter (CSV)
                    </CButton>
                }
            />
            <PageCard>
                <CNav variant='underline-border' className='mb-3 flex-nowrap bo-tabs'>
                    {[['', `Toutes (${total})`], ...Object.entries(STATUS_LABELS).map(([key, label]) => [key, `${label} (${counts[key as InquiryStatus] ?? 0})`])].map(
                        ([value, label]) => (
                            <CNavItem key={value}>
                                <CNavLink
                                    as='button'
                                    active={filters.status === value}
                                    onClick={() => setFilters({ ...filters, status: value, page: 1 })}
                                    className='text-nowrap'
                                >
                                    {label}
                                </CNavLink>
                            </CNavItem>
                        )
                    )}
                </CNav>
                <CRow className='g-2 mb-3'>
                    <CCol md={4}>
                        <CFormInput placeholder='Rechercher un nom ou un e-mail' value={filters.q} onChange={(ev) => setFilters({ ...filters, q: ev.target.value, page: 1 })} />
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
                    <Loading />
                ) : !data?.data.length ? (
                    <EmptyState title='Aucune demande'>Les demandes des étudiants apparaîtront ici.</EmptyState>
                ) : (
                    <>
                        <CTable align='middle' hover responsive className='mb-0'>
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell>Étudiant</CTableHeaderCell>
                                    <CTableHeaderCell>Type</CTableHeaderCell>
                                    <CTableHeaderCell>Offre</CTableHeaderCell>
                                    <CTableHeaderCell>Statut</CTableHeaderCell>
                                    <CTableHeaderCell>Reçue</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {data.data.map((i) => (
                                    <CTableRow key={i.id} role='button' onClick={() => router.push(`/demandes/?id=${i.id}`)} className={i.status === 'new' ? 'fw-semibold' : ''}>
                                        <CTableDataCell>
                                            {i.name}
                                            <div className='small text-body-secondary fw-normal'>{i.email}</div>
                                        </CTableDataCell>
                                        <CTableDataCell>{i.typeLabel}</CTableDataCell>
                                        <CTableDataCell>{i.offer?.title ?? '—'}</CTableDataCell>
                                        <CTableDataCell>
                                            <StatusBadge status={i.status}>{STATUS_LABELS[i.status]}</StatusBadge>
                                        </CTableDataCell>
                                        <CTableDataCell className='small text-body-secondary text-nowrap'>{formatDateTime(i.createdAt)}</CTableDataCell>
                                    </CTableRow>
                                ))}
                            </CTableBody>
                        </CTable>
                        <Pager meta={data.meta} onChange={(page) => setFilters({ ...filters, page })} />
                    </>
                )}
            </PageCard>

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
