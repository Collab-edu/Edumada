'use client'
import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { CButton, CCol, CForm, CFormInput, CFormSelect, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import { useToast } from '@/context/ToastContext'
import { api, errorMessage } from '@/lib/api'
import { useApi } from '@/lib/useApi'
import { formatAriary, formatDate, formatDateTime } from '@/lib/format'
import type { Campaign, Invoice, Paginated, Plan, Subscription } from '@/lib/types'
import { EmptyState, Loading, PageCard, Pager, StatusBadge } from '@/components/ui'
import PageBanner from '@/components/PageBanner'

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
        <CForm onSubmit={save} className='border rounded-3 p-3 mb-3'>
            <h6 style={{ color: 'var(--edu-teal)' }}>{plan.name}</h6>
            <CRow className='g-2 align-items-end'>
                <CCol sm={6} md={3}>
                    <CFormInput label='Prix mensuel (Ar)' inputMode='numeric' value={form.monthlyPrice} onChange={(e) => setForm({ ...form, monthlyPrice: e.target.value })} />
                </CCol>
                <CCol sm={6} md={3}>
                    <CFormInput
                        label='Prix annuel (Ar)'
                        text='Vide = non proposé'
                        inputMode='numeric'
                        value={form.yearlyPrice}
                        onChange={(e) => setForm({ ...form, yearlyPrice: e.target.value })}
                    />
                </CCol>
                <CCol sm={6} md={3}>
                    <CFormInput
                        label='Offres publiées max.'
                        text='Vide = illimité'
                        inputMode='numeric'
                        value={form.maxPublishedOffers}
                        onChange={(e) => setForm({ ...form, maxPublishedOffers: e.target.value })}
                    />
                </CCol>
                <CCol sm={6} md={3} className='mb-md-4'>
                    <CButton type='submit' color='secondary' variant='outline' className='w-100'>
                        Enregistrer
                    </CButton>
                </CCol>
            </CRow>
        </CForm>
    )
}

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
            <PageBanner description="Confirmez une facture quand le paiement est reçu : la formule s'active aussitôt et l'établissement est prévenu." />
            <PageCard
                title='Factures'
                actions={
                    <CFormSelect
                        size='sm'
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
                    <EmptyState title='Aucune facture' />
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
                    <PageCard title='Abonnements en cours'>
                        {!subscriptions ? (
                            <Loading />
                        ) : subscriptions.data.length === 0 ? (
                            <p className='text-body-secondary mb-0'>Aucun abonnement payant.</p>
                        ) : (
                            <CTable align='middle' responsive className='mb-0'>
                                <CTableBody>
                                    {subscriptions.data.map((s) => (
                                        <CTableRow key={s.id}>
                                            <CTableDataCell>
                                                {s.establishment?.name}
                                                <div className='small text-body-secondary'>
                                                    {s.plan.name} · jusqu&apos;au {formatDate(s.endsAt)}
                                                </div>
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <StatusBadge status={s.status}>{s.statusLabel}</StatusBadge>
                                            </CTableDataCell>
                                            <CTableDataCell className='text-end'>
                                                <CButton
                                                    size='sm'
                                                    color='danger'
                                                    variant='ghost'
                                                    onClick={() =>
                                                        window.confirm('Résilier cet abonnement maintenant ?') &&
                                                        run(() => api(`/admin/subscriptions/${s.id}/cancel`, { method: 'PUT' }), 'Abonnement résilié', reloadSubs)
                                                    }
                                                >
                                                    Résilier
                                                </CButton>
                                            </CTableDataCell>
                                        </CTableRow>
                                    ))}
                                </CTableBody>
                            </CTable>
                        )}
                    </PageCard>
                    <PageCard title='Campagnes Premium'>
                        {!campaigns?.data.length ? (
                            <p className='text-body-secondary mb-0'>Aucune campagne.</p>
                        ) : (
                            <CTable align='middle' responsive className='mb-0'>
                                <CTableBody>
                                    {campaigns.data.map((c) => (
                                        <CTableRow key={c.id}>
                                            <CTableDataCell>
                                                {c.title}
                                                <div className='small text-body-secondary'>
                                                    {c.establishment.name} · {c.startsOn} → {c.endsOn}
                                                </div>
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <StatusBadge status={c.isRunning ? 'active' : c.status}>{c.isRunning ? 'En diffusion' : c.statusLabel}</StatusBadge>
                                            </CTableDataCell>
                                        </CTableRow>
                                    ))}
                                </CTableBody>
                            </CTable>
                        )}
                    </PageCard>
                </CCol>
                <CCol xl={6}>
                    <PageCard
                        title='Prix et limites des formules'
                        subtitle='Hypothèses de lancement, à ajuster après les entretiens avec les établissements ; chaque changement est journalisé'
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
