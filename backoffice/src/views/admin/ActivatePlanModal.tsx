'use client'
import { useState, type FormEvent } from 'react'
import { CAlert, CButton, CForm, CFormInput, CFormSelect, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle, CSpinner } from '@coreui/react'
import { api } from '@/lib/api'
import { useApi } from '@/lib/useApi'
import { formatAriary } from '@/lib/format'
import type { ManagedEstablishment, Plan } from '@/lib/types'
import { useToast } from '@/context/ToastContext'
import { ErrorAlert, PlanBadge } from '@/components/ui'

const PAYMENT_METHODS = [
    { value: 'mvola', label: 'MVola' },
    { value: 'orange_money', label: 'Orange Money' },
    { value: 'airtel_money', label: 'Airtel Money' },
    { value: 'bank_transfer', label: 'Virement bancaire' },
    { value: 'cash', label: 'Espèces' },
]

/**
 * Activation manuelle d'une formule payante, une fois le paiement reçu hors plateforme.
 * Présélectionne la formule choisie à l'inscription, s'il y en a une.
 */
export default function ActivatePlanModal({ establishment: e, onClose, onDone }: { establishment: ManagedEstablishment; onClose: () => void; onDone: () => void }) {
    const toast = useToast()
    const { data } = useApi<{ data: Plan[] }>('/plans')
    const paid = (data?.data ?? []).filter((plan) => plan.code !== 'free')
    const [form, setForm] = useState({
        plan: e.requestedPlan?.code ?? (e.plan.code === 'premium' ? 'premium' : 'pro'),
        billingCycle: e.requestedPlan?.billingCycle ?? 'monthly',
        paymentMethod: 'mvola',
        paymentReference: '',
    })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<unknown>(null)

    const plan = paid.find((p) => p.code === form.plan)
    const yearlyAvailable = plan?.yearlyPrice != null
    const cycle = form.billingCycle === 'yearly' && yearlyAvailable ? 'yearly' : 'monthly'
    const amount = plan ? (cycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice) : null
    const renewal = e.plan.code === form.plan

    const submit = async (ev: FormEvent) => {
        ev.preventDefault()
        setSaving(true)
        setError(null)
        try {
            await api(`/admin/establishments/${e.id}/activate-plan`, {
                method: 'POST',
                body: { ...form, billingCycle: cycle, paymentReference: form.paymentReference || null },
            })
            toast.success(`Formule ${plan?.name ?? ''} activée pour ${e.name}.`)
            onDone()
        } catch (ex) {
            setError(ex)
        } finally {
            setSaving(false)
        }
    }

    return (
        <CModal visible onClose={onClose} alignment='center'>
            <CForm onSubmit={submit}>
                <CModalHeader>
                    <CModalTitle>Activer une formule</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <p className='mb-3'>
                        <strong>{e.name}</strong>
                        <span className='ms-2'>
                            Formule actuelle : <PlanBadge code={e.plan.code} />
                        </span>
                    </p>
                    {e.requestedPlan && (
                        <CAlert color='warning' className='py-2 small'>
                            Formule choisie à l&apos;inscription : <strong>{e.requestedPlan.name}</strong> ({e.requestedPlan.billingCycle === 'yearly' ? 'annuel' : 'mensuel'}).
                        </CAlert>
                    )}
                    <ErrorAlert error={error} />
                    <CFormSelect id='activate-plan' className='mb-3' label='Formule' value={form.plan} onChange={(ev) => setForm({ ...form, plan: ev.target.value as 'pro' | 'premium' })}>
                        {paid.map((p) => (
                            <option key={p.code} value={p.code}>
                                {p.name}
                            </option>
                        ))}
                    </CFormSelect>
                    <CFormSelect
                        className='mb-3'
                        id='activate-cycle'
                        label='Rythme'
                        value={cycle}
                        onChange={(ev) => setForm({ ...form, billingCycle: ev.target.value as 'monthly' | 'yearly' })}
                        text={!yearlyAvailable ? `La formule ${plan?.name ?? ''} n'existe qu'au mois.` : undefined}
                    >
                        <option value='monthly'>Mensuel{plan ? ` — ${formatAriary(plan.monthlyPrice)}` : ''}</option>
                        {yearlyAvailable && <option value='yearly'>Annuel — {formatAriary(plan!.yearlyPrice)}</option>}
                    </CFormSelect>
                    <CFormSelect id='activate-method' className='mb-3' label='Paiement reçu par' value={form.paymentMethod} onChange={(ev) => setForm({ ...form, paymentMethod: ev.target.value })}>
                        {PAYMENT_METHODS.map((m) => (
                            <option key={m.value} value={m.value}>
                                {m.label}
                            </option>
                        ))}
                    </CFormSelect>
                    <CFormInput
                        className='mb-3'
                        id='activate-reference'
                        label='Référence du paiement (facultatif)'
                        placeholder='Ex. : identifiant de la transaction, n° de reçu'
                        value={form.paymentReference}
                        onChange={(ev) => setForm({ ...form, paymentReference: ev.target.value })}
                    />
                    <p className='small text-body-secondary mb-0'>
                        Une facture payée de <strong>{amount != null ? formatAriary(amount) : '—'}</strong> est enregistrée.{' '}
                        {renewal
                            ? 'La période s’ajoute à la fin de l’abonnement en cours.'
                            : `La formule prend effet aujourd’hui pour ${cycle === 'yearly' ? 'un an' : 'un mois'}.`}{' '}
                        L&apos;établissement est prévenu par e-mail.
                    </p>
                </CModalBody>
                <CModalFooter>
                    <CButton color='secondary' variant='ghost' onClick={onClose}>
                        Annuler
                    </CButton>
                    <CButton color='primary' type='submit' disabled={saving || !plan}>
                        {saving && <CSpinner size='sm' className='me-2' />}
                        Activer la formule
                    </CButton>
                </CModalFooter>
            </CForm>
        </CModal>
    )
}
