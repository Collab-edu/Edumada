'use client'
import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import {
    CAlert,
    CButton,
    CCol,
    CDropdown,
    CDropdownDivider,
    CDropdownItem,
    CDropdownMenu,
    CDropdownToggle,
    CForm,
    CFormInput,
    CFormSelect,
    CListGroup,
    CListGroupItem,
    CModal,
    CModalBody,
    CModalHeader,
    CModalTitle,
    CRow,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
} from '@coreui/react'
import { useEstablishment } from '@/context/EstablishmentContext'
import { useToast } from '@/context/ToastContext'
import { api, errorMessage, SITE_URL } from '@/lib/api'
import { useApi } from '@/lib/useApi'
import { formatDateTime } from '@/lib/format'
import type { ManagedEstablishment, Paginated } from '@/lib/types'
import { ErrorAlert, Loading, PageCard, Pager, StatusBadge } from '@/components/ui'
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

const verificationStatus = (status: string) => (status === 'Vérifié' ? 'approved' : status === 'En cours' ? 'pending' : 'draft')

export default function Establishments() {
    const params = useSearchParams()
    const toast = useToast()
    const { select } = useEstablishment()
    const [filters, setFilters] = useState({ status: params.get('status') ?? '', verification: params.get('verification') ?? '', q: '', page: 1 })
    const { data, reload } = useApi<Paginated<ManagedEstablishment>>('/admin/establishments', filters)
    const [team, setTeam] = useState<ManagedEstablishment | null>(null)

    const moderate = async (e: ManagedEstablishment, body: Record<string, unknown>, message: string) => {
        try {
            await api(`/establishments/${e.id}/moderation`, { method: 'PUT', body })
            toast.success(message)
            reload()
        } catch (err) {
            toast.error(errorMessage(err))
        }
    }

    return (
        <>
            <PageBanner description="Le badge « vérifié » s'accorde après un contrôle réel, jamais du seul fait d'un paiement." />
            <PageCard title={data ? `${data.meta.total} fiche(s)` : 'Fiches établissement'}>
                <CRow className='g-2 mb-3'>
                    <CCol md={4}>
                        <CFormInput placeholder='Rechercher un nom ou une ville' value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value, page: 1 })} />
                    </CCol>
                    <CCol md={4}>
                        <CFormSelect aria-label='Publication' value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}>
                            <option value=''>Toutes les publications</option>
                            <option value='pending_review'>En attente de validation</option>
                            <option value='published'>Publiées</option>
                            <option value='draft'>Brouillons</option>
                            <option value='suspended'>Suspendues</option>
                        </CFormSelect>
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

                {!data ? (
                    <Loading />
                ) : (
                    <>
                        <CTable align='middle' hover responsive className='mb-0'>
                            <CTableHead className='text-nowrap'>
                                <CTableRow>
                                    <CTableHeaderCell>Établissement</CTableHeaderCell>
                                    <CTableHeaderCell>Publication</CTableHeaderCell>
                                    <CTableHeaderCell>Vérification</CTableHeaderCell>
                                    <CTableHeaderCell>Formule</CTableHeaderCell>
                                    <CTableHeaderCell>Équipe</CTableHeaderCell>
                                    <CTableHeaderCell className='text-end'>Actions</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {data.data.map((e) => (
                                    <CTableRow key={e.id}>
                                        <CTableDataCell style={{ minWidth: 240 }}>
                                            <strong>{e.name}</strong>
                                            <div className='small text-body-secondary'>
                                                {e.subCategory || e.category} · {e.city} · modifiée le {formatDateTime(e.updatedAt)}
                                            </div>
                                            {e.accreditation && (
                                                <div className='small'>
                                                    Accréditation déclarée : {e.accreditation} {e.accreditationVerified ? '(vérifiée)' : '(à vérifier)'}
                                                </div>
                                            )}
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <StatusBadge status={e.status}>{e.statusLabel}</StatusBadge>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <StatusBadge status={verificationStatus(e.verification.status)}>{e.verification.status}</StatusBadge>
                                        </CTableDataCell>
                                        <CTableDataCell>{e.plan.name}</CTableDataCell>
                                        <CTableDataCell>{e.members?.length ?? 0}</CTableDataCell>
                                        <CTableDataCell className='text-end text-nowrap'>
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
                        {data.data.length === 0 && (
                            <CAlert color='light' className='mt-3 mb-0'>
                                Aucune fiche ne correspond.
                            </CAlert>
                        )}
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
        </>
    )
}
