'use client'
import { useSearchParams } from 'next/navigation'
import { CButton, CCard, CCardBody, CCol, CRow, CTable, CTableBody, CTableDataCell, CTableFoot, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPrint } from '@coreui/icons'
import { useApi } from '@/lib/useApi'
import { formatAriary, formatDate } from '@/lib/format'
import type { Invoice as InvoiceType } from '@/lib/types'
import { ErrorAlert, Loading, StatusBadge } from '@/components/ui'
import PageBanner from '@/components/PageBanner'

/** Facture imprimable (ou enregistrable en PDF depuis le navigateur) : /facture/?id=… */
export default function Invoice() {
    const id = useSearchParams().get('id')
    const { data, error } = useApi<{ data: InvoiceType }>(id ? `/invoices/${id}` : null)
    if (error) return <ErrorAlert error={error} />
    if (!data) return <Loading />
    const i = data.data

    return (
        <>
            <PageBanner
                title={`Facture ${i.number}`}
                description={`${i.establishment.name} · ${formatAriary(i.amount)}`}
                actions={
                    <CButton color='light' onClick={() => window.print()}>
                        <CIcon icon={cilPrint} className='me-2' />
                        Imprimer ou enregistrer en PDF
                    </CButton>
                }
            />
            <CCard className='mb-4'>
                <CCardBody className='p-4 p-md-5'>
                    <CRow className='mb-4 g-3'>
                        <CCol sm={6}>
                            <h3 className='mb-0' style={{ color: 'var(--edu-teal)' }}>
                                Edumada
                            </h3>
                            <div className='text-body-secondary'>Plateforme d&apos;orientation scolaire — Madagascar</div>
                        </CCol>
                        <CCol sm={6} className='text-sm-end'>
                            <h4 className='mb-1'>Facture {i.number}</h4>
                            <div>Émise le {formatDate(i.createdAt)}</div>
                            <StatusBadge status={i.status}>
                                {i.statusLabel}
                                {i.paidAt ? ` le ${formatDate(i.paidAt)}` : ''}
                            </StatusBadge>
                        </CCol>
                    </CRow>
                    <CRow className='mb-4 g-3'>
                        <CCol sm={6}>
                            <h6 className='text-uppercase text-body-secondary'>Facturé à</h6>
                            <strong>{i.establishment.name}</strong>
                            {i.establishment.address && <div>{i.establishment.address}</div>}
                            <div>{i.establishment.city}</div>
                            {i.establishment.email && <div>{i.establishment.email}</div>}
                        </CCol>
                        <CCol sm={6}>
                            <h6 className='text-uppercase text-body-secondary'>Paiement</h6>
                            <div>{i.paymentMethodLabel}</div>
                            {i.paymentReference && <div>Référence : {i.paymentReference}</div>}
                            {i.status === 'pending' && <div className='small'>{i.paymentInstructions}</div>}
                        </CCol>
                    </CRow>
                    <CTable className='border'>
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell>Désignation</CTableHeaderCell>
                                <CTableHeaderCell className='text-end'>Montant</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            <CTableRow>
                                <CTableDataCell>
                                    Formule {i.plan.name} — {i.billingCycleLabel.toLowerCase()}
                                    {i.periodStartsOn && (
                                        <div className='small text-body-secondary'>
                                            Du {formatDate(i.periodStartsOn)} au {formatDate(i.periodEndsOn)}
                                        </div>
                                    )}
                                </CTableDataCell>
                                <CTableDataCell className='text-end text-nowrap'>{formatAriary(i.amount)}</CTableDataCell>
                            </CTableRow>
                        </CTableBody>
                        <CTableFoot>
                            <CTableRow>
                                <CTableHeaderCell>Total</CTableHeaderCell>
                                <CTableHeaderCell className='text-end fs-5 text-nowrap'>{formatAriary(i.amount)}</CTableHeaderCell>
                            </CTableRow>
                        </CTableFoot>
                    </CTable>
                </CCardBody>
            </CCard>
        </>
    )
}
