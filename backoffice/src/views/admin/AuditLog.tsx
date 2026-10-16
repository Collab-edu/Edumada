'use client'
import { useState } from 'react'
import { CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import { useApi } from '@/lib/useApi'
import { formatDateTime } from '@/lib/format'
import { ACTION_LABELS } from '@/lib/labels'
import type { AuditLog as AuditLogEntry, Paginated } from '@/lib/types'
import { Loading, PageCard, Pager } from '@/components/ui'
import PageBanner from '@/components/PageBanner'

export default function AuditLog() {
    const [page, setPage] = useState(1)
    const { data } = useApi<Paginated<AuditLogEntry>>('/admin/audit-logs', { page })

    return (
        <>
            <PageBanner description='Validations, changements de formule, suppressions et exports.' />
            <PageCard>
                {!data ? (
                    <Loading />
                ) : (
                    <>
                        <CTable align='middle' hover responsive className='mb-0'>
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell>Date</CTableHeaderCell>
                                    <CTableHeaderCell>Action</CTableHeaderCell>
                                    <CTableHeaderCell>Par</CTableHeaderCell>
                                    <CTableHeaderCell>Détails</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {data.data.map((log) => (
                                    <CTableRow key={log.id}>
                                        <CTableDataCell className='small text-nowrap'>{formatDateTime(log.createdAt)}</CTableDataCell>
                                        <CTableDataCell>
                                            {ACTION_LABELS[log.action] ?? log.action}
                                            {log.subjectType && (
                                                <div className='small text-body-secondary'>
                                                    {log.subjectType} #{log.subjectId}
                                                </div>
                                            )}
                                        </CTableDataCell>
                                        <CTableDataCell>{log.user ? log.user.name : 'Système'}</CTableDataCell>
                                        <CTableDataCell>{Object.keys(log.meta).length > 0 && <code className='small text-wrap'>{JSON.stringify(log.meta)}</code>}</CTableDataCell>
                                    </CTableRow>
                                ))}
                            </CTableBody>
                        </CTable>
                        <Pager meta={data.meta} onChange={setPage} />
                    </>
                )}
            </PageCard>
        </>
    )
}
