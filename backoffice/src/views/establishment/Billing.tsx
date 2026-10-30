'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
    CAlert,
    CButton,
    CCard,
    CCardBody,
    CCardFooter,
    CCardHeader,
    CCol,
    CFormInput,
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
import { cilArrowRight, cilClock } from '@coreui/icons'
import { useCurrentEstablishment } from '@/context/EstablishmentContext'
import { useToast } from '@/context/ToastContext'
import { api, errorMessage, SITE_URL } from '@/lib/api'
import { useApi } from '@/lib/useApi'
import { formatAriary, formatDate, formatDateTime } from '@/lib/format'
import { planFeatureSections } from '@/lib/labels'
import type { Invoice, Plan, Subscription } from '@/lib/types'
import { ErrorAlert, Loading, PageCard, StatusBadge } from '@/components/ui'

type PaymentMethod = { value: string; label: string; instructions: string }
type BillingData = {
    data: { plan: Plan; plans: Plan[]; subscription: Subscription | null; invoices: Invoice[]; paymentMethods: PaymentMethod[]; publishedOffersCount: number }
}

/** Icônes pleines de la page Formule. */
const GLYPHS = {
    building: 'M5 21V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v17h2v2H3v-2h2Zm4-14v2h2V7H9Zm4 0v2h2V7h-2Zm-4 4v2h2v-2H9Zm4 0v2h2v-2h-2Zm-3 5v5h4v-5h-4Z',
    rocket: 'M14.5 3.5c2.4-1.2 4.8-1.4 6-1.2.2 1.2 0 3.6-1.2 6-1 2-2.6 4-5.3 6l.3 3.5-3.6 3.1-.8-3.8-4.4-4.4-3.8-.8 3.1-3.6 3.5.3c2-2.7 4-4.3 6.2-5.6Zm1.5 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM5 17c-1.2.6-2 2.3-2 4 1.7 0 3.4-.8 4-2l-2-2Z',
    crown: 'M3 7l4.5 4L12 4l4.5 7L21 7l-2 11H5L3 7Zm2 12.5h14V21H5v-1.5Z',
    mail: 'M3 5h18a1 1 0 0 1 1 1v.6l-10 6-10-6V6a1 1 0 0 1 1-1Zm-1 3.9V18a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V8.9l-10 6-10-6Z',
    star: 'M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.6l-5.9 3.1 1.2-6.6-4.8-4.6 6.6-.9L12 2.5Z',
    lock: 'M7 10V8a5 5 0 0 1 10 0v2h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h1Zm2 0h6V8a3 3 0 0 0-6 0v2Z',
    info: 'M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm-1 8v7h2v-7h-2Zm0-3v2h2V7h-2Z',
}

function Glyph({ name, className }: { name: keyof typeof GLYPHS; className?: string }) {
    return (
        <svg viewBox='0 0 24 24' fill='currentColor' fillRule='evenodd' aria-hidden='true' className={className}>
            <path d={GLYPHS[name]} />
        </svg>
    )
}

/** Présentation de chaque formule sur sa carte. */
const PLAN_CARD: Record<Plan['code'], { icon: keyof typeof GLYPHS; description: string; tag?: string; tagIcon?: keyof typeof GLYPHS }> = {
    free: { icon: 'building', description: 'Idéale pour démarrer et avoir une présence de base sur la plateforme.' },
    pro: { icon: 'rocket', description: 'Pour les établissements qui souhaitent plus de visibilité et de demandes.', tag: 'Recommandé', tagIcon: 'star' },
    premium: { icon: 'crown', description: 'Pour les établissements qui veulent une visibilité maximale et un accompagnement prioritaire.', tag: 'Visibilité maximale', tagIcon: 'crown' },
}

/** Prix affiché selon le rythme choisi ; une formule sans tarif annuel reste au mois. */
function planPrice(plan: Plan, billing: 'monthly' | 'yearly') {
    if (plan.code === 'free') return { amount: '0 Ar', period: 'par mois' }
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
    const { data, reload } = useApi<BillingData>(`/establishments/${e.id}/billing`)
    const [choice, setChoice] = useState<Plan | null>(null)
    const [created, setCreated] = useState<Invoice | null>(null)
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
            const res = await api<{ data: Invoice }>(`/establishments/${e.id}/subscription-requests`, { method: 'POST', body: { plan: choice.code, billingCycle: cycle, paymentMethod: method } })
            setChoice(null)
            setCreated(res.data)
            reload()
        } catch (err) {
            setError(err)
        }
    }

    return (
        <>
            <div className='bo-plan-hero'>
                <span className='bo-plan-hero-icon'>
                    <Glyph name='building' />
                </span>
                <div className='bo-plan-hero-text'>
                    <span>Votre formule actuelle</span>
                    <h1>
                        Formule {b.plan.name}
                        <span className={`bo-plan-active${sub?.status === 'grace' ? ' is-grace' : ''}`}>{sub?.status === 'grace' ? 'Période de grâce' : 'Actif'}</span>
                    </h1>
                    <p>
                        <CIcon icon={cilClock} />
                        {sub
                            ? sub.status === 'grace'
                                ? `Échéance passée : période de grâce jusqu'au ${formatDate(sub.graceEndsAt)}.`
                                : `Active jusqu'au ${formatDate(sub.endsAt)} (${sub.billingCycleLabel.toLowerCase()})`
                            : `${b.publishedOffersCount} offre${b.publishedOffersCount > 1 ? 's' : ''} publiée${b.publishedOffersCount > 1 ? 's' : ''}${b.plan.maxPublishedOffers ? ` sur ${b.plan.maxPublishedOffers}` : ''}`}
                    </p>
                </div>
            </div>
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
                    <span className='bo-plan-billing-label'>Choisissez votre mode de facturation :</span>
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
                            <i aria-hidden='true'>%</i>
                            <span>
                                Économisez <strong>{saving}%</strong> avec la facturation annuelle
                            </span>
                        </span>
                    )}
                </div>
            )}

            <CRow className='bo-plan-grid' xs={{ gutter: 4 }}>
                {b.plans.map((plan) => {
                    const card = PLAN_CARD[plan.code]
                    const current = plan.code === b.plan.code
                    const price = planPrice(plan, billing)
                    return (
                        <CCol xl={4} key={plan.code}>
                            <div className={`bo-plan-card is-${plan.code}`}>
                                {current ? (
                                    <span className='bo-plan-tag is-current'>Votre formule</span>
                                ) : (
                                    card.tag && (
                                        <span className='bo-plan-tag'>
                                            {card.tagIcon && <Glyph name={card.tagIcon} />}
                                            {card.tag}
                                        </span>
                                    )
                                )}
                                <div className='bo-plan-head'>
                                    <span className='bo-plan-icon'>
                                        <Glyph name={card.icon} />
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
                                {planFeatureSections(plan).map((section) => (
                                    <div className='bo-plan-section' key={section.title}>
                                        <h3>
                                            <span>{section.title}</span>
                                            <span className='bo-plan-section-count'>
                                                {section.features.filter((f) => f.included).length}/{section.features.length}
                                                <span className='visually-hidden'> fonctions incluses</span>
                                            </span>
                                        </h3>
                                        <ul className='list-unstyled mb-0'>
                                            {section.features.map((f) => (
                                                <li key={f.label} className={f.included ? '' : 'is-off'}>
                                                    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                                                        <path d={f.included ? 'M5 12.5 10 17.5 19.5 7' : 'M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5'} />
                                                    </svg>
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
                                            <button type='button' className='bo-plan-btn is-current' disabled>
                                                <Glyph name='lock' />
                                                Formule actuelle
                                            </button>
                                        )
                                    ) : (
                                        <button
                                            type='button'
                                            className={`bo-plan-btn is-${plan.code}`}
                                            disabled={!!pending}
                                            onClick={() => {
                                                setChoice(plan)
                                                setCycle(billing === 'yearly' && plan.yearlyPrice !== null ? 'yearly' : 'monthly')
                                            }}
                                        >
                                            {current ? 'Renouveler' : `Choisir ${plan.name}`}
                                            <CIcon icon={cilArrowRight} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </CCol>
                    )
                })}
            </CRow>

            <div className='bo-plan-note'>
                <Glyph name='info' />
                <p>
                    {sub && sub.status !== 'grace' ? 'Rappels 30, 7 et 1 jour(s) avant l’échéance. ' : ''}À l&apos;expiration d&apos;une formule payante, la fiche reste en ligne avec la formule Gratuit ; seules les
                    fonctions payantes s&apos;arrêtent.
                </p>
                <a href={`${SITE_URL}/tarifs/`} target='_blank' rel='noopener noreferrer'>
                    En savoir plus
                    <CIcon icon={cilArrowRight} />
                </a>
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

            <CModal visible={!!choice} onClose={() => setChoice(null)} alignment='center' className={`bo-plan-modal is-${choice?.code}`}>
                <CModalHeader>
                    <CModalTitle as='div' className='bo-plan-modal-title'>
                        {choice && (
                            <span className='bo-plan-icon'>
                                <Glyph name={PLAN_CARD[choice.code].icon} />
                            </span>
                        )}
                        <span>
                            <strong>Formule {choice?.name}</strong>
                            <small>Votre formule s&apos;active dès que le paiement est confirmé par Edumada.</small>
                        </span>
                    </CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <ErrorAlert error={error} />
                    {choice && (
                        <>
                            <fieldset className='bo-plan-field'>
                                <legend>Rythme</legend>
                                <div className='bo-plan-options'>
                                    <label className={cycle === 'monthly' ? 'is-active' : ''}>
                                        <input type='radio' name='bo-cycle' className='visually-hidden' checked={cycle === 'monthly'} onChange={() => setCycle('monthly')} />
                                        <span>Mensuel</span>
                                        <strong>{formatAriary(choice.monthlyPrice)}</strong>
                                    </label>
                                    {choice.yearlyPrice !== null && (
                                        <label className={cycle === 'yearly' ? 'is-active' : ''}>
                                            <input type='radio' name='bo-cycle' className='visually-hidden' checked={cycle === 'yearly'} onChange={() => setCycle('yearly')} />
                                            <span>Annuel</span>
                                            <strong>{formatAriary(choice.yearlyPrice)}</strong>
                                        </label>
                                    )}
                                </div>
                            </fieldset>
                            <fieldset className='bo-plan-field'>
                                <legend>Moyen de paiement</legend>
                                <div className='bo-plan-options is-compact'>
                                    {b.paymentMethods.map((m) => (
                                        <label key={m.value} className={method === m.value ? 'is-active' : ''}>
                                            <input type='radio' name='bo-method' className='visually-hidden' checked={method === m.value} onChange={() => setMethod(m.value)} />
                                            <span>{m.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                            <div className='bo-plan-instructions'>
                                <Glyph name='info' />
                                <p>{b.paymentMethods.find((m) => m.value === method)?.instructions}</p>
                            </div>
                            <div className='bo-plan-total'>
                                <span>Montant de la facture</span>
                                <strong>{formatAriary(cycle === 'yearly' ? choice.yearlyPrice : choice.monthlyPrice)}</strong>
                            </div>
                        </>
                    )}
                </CModalBody>
                <CModalFooter>
                    <CButton color='secondary' variant='ghost' onClick={() => setChoice(null)}>
                        Annuler
                    </CButton>
                    <button type='button' className={`bo-plan-btn is-${choice?.code}`} onClick={request}>
                        Créer la facture
                        <CIcon icon={cilArrowRight} />
                    </button>
                </CModalFooter>
            </CModal>

            <CModal visible={!!created} onClose={() => setCreated(null)} alignment='center' className='bo-plan-modal'>
                <CModalBody className='bo-plan-done'>
                    <span className='bo-plan-done-icon'>
                        <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
                            <path d='M5 12.5 10 17.5 19.5 7' />
                        </svg>
                    </span>
                    <h2>Votre demande est bien enregistrée</h2>
                    <p>
                        L&apos;équipe Edumada vous contacte <strong>en moins de 24 h</strong> pour finaliser l&apos;activation de votre formule {created?.plan.name}.
                    </p>
                    <dl>
                        <div>
                            <dt>Facture</dt>
                            <dd>{created?.number}</dd>
                        </div>
                        <div>
                            <dt>Montant</dt>
                            <dd>{created && formatAriary(created.amount)}</dd>
                        </div>
                    </dl>
                    <CButton color='primary' className='w-100' onClick={() => setCreated(null)}>
                        Compris
                    </CButton>
                </CModalBody>
            </CModal>
        </>
    )
}
