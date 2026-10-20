'use client'
import { useState } from 'react'
import { CFormInput, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import { useApi } from '@/lib/useApi'
import type { AdminUser, Paginated } from '@/lib/types'
import { EmptyState, Loading, NumberedPager, PageCard } from '@/components/ui'
import PageBanner from '@/components/PageBanner'

/** Couleurs d'avatar, choisies d'après l'identifiant pour rester stables. */
const AVATARS = [
    { background: '#ffe5e8', color: '#ff3b52' },
    { background: '#dbe7ea', color: '#0f4c5c' },
    { background: '#e3eeeb', color: '#2f6b5f' },
    { background: '#fdf0d5', color: '#9a6700' },
]

const initials = (name: string) =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join('')

/** Date courte : 16/10/26. */
const shortDate = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })

/** Liste des étudiants inscrits : identité, niveau et ville, statut d'activité, date d'inscription. */
export default function Users() {
    const [filters, setFilters] = useState({ q: '', page: 1 })
    const { data } = useApi<Paginated<AdminUser>>('/admin/users', { role: 'student', ...filters })

    return (
        <>
            <PageBanner title='Étudiants' description={data ? `${data.meta.total} étudiant${data.meta.total > 1 ? 's' : ''} inscrit${data.meta.total > 1 ? 's' : ''}` : undefined} />
            <PageCard>
                <CFormInput
                    className='mb-3'
                    placeholder='Rechercher un nom, un e-mail, une ville ou un téléphone'
                    value={filters.q}
                    onChange={(e) => setFilters({ q: e.target.value, page: 1 })}
                />
                {!data ? (
                    <Loading />
                ) : data.data.length === 0 ? (
                    <EmptyState title='Aucun étudiant' />
                ) : (
                    <>
                        <CTable align='middle' responsive className='bo-table-clean mb-0'>
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell>Étudiant</CTableHeaderCell>
                                    <CTableHeaderCell>Niveau et ville</CTableHeaderCell>
                                    <CTableHeaderCell>Statut</CTableHeaderCell>
                                    <CTableHeaderCell>Inscrit le</CTableHeaderCell>
                                    <CTableHeaderCell />
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {data.data.map((u) => {
                                    const active = u.inquiriesCount > 0
                                    return (
                                        <CTableRow key={u.id}>
                                            <CTableDataCell>
                                                <div className='d-flex align-items-center gap-3'>
                                                    <span className='bo-table-avatar' style={AVATARS[u.id % AVATARS.length]} aria-hidden='true'>
                                                        {initials(u.name)}
                                                    </span>
                                                    <div style={{ minWidth: 0 }}>
                                                        <div className='fw-semibold text-body text-nowrap'>{u.name}</div>
                                                        <div className='small text-body-secondary text-nowrap'>{u.email}</div>
                                                    </div>
                                                </div>
                                            </CTableDataCell>
                                            <CTableDataCell className='text-nowrap'>
                                                <div className='small fw-semibold'>{u.studyLevel || 'Niveau non précisé'}</div>
                                                <div className='small text-body-secondary'>{u.city || 'Ville non précisée'}</div>
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <span className={`bo-status-pill ${active ? 'is-active' : 'is-idle'}`}>{active ? 'Actif' : 'Inscrit'}</span>
                                                <div className='small text-body-secondary mt-1 text-nowrap'>
                                                    {active ? `${u.inquiriesCount} demande${u.inquiriesCount > 1 ? 's' : ''}` : 'Aucune demande'}
                                                </div>
                                            </CTableDataCell>
                                            <CTableDataCell className='small fw-semibold text-body-secondary text-nowrap'>{shortDate.format(new Date(u.createdAt))}</CTableDataCell>
                                            <CTableDataCell className='text-end text-nowrap'>
                                                {u.phone && (
                                                    <a href={`tel:${u.phone.replace(/\s/g, '')}`} className='small fw-semibold text-body-secondary text-decoration-none me-3'>
                                                        Appeler
                                                    </a>
                                                )}
                                                <a href={`mailto:${u.email}`} className='small fw-semibold text-body-secondary text-decoration-none'>
                                                    Écrire
                                                </a>
                                            </CTableDataCell>
                                        </CTableRow>
                                    )
                                })}
                            </CTableBody>
                        </CTable>
                        <NumberedPager meta={data.meta} onChange={(page) => setFilters({ ...filters, page })} />
                    </>
                )}
            </PageCard>
        </>
    )
}
