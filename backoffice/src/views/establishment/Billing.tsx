'use client'
import { useEffect, useState } from 'react'
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
import { cilArrowRight, cilBank, cilBullhorn, cilCheckAlt, cilChatBubble, cilInfo, cilChartLine, cilLockLocked, cilStar, cilTask, cilX } from '@coreui/icons'
import { useCurrentEstablishment } from '@/context/EstablishmentContext'
import { useToast } from '@/context/ToastContext'
import { api, errorMessage } from '@/lib/api'
import { useApi } from '@/lib/useApi'
import { formatAriary, formatDate, formatDateTime } from '@/lib/format'
import { planFeatureSections } from '@/lib/labels'
import type { Invoice, Plan, Subscription } from '@/lib/types'
import { ErrorAlert, Loading, PageCard, StatusBadge } from '@/components/ui'
import PageBanner from '@/components/PageBanner'

type PaymentMethod = { value: string; label: string; instructions: string }
type BillingData = {
    data: { plan: Plan; plans: Plan[]; subscription: Subscription | null; invoices: Invoice[]; paymentMethods: PaymentMethod[]; publishedOffersCount: number }
}

/** Présentation de chaque formule sur sa carte. */
const PLAN_CARD: Record<Plan['code'], { icon: string[]; description: string; tag?: string }> = {
    free: { icon: cilBank, description: 'Idéale pour démarrer et avoir une présence de base sur la plateforme.' },
    pro: { icon: cilChartLine, description: 'Pour les établissements qui souhaitent plus de visibilité et de demandes.', tag: 'Recommandé' },
    premium: { icon: cilStar, description: 'Pour les établissements qui veulent une visibilité maximale et un accompagnement prioritaire.', tag: 'Visibilité maximale' },
}

const SECTION_ICONS = [cilTask, cilChatBubble, cilBullhorn]

/** Prix affiché selon le rythme choisi ; une formule sans tarif annuel reste au mois. */
function planPrice(plan: Plan, billing: 'monthly' | 'yearly') {
    if (plan.code === 'free') return { amount: '0 Ar', period: 'pour toujours' }
    if (billing === 'monthly' || plan.yearlyPrice === null) {
        return { amount: formatAriary(plan.monthlyPrice), period: billing === 'yearly' ? 'par mois, pas de tarif annuel' : 'par mois' }
    }
    return { amount: formatAriary(plan.yearlyPrice), period: `par an, soit ${formatAriary(Math.round(plan.yearlyPrice / 12))} par mois` }
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
    const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
    const [method, setMethod] = useState('mvola')
    const [error, setError] = useState<unknown>(null)

    // Formule choisie sur la page Tarifs du site (/formule/?plan=pro&cycle=monthly) : on ouvre directement la demande.
    useEffect(() => {
        if (!data) return
        const params = new URLSearchParams(window.location.search)
        const wanted = data.data.plans.find((plan) => plan.code === params.get('plan') && plan.code !== 'free')
        if (!wanted || wanted.code === data.data.plan.code) return
        const requestedCycle = params.get('cycle')
        setCycle(requestedCycle === 'monthly' || wanted.yearlyPrice === null ? 'monthly' : 'yearly')
        setChoice(wanted)
        window.history.replaceState(null, '', window.location.pathname)
    }, [data])

    if (!data) return <Loading />
    const b = data.data
    const pending = b.invoices.find((i) => i.status === 'pending')
    const sub = b.subscription
    const yearlyPlan = b.plans.find((plan) => plan.code !== 'free' && plan.yearlyPrice !== null && !!plan.monthlyPrice)
    const saving = yearlyPlan ? Math.round((1 - (yearlyPlan.yearlyPrice ?? 0) / ((yearlyPlan.monthlyPrice ?? 1) * 12)) * 100) : 0

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
                title={
                    <>
                        Formule {b.plan.name}{' '}
                        <CBadge color={sub?.status === 'grace' ? 'warning' : 'success'} className='bo-plan-status'>
                            {sub?.status === 'grace' ? 'Période de grâce' : 'Active'}
                        </CBadge>
                    </>
                }
                description={
                    sub
                        ? sub.status === 'grace'
                            ? `Échéance passée : période de grâce jusqu'au ${formatDate(sub.graceEndsAt)}.`
                            : `Votre formule actuelle, active jusqu'au ${formatDate(sub.endsAt)} (${sub.billingCycleLabel.toLowerCase()}).`
                        : `Votre formule actuelle : ${b.publishedOffersCount} offre(s) publiée(s)${b.plan.maxPublishedOffers ? ` sur ${b.plan.maxPublishedOffers}` : ''}.`
                }
            />
            {sub?.status === 'grace' && (
                <CAlert color='warning'>Renouvelez pour garder les fonctions payantes après le {formatDate(sub.graceEndsAt)}.</CAlert>
            )}

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

            {yearlyPlan && (
                <div className='bo-plan-billing'>
                    <span className='fw-semibold'>Mode de facturation :</span>
                    <div className='bo-plan-toggle' role='group' aria-label='Mode de facturation'>
                        {(
                            [
                                ['monthly', 'Mensuel'],
                                ['yearly', 'Annuel'],
                            ] as const
                        ).map(([value, label]) => (
                            <button key={value} type='button' className={billing === value ? 'is-active' : ''} aria-pressed={billing === value} onClick={() => setBilling(value)}>
                                {label}
                            </button>
                        ))}
                    </div>
                    {saving > 0 && (
                        <span className='bo-plan-saving'>
                            Économisez <strong>{saving} %</strong> sur {yearlyPlan.name} avec la facturation annuelle
                        </span>
                    )}
                </div>
            )}

            <CRow className='mb-4' xs={{ gutter: 4 }}>
                {b.plans.map((plan) => {
                    const card = PLAN_CARD[plan.code]
                    const current = plan.code === b.plan.code
                    const price = planPrice(plan, billing)
                    return (
                        <CCol xl={4} key={plan.code}>
                            <div className={`bo-plan-card is-${plan.code}`}>
                                {(current || card.tag) && <span className={`bo-plan-tag${current ? ' is-current' : ''}`}>{current ? 'Votre formule' : card.tag}</span>}
                                <div className='bo-plan-head'>
                                    <span className='bo-plan-icon'>
                                        <CIcon icon={card.icon} />
                                    </span>
                                    <div>
                                        <h2>Formule {plan.name}</h2>
                                        <p>{card.description}</p>
                                    </div>
                                </div>
                                <div className='bo-plan-price'>
                                    <strong>{price.amount}</strong>
                                    <span>{price.period}</span>
                                </div>
                                {planFeatureSections(plan).map((section, i) => (
                                    <div className='bo-plan-section' key={section.title}>
                                        <h3>
                                            <CIcon icon={SECTION_ICONS[i]} />
                                            {section.title}
                                        </h3>
                                        <ul className='list-unstyled mb-0'>
                                            {section.features.map((f) => (
                                                <li key={f.label} className={f.included ? '' : 'is-off'}>
                                                    <CIcon icon={f.included ? cilCheckAlt : cilX} />
                                                    <span>
                                                        {f.label}
                                                        {!f.included && <span className='visually-hidden'> (non inclus)</span>}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                                <div className='bo-plan-action'>
                                    {plan.code === 'free' ? (
                                        current && (
                                            <CButton color='secondary' className='w-100' disabled>
                                                <CIcon icon={cilLockLocked} className='me-2' />
                                                Formule actuelle
                                            </CButton>
                                        )
                                    ) : (
                                        <CButton
                                            color={plan.code === 'pro' ? 'primary' : 'danger'}
                                            className='w-100 text-white'
                                            disabled={!!pending}
                                            onClick={() => {
                                                setChoice(plan)
                                                setCycle(billing === 'yearly' && plan.yearlyPrice !== null ? 'yearly' : 'monthly')
                                            }}
                                        >
                                            {current ? 'Renouveler' : `Choisir ${plan.name}`}
                                            <CIcon icon={cilArrowRight} className='ms-2' />
                                        </CButton>
                                    )}
                                </div>
                            </div>
                        </CCol>
                    )
                })}
            </CRow>

            <div className='bo-plan-note'>
                <CIcon icon={cilInfo} />
                <p>
                    {sub && sub.status !== 'grace' ? 'Rappels 30, 7 et 1 jour(s) avant l’échéance. ' : ''}À l&apos;expiration d&apos;une formule payante, la fiche reste en ligne avec la formule
                    Gratuit ; seules les fonctions payantes s&apos;arrêtent. Prix de lancement indicatifs. Pour une seule rentrée, une campagne Premium d&apos;un mois peut suffire.
                </p>
            </div>

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
