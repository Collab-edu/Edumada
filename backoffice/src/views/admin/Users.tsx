'use client'
import { useState } from 'react'
import { CFormInput, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import { useApi } from '@/lib/useApi'
import type { AdminUser, Paginated } from '@/lib/types'
import { EmptyState, Loading, PageCard, Pager } from '@/components/ui'
import PageBanner from '@/components/PageBanner'

/** Liste des étudiants inscrits : nom et prénom, ville, téléphone. */
export default function Users() {
    const [filters, setFilters] = useState({ q: '', page: 1 })
    const { data } = useApi<Paginated<AdminUser>>('/admin/users', { role: 'student', ...filters })

    return (
        <>
            <PageBanner title='Étudiants' description={data ? `${data.meta.total} étudiant${data.meta.total > 1 ? 's' : ''} inscrit${data.meta.total > 1 ? 's' : ''}` : undefined} />
            <PageCard>
                <CFormInput
                    className='mb-3'
                    placeholder='Rechercher un nom, une ville ou un téléphone'
                    value={filters.q}
                    onChange={(e) => setFilters({ q: e.target.value, page: 1 })}
                />
                {!data ? (
                    <Loading />
                ) : data.data.length === 0 ? (
                    <EmptyState title='Aucun étudiant' />
                ) : (
                    <>
                        <CTable align='middle' hover responsive className='mb-0'>
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell>Nom et prénom</CTableHeaderCell>
                                    <CTableHeaderCell>Ville</CTableHeaderCell>
                                    <CTableHeaderCell>Téléphone</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {data.data.map((u) => (
                                    <CTableRow key={u.id}>
                                        <CTableDataCell className='fw-semibold'>{u.name}</CTableDataCell>
                                        <CTableDataCell>{u.city || <span className='text-body-secondary'>—</span>}</CTableDataCell>
                                        <CTableDataCell className='text-nowrap'>
                                            {u.phone ? (
                                                <a href={`tel:${u.phone.replace(/\s/g, '')}`} className='text-decoration-none'>
                                                    {u.phone}
                                                </a>
                                            ) : (
                                                <span className='text-body-secondary'>—</span>
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
