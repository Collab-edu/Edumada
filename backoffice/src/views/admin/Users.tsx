'use client'
import { useState } from 'react'
import { CButton, CCol, CFormInput, CFormSelect, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash } from '@coreui/icons'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { api, errorMessage } from '@/lib/api'
import { useApi } from '@/lib/useApi'
import { formatDateTime } from '@/lib/format'
import type { AdminUser, Paginated } from '@/lib/types'
import { Loading, PageCard, Pager } from '@/components/ui'
import PageBanner from '@/components/PageBanner'

export default function Users() {
    const { user: me } = useAuth()
    const toast = useToast()
    const [filters, setFilters] = useState({ role: '', q: '', page: 1 })
    const { data, reload } = useApi<Paginated<AdminUser>>('/admin/users', filters)

    const run = async (action: () => Promise<unknown>, message: string) => {
        try {
            await action()
            toast.success(message)
            reload()
        } catch (err) {
            toast.error(errorMessage(err))
        }
    }

    return (
        <>
            <PageBanner />
            <PageCard title={data ? `${data.meta.total} compte(s)` : 'Comptes'}>
                <CRow className='g-2 mb-3'>
                    <CCol md={8}>
                        <CFormInput placeholder='Rechercher un nom ou un e-mail' value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value, page: 1 })} />
                    </CCol>
                    <CCol md={4}>
                        <CFormSelect aria-label='Type de compte' value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}>
                            <option value=''>Tous les comptes</option>
                            <option value='student'>Étudiants</option>
                            <option value='establishment'>Établissements</option>
                            <option value='admin'>Administrateurs</option>
                        </CFormSelect>
                    </CCol>
                </CRow>
                {!data ? (
                    <Loading />
                ) : (
                    <>
                        <CTable align='middle' hover responsive className='mb-0'>
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell>Nom</CTableHeaderCell>
                                    <CTableHeaderCell>Type de compte</CTableHeaderCell>
                                    <CTableHeaderCell>Établissements</CTableHeaderCell>
                                    <CTableHeaderCell>Demandes</CTableHeaderCell>
                                    <CTableHeaderCell>Inscrit le</CTableHeaderCell>
                                    <CTableHeaderCell />
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {data.data.map((u) => (
                                    <CTableRow key={u.id}>
                                        <CTableDataCell>
                                            {u.name}
                                            <div className='small text-body-secondary'>{u.email}</div>
                                        </CTableDataCell>
                                        <CTableDataCell style={{ minWidth: 160 }}>
                                            <CFormSelect
                                                size='sm'
                                                aria-label={`Type de compte de ${u.name}`}
                                                value={u.role}
                                                disabled={u.id === me?.id}
                                                onChange={(e) =>
                                                    run(() => api(`/admin/users/${u.id}`, { method: 'PATCH', body: { role: e.target.value } }), 'Type de compte modifié')
                                                }
                                            >
                                                <option value='student'>Étudiant</option>
                                                <option value='establishment'>Établissement</option>
                                                <option value='admin'>Administrateur</option>
                                            </CFormSelect>
                                        </CTableDataCell>
                                        <CTableDataCell className='small'>{u.establishments.map((e) => e.name).join(', ') || '—'}</CTableDataCell>
                                        <CTableDataCell>{u.inquiriesCount}</CTableDataCell>
                                        <CTableDataCell className='small text-body-secondary text-nowrap'>{formatDateTime(u.createdAt)}</CTableDataCell>
                                        <CTableDataCell className='text-end'>
                                            {u.id !== me?.id && (
                                                <CButton
                                                    color='danger'
                                                    variant='ghost'
                                                    size='sm'
                                                    aria-label={`Supprimer ${u.name}`}
                                                    onClick={() =>
                                                        window.confirm(`Supprimer le compte de ${u.name} ?`) &&
                                                        run(() => api(`/admin/users/${u.id}`, { method: 'DELETE' }), 'Compte supprimé')
                                                    }
                                                >
                                                    <CIcon icon={cilTrash} />
                                                </CButton>
                                            )}
                                        </CTableDataCell>
                                    </CTableRow>
                                ))}
                            </CTableBody>
                        </CTable>
                        <Pager meta={data.meta} onChange={(page) => setFilters({ ...filters, page })} />
                    </>
                )}
            </PageCard>
        </>
    )
}
