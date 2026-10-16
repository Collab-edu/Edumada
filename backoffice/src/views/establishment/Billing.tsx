'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
    CAlert,
    CBadge,
    CButton,
    CCard,
    CCardBody,
    CCardFooter,
    CCardHeader,
    CCol,
    CFormInput,
    CFormSelect,
    CListGroup,
    CListGroupItem,
    CModal,
    CModalBody,
    CModalFooter,
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
import CIcon from '@coreui/icons-react'
import { cilCheckAlt } from '@coreui/icons'
import { useCurrentEstablishment } from '@/context/EstablishmentContext'
import { useToast } from '@/context/ToastContext'
import { api, errorMessage } from '@/lib/api'
import { useApi } from '@/lib/useApi'
import { formatAriary, formatDate, formatDateTime } from '@/lib/format'
import { PLAN_FEATURES } from '@/lib/labels'
import type { Invoice, Plan, Subscription } from '@/lib/types'
import { ErrorAlert, Loading, PageCard, StatusBadge } from '@/components/ui'
import PageBanner from '@/components/PageBanner'

type PaymentMethod = { value: string; label: string; instructions: string }
type BillingData = {
    data: { plan: Plan; plans: Plan[]; subscription: Subscription | null; invoices: Invoice[]; paymentMethods: PaymentMethod[]; publishedOffersCount: number }
}

/** Couleur d'en-tête de chaque formule. */
const PLAN_HEADER: Record<Plan['code'], string> = {
    free: '#64748b',
    pro: '#0f4c5c',
    premium: '#ff3b52',
}

function PendingInvoice({ invoice, onChanged }: { invoice: Invoice; onChanged: () => void }) {
    const toast = useToast()
    const [reference, setReference] = useState(invoice.paymentReference ?? '')

    const send = async (cancel = false) => {
        if (cancel && !window.confirm('Annuler cette facture ?')) return
        try {
            await api(`/invoices/${invoice.id}`, { method: 'PATCH', body: cancel ? { cancel: true } : { paymentReference: reference } })
            toast.success(cancel ? 'Facture annulée' : 'Référence envoyée : Edumada confirme votre paiement sous 48 h ouvrées.')
            onChanged()
        } catch (err) {
            toast.error(errorMessage(err))
        }
    }

    return (
        <CCard className='mb-4 border-start border-4 border-warning'>
            <CCardHeader className='bg-warning-subtle'>
                <strong>Facture {invoice.number} en attente de paiement</strong> · Formule {invoice.plan.name} ({invoice.billingCycleLabel.toLowerCase()})
            </CCardHeader>
            <CCardBody>
                <h3>{formatAriary(invoice.amount)}</h3>
                <CAlert color='light' className='border'>
                    <strong>Comment payer ({invoice.paymentMethodLabel}) :</strong> {invoice.paymentInstructions}
                    <div className='small mt-1'>
                        Indiquez le numéro <strong>{invoice.number}</strong> en référence du paiement.
                    </div>
                </CAlert>
                <CRow className='g-2 align-items-end'>
                    <CCol md={8}>
                        <CFormInput
                            label='Référence de votre paiement'
                            text='Ex. : identifiant de la transaction MVola'
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                        />
                    </CCol>
                    <CCol md={4} className='mb-md-4'>
                        <CButton color='primary' className='w-100' disabled={!reference.trim()} onClick={() => send()}>
                            Envoyer la référence
                        </CButton>
                    </CCol>
                </CRow>
            </CCardBody>
            <CCardFooter className='d-flex flex-wrap gap-3'>
                <Link href={`/facture/?id=${invoice.id}`}>Voir et imprimer la facture</Link>
                <CButton color='link' className='p-0 text-danger' onClick={() => send(true)}>
                    Annuler la facture
                </CButton>
            </CCardFooter>
        </CCard>
    )
}

export default function Billing() {
    const { current: e, reload: reloadEstablishment } = useCurrentEstablishment()
    const toast = useToast()
    const { data, reload } = useApi<BillingData>(`/establishments/${e.id}/billing`)
    const [choice, setChoice] = useState<Plan | null>(null)
    const [cycle, setCycle] = useState('yearly')
    const [method, setMethod] = useState('mvola')
    const [error, setError] = useState<unknown>(null)

    if (!data) return <Loading />
    const b = data.data
    const pending = b.invoices.find((i) => i.status === 'pending')
    const sub = b.subscription

    const request = async () => {
        if (!choice) return
        setError(null)
        try {
            await api(`/establishments/${e.id}/subscription-requests`, { method: 'POST', body: { plan: choice.code, billingCycle: cycle, paymentMethod: method } })
            toast.success('Facture créée : suivez les instructions de paiement.')
            setChoice(null)
            reload()
        } catch (err) {
            setError(err)
        }
    }

    return (
        <>
            <PageBanner
                title={`Formule ${b.plan.name}`}
                description={
                    sub
                        ? sub.status === 'grace'
                            ? `Échéance passée : période de grâce jusqu'au ${formatDate(sub.graceEndsAt)}.`
                            : `Active jusqu'au ${formatDate(sub.endsAt)} (${sub.billingCycleLabel.toLowerCase()}).`
                        : `Fiche référencée gratuitement : ${b.publishedOffersCount} offre(s) publiée(s)${b.plan.maxPublishedOffers ? ` sur ${b.plan.maxPublishedOffers}` : ''}.`
                }
            />
            {sub?.status === 'grace' && (
                <CAlert color='warning'>Renouvelez pour garder les fonctions payantes après le {formatDate(sub.graceEndsAt)}.</CAlert>
            )}
            <p className='small text-body-secondary'>
                {sub && sub.status !== 'grace' ? 'Rappels 30, 7 et 1 jour(s) avant l’échéance. ' : ''}À l&apos;expiration d&apos;une formule payante, la fiche reste en ligne avec la formule
                Gratuit ; seules les fonctions payantes s&apos;arrêtent.
            </p>

            {pending && (
                <PendingInvoice
                    key={pending.id + (pending.paymentReference ?? '')}
                    invoice={pending}
                    onChanged={() => {
                        reload()
                        reloadEstablishment()
                    }}
                />
            )}

            <CRow className='mb-2' xs={{ gutter: 4 }}>
                {b.plans.map((plan) => (
                    <CCol md={4} key={plan.code}>
                        <CCard className={`h-100 overflow-hidden ${plan.code === b.plan.code ? 'border border-2 border-danger' : ''}`}>
                            <div className='px-3 py-3 text-white d-flex justify-content-between align-items-center' style={{ background: PLAN_HEADER[plan.code] }}>
                                <strong className='fs-5'>{plan.name}</strong>
                                {plan.code === b.plan.code && (
                                    <CBadge color='light' textColor='dark'>
                                        Votre formule
                                    </CBadge>
                                )}
                            </div>
                            <CCardBody>
                                <h3 className='mb-0'>{plan.code === 'free' ? '0 Ar' : formatAriary(plan.monthlyPrice)}</h3>
                                <div className='small text-body-secondary mb-3'>
                                    {plan.code === 'free' ? 'pour toujours' : plan.yearlyPrice !== null ? `par mois, ou ${formatAriary(plan.yearlyPrice)} par an` : 'par mois'}
                                </div>
                                <CListGroup flush>
                                    {PLAN_FEATURES[plan.code].map((f) => (
                                        <CListGroupItem key={f} className='px-0 border-0 py-1 bg-transparent'>
                                            <CIcon icon={cilCheckAlt} className='text-success me-2' />
                                            {f.startsWith('Offres publiées') ? `${plan.maxPublishedOffers ?? 'Offres illimitées'} offres publiées` : f}
                                        </CListGroupItem>
                                    ))}
                                </CListGroup>
                            </CCardBody>
                            {plan.code !== 'free' && (
                                <CCardFooter className='bg-transparent border-0 pb-3'>
                                    <CButton
                                        color={plan.code === 'pro' ? 'primary' : 'danger'}
                                        className='w-100 text-white'
                                        disabled={!!pending}
                                        onClick={() => {
                                            setChoice(plan)
                                            setCycle(plan.yearlyPrice !== null ? 'yearly' : 'monthly')
                                        }}
                                    >
                                        {b.plan.code === plan.code ? 'Renouveler' : `Choisir ${plan.name}`}
                                    </CButton>
                                </CCardFooter>
                            )}
                        </CCard>
                    </CCol>
                ))}
            </CRow>
            <p className='small text-body-secondary mb-4'>Prix de lancement indicatifs. Pour une seule rentrée, une campagne Premium d&apos;un mois peut suffire.</p>

            <PageCard title='Factures'>
                {b.invoices.length === 0 ? (
                    <p className='text-body-secondary mb-0'>Aucune facture.</p>
                ) : (
                    <CTable align='middle' hover responsive className='mb-0'>
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell>Numéro</CTableHeaderCell>
                                <CTableHeaderCell>Formule</CTableHeaderCell>
                                <CTableHeaderCell>Montant</CTableHeaderCell>
                                <CTableHeaderCell>Statut</CTableHeaderCell>
                                <CTableHeaderCell>Date</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {b.invoices.map((i) => (
                                <CTableRow key={i.id}>
                                    <CTableDataCell>
                                        <Link href={`/facture/?id=${i.id}`}>{i.number}</Link>
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        {i.plan.name} · {i.billingCycleLabel}
                                    </CTableDataCell>
                                    <CTableDataCell className='text-nowrap'>{formatAriary(i.amount)}</CTableDataCell>
                                    <CTableDataCell>
                                        <StatusBadge status={i.status}>{i.statusLabel}</StatusBadge>
                                    </CTableDataCell>
                                    <CTableDataCell className='small text-body-secondary'>{formatDateTime(i.createdAt)}</CTableDataCell>
                                </CTableRow>
                            ))}
                        </CTableBody>
                    </CTable>
                )}
            </PageCard>

            <CModal visible={!!choice} onClose={() => setChoice(null)} alignment='center'>
                <CModalHeader>
                    <CModalTitle>Formule {choice?.name}</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <p className='small text-body-secondary'>Une facture est créée ; la formule s&apos;active dès que le paiement est confirmé par Edumada.</p>
                    <ErrorAlert error={error} />
                    {choice && (
                        <>
                            <CFormSelect className='mb-3' label='Rythme' value={cycle} onChange={(ev) => setCycle(ev.target.value)}>
                                <option value='monthly'>Mensuel — {formatAriary(choice.monthlyPrice)}</option>
                                {choice.yearlyPrice !== null && <option value='yearly'>Annuel — {formatAriary(choice.yearlyPrice)}</option>}
                            </CFormSelect>
                            <CFormSelect className='mb-3' label='Moyen de paiement' value={method} onChange={(ev) => setMethod(ev.target.value)}>
                                {b.paymentMethods.map((m) => (
                                    <option key={m.value} value={m.value}>
                                        {m.label}
                                    </option>
                                ))}
                            </CFormSelect>
                            <CAlert color='light' className='border mb-0'>
                                {b.paymentMethods.find((m) => m.value === method)?.instructions}
                            </CAlert>
                        </>
                    )}
                </CModalBody>
                <CModalFooter>
                    <CButton color='secondary' variant='ghost' onClick={() => setChoice(null)}>
                        Annuler
                    </CButton>
                    <CButton color='primary' onClick={request}>
                        Créer la facture
                    </CButton>
                </CModalFooter>
            </CModal>
        </>
    )
}
