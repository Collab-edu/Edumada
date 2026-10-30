'use client'
import { useState, type FormEvent, type ReactNode } from 'react'
import Link from 'next/link'
import { CButton, CCol, CForm, CFormInput, CFormSelect, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBank, cilBullhorn, cilCalendar, cilDescription, cilEducation, cilStorage } from '@coreui/icons'
import { useToast } from '@/context/ToastContext'
import { api, errorMessage } from '@/lib/api'
import { useApi } from '@/lib/useApi'
import { formatAriary, formatDate, formatDateTime } from '@/lib/format'
import type { Campaign, Invoice, Paginated, Plan, Subscription } from '@/lib/types'
import { Loading, PageCard, Pager, StatusBadge, StatusDot } from '@/components/ui'

function PlanEditor({ plan, onSaved }: { plan: Plan; onSaved: () => void }) {
    const toast = useToast()
    const [form, setForm] = useState({
        monthlyPrice: String(plan.monthlyPrice ?? ''),
        yearlyPrice: String(plan.yearlyPrice ?? ''),
        maxPublishedOffers: String(plan.maxPublishedOffers ?? ''),
    })
    const toNumber = (v: string) => (v.trim() === '' ? null : Number(v))

    const save = async (e: FormEvent) => {
        e.preventDefault()
        try {
            await api(`/admin/plans/${plan.code}`, {
                method: 'PATCH',
                body: { monthlyPrice: toNumber(form.monthlyPrice), yearlyPrice: toNumber(form.yearlyPrice), maxPublishedOffers: toNumber(form.maxPublishedOffers) },
            })
            toast.success(`Formule ${plan.name} mise à jour`)
            onSaved()
        } catch (err) {
            toast.error(errorMessage(err))
        }
    }

    return (
        <CForm onSubmit={save} className={`bo-billing-plan is-${plan.code}`}>
            <h6>{plan.name}</h6>
            <div className='bo-billing-plan-fields'>
                <div>
                    <CFormInput
                        label='Prix mensuel (Ar)'
                        text='Vide = non proposé'
                        inputMode='numeric'
                        value={form.monthlyPrice}
                        onChange={(e) => setForm({ ...form, monthlyPrice: e.target.value })}
                    />
                </div>
                <div>
                    <CFormInput
                        label='Prix annuel (Ar)'
                        text='Vide = non proposé'
                        inputMode='numeric'
                        value={form.yearlyPrice}
                        onChange={(e) => setForm({ ...form, yearlyPrice: e.target.value })}
                    />
                </div>
                <div>
                    <CFormInput
                        label='Offres publiées max.'
                        text='Vide = illimité'
                        inputMode='numeric'
                        value={form.maxPublishedOffers}
                        onChange={(e) => setForm({ ...form, maxPublishedOffers: e.target.value })}
                    />
                </div>
                <button type='submit' className='bo-billing-save'>
                    Enregistrer
                </button>
            </div>
        </CForm>
    )
}

/** Encadré affiché quand une liste est vide. */
function EmptyBox({ illustration, title, children }: { illustration: ReactNode; title: string; children: ReactNode }) {
    return (
        <div className='bo-billing-empty'>
            {illustration}
            <strong>{title}</strong>
            <p>{children}</p>
        </div>
    )
}

const InvoiceIllustration = (
    <svg viewBox='0 0 120 72' fill='none' aria-hidden='true'>
        <circle cx='14' cy='30' r='5' fill='#CBD5E1' />
        <path d='M10 54l5-5M104 37l5-5' stroke='#CBD5E1' strokeWidth='2' strokeLinecap='round' />
        <path d='M100 12l7 7M107 12l-7 7' stroke='#CBD5E1' strokeWidth='2.5' strokeLinecap='round' />
        <path d='M40 4h24l14 14v44H40V4Z' stroke='#7D93AB' strokeWidth='2.5' strokeLinejoin='round' />
        <path d='M64 4v14h14M48 24h12M48 33h22M48 42h22M48 51h12' stroke='#7D93AB' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round' />
        <circle cx='81' cy='55' r='13' className='bo-billing-clock' style={{ fill: 'var(--cui-tertiary-bg)' }} stroke='#0F4C5C' strokeWidth='3' />
        <path d='M81 47v8l5 3' className='bo-billing-clock' stroke='#0F4C5C' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
)

const PlaneIllustration = (
    <svg viewBox='0 0 48 48' fill='none' aria-hidden='true'>
        <path d='M43 5 4 20l14 6 19-14-14 18 5 13L43 5Z' stroke='#7D93AB' strokeWidth='3' strokeLinejoin='round' />
    </svg>
)

export default function Billing() {
    const toast = useToast()
    const [status, setStatus] = useState('pending')
    const [page, setPage] = useState(1)
    const { data: invoices, reload } = useApi<Paginated<Invoice>>('/admin/invoices', { status, page })
    const { data: subscriptions, reload: reloadSubs } = useApi<{ data: Subscription[] }>('/admin/subscriptions')
    const { data: plans, reload: reloadPlans } = useApi<{ data: Plan[] }>('/plans')
    const { data: campaigns } = useApi<{ data: Campaign[] }>('/admin/campaigns')

    const run = async (action: () => Promise<unknown>, message: string, after: () => void) => {
        try {
            await action()
            toast.success(message)
            after()
        } catch (err) {
            toast.error(errorMessage(err))
        }
    }

    return (
        <>
            <PageCard
                title='Factures'
                className='mb-4 bo-billing-card'
                subtitle='Gérez vos factures et suivez vos paiements.'
                icon={cilDescription}
                actions={
                    <CFormSelect
                        style={{ width: 'auto' }}
                        aria-label='Statut'
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value)
                            setPage(1)
                        }}
                    >
                        <option value='pending'>En attente</option>
                        <option value='paid'>Payées</option>
                        <option value='cancelled'>Annulées</option>
                        <option value=''>Toutes</option>
                    </CFormSelect>
                }
            >
                {!invoices ? (
                    <Loading />
                ) : invoices.data.length === 0 ? (
                    <EmptyBox illustration={InvoiceIllustration} title='Aucune facture'>
                        Vous n&apos;avez aucune facture pour le moment.
                    </EmptyBox>
                ) : (
                    <>
                        <CTable align='middle' hover responsive className='mb-0'>
                            <CTableHead>
                                <CTableRow>
                                    <CTableHeaderCell>Facture</CTableHeaderCell>
                                    <CTableHeaderCell>Établissement</CTableHeaderCell>
                                    <CTableHeaderCell>Montant</CTableHeaderCell>
                                    <CTableHeaderCell>Paiement</CTableHeaderCell>
                                    <CTableHeaderCell>Statut</CTableHeaderCell>
                                    <CTableHeaderCell className='text-end'>Actions</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {invoices.data.map((i) => (
                                    <CTableRow key={i.id}>
                                        <CTableDataCell>
                                            <Link href={`/facture/?id=${i.id}`}>{i.number}</Link>
                                            <div className='small text-body-secondary'>{formatDateTime(i.createdAt)}</div>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            {i.establishment.name}
                                            <div className='small text-body-secondary'>
                                                {i.plan.name} · {i.billingCycleLabel}
                                            </div>
                                        </CTableDataCell>
                                        <CTableDataCell className='text-nowrap'>{formatAriary(i.amount)}</CTableDataCell>
                                        <CTableDataCell>
                                            {i.paymentMethodLabel}
                                            <div className='small'>
                                                {i.paymentReference ? <strong>{i.paymentReference}</strong> : <span className='text-body-secondary'>référence non indiquée</span>}
                                            </div>
                                        </CTableDataCell>
                                        <CTableDataCell>
                                            <StatusBadge status={i.status}>{i.statusLabel}</StatusBadge>
                                        </CTableDataCell>
                                        <CTableDataCell className='text-end text-nowrap'>
                                            {i.status === 'pending' && (
                                                <>
                                                    <CButton
                                                        size='sm'
                                                        color='success'
                                                        className='text-white me-2'
                                                        onClick={() =>
                                                            window.confirm(`Confirmer le paiement de ${formatAriary(i.amount)} ?`) &&
                                                            run(() => api(`/admin/invoices/${i.id}/confirm`, { method: 'PUT' }), 'Paiement confirmé, formule activée', () => {
                                                                reload()
                                                                reloadSubs()
                                                            })
                                                        }
                                                    >
                                                        Paiement reçu
                                                    </CButton>
                                                    <CButton
                                                        size='sm'
                                                        color='secondary'
                                                        variant='ghost'
                                                        onClick={() => run(() => api(`/admin/invoices/${i.id}/cancel`, { method: 'PUT' }), 'Facture annulée', reload)}
                                                    >
                                                        Annuler
                                                    </CButton>
                                                </>
                                            )}
                                        </CTableDataCell>
                                    </CTableRow>
                                ))}
                            </CTableBody>
                        </CTable>
                        <Pager meta={invoices.meta} onChange={setPage} />
                    </>
                )}
            </PageCard>

            <CRow>
                <CCol xl={6}>
                    <PageCard className='mb-4 bo-billing-card' title='Abonnements en cours' subtitle='Vos établissements et leurs abonnements actifs.' icon={cilCalendar}>
                        {!subscriptions ? (
                            <Loading />
                        ) : subscriptions.data.length === 0 ? (
                            <EmptyBox illustration={PlaneIllustration} title='Aucun abonnement'>
                                Aucun abonnement payant pour le moment.
                            </EmptyBox>
                        ) : (
                            <ul className='bo-billing-list'>
                                {subscriptions.data.map((s) => (
                                    <li key={s.id}>
                                        <span className='bo-billing-list-icon'>
                                            <CIcon icon={s.plan.code === 'premium' ? cilEducation : cilBank} />
                                        </span>
                                        <div className='bo-billing-list-text'>
                                            <strong>{s.establishment?.name}</strong>
                                            <span>
                                                {s.plan.name} · jusqu&apos;au {formatDate(s.endsAt)}
                                            </span>
                                        </div>
                                        <StatusBadge status={s.status}>
                                            <StatusDot />
                                            {s.statusLabel}
                                        </StatusBadge>
                                        <button
                                            type='button'
                                            className='bo-billing-cancel'
                                            onClick={() =>
                                                window.confirm('Résilier cet abonnement maintenant ?') &&
                                                run(() => api(`/admin/subscriptions/${s.id}/cancel`, { method: 'PUT' }), 'Abonnement résilié', reloadSubs)
                                            }
                                        >
                                            Résilier
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </PageCard>
                    <PageCard className='mb-4 bo-billing-card' title='Campagnes Premium' subtitle='Gérez vos campagnes de communication.' icon={cilBullhorn}>
                        {!campaigns?.data.length ? (
                            <EmptyBox illustration={PlaneIllustration} title='Aucune campagne.'>
                                Vous n&apos;avez aucune campagne Premium pour le moment.
                            </EmptyBox>
                        ) : (
                            <ul className='bo-billing-list'>
                                {campaigns.data.map((c) => (
                                    <li key={c.id}>
                                        <span className='bo-billing-list-icon'>
                                            <CIcon icon={cilBullhorn} />
                                        </span>
                                        <div className='bo-billing-list-text'>
                                            <strong>{c.title}</strong>
                                            <span>
                                                {c.establishment.name} · {c.startsOn} → {c.endsOn}
                                            </span>
                                        </div>
                                        <StatusBadge status={c.isRunning ? 'active' : c.status}>
                                            <StatusDot />
                                            {c.isRunning ? 'En diffusion' : c.statusLabel}
                                        </StatusBadge>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </PageCard>
                </CCol>
                <CCol xl={6}>
                    <PageCard
                        className='mb-4 bo-billing-card'
                        title='Prix et limites des formules'
                        subtitle='Hypothèses de lancement, à ajuster après les entretiens avec les établissements ; chaque changement est journalisé.'
                        icon={cilStorage}
                    >
                        {(plans?.data ?? []).map((plan) => (
                            <PlanEditor key={`${plan.code}-${plan.monthlyPrice}-${plan.yearlyPrice}-${plan.maxPublishedOffers}`} plan={plan} onSaved={reloadPlans} />
                        ))}
                    </PageCard>
                </CCol>
            </CRow>
        </>
    )
}
