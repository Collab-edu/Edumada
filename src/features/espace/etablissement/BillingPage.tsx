'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import toast from 'react-hot-toast'
import Dialog from '@/components/ui/dialog'
import { Badge, Button, FormAlert, SelectField, TextField } from '@/components/ui/form'
import { api, ApiError } from '@/lib/api'
import { useApi } from '../useApi'
import { Panel, formatAriary, formatDateTime } from '../components/SpaceShell'
import PlanCards from '../components/PlanCards'
import type { Invoice, Plan, Subscription } from '../types'
import { EstablishmentSpace, useEstablishment } from './EstablishmentSpace'

type Billing = {
    plan: Plan
    subscription: Subscription | null
    plans: Plan[]
    publishedOffersCount: number
    invoices: Invoice[]
    paymentMethods: { value: string; label: string; instructions: string }[]
}

const INVOICE_TONE = { pending: 'warning', paid: 'success', cancelled: 'neutral' } as const
const dateFr = (iso: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso))

function PendingInvoice({ invoice, onChanged }: { invoice: Invoice; onChanged: () => void }) {
    const [reference, setReference] = useState(invoice.paymentReference ?? '')
    const [saving, setSaving] = useState(false)

    const send = async (cancel = false) => {
        if (cancel && !window.confirm('Annuler cette facture ?')) return
        setSaving(true)
        try {
            await api(`/invoices/${invoice.id}`, { method: 'PATCH', body: cancel ? { cancel: true } : { paymentReference: reference } })
            toast.success(cancel ? 'Facture annulée' : 'Référence envoyée : Edumada confirme votre paiement sous 48 h ouvrées.')
            onChanged()
        } catch (err) {
            toast.error((err as ApiError).field('paymentReference') ?? (err as Error).message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <Panel title={`Facture ${invoice.number} en attente de paiement`} description={`Formule ${invoice.plan.name} · ${invoice.billingCycleLabel}`}>
            <div className='flex flex-col gap-4'>
                <p className='text-3xl font-bold text-secondary'>{formatAriary(invoice.amount)}</p>
                <div className='rounded-xl bg-offwhite p-4'>
                    <p className='font-semibold text-secondary'>Comment payer ({invoice.paymentMethodLabel})</p>
                    <p className='mt-1 text-ink/80'>{invoice.paymentInstructions}</p>
                    <p className='mt-2 text-sm text-ink/60'>Indiquez le numéro <strong>{invoice.number}</strong> en référence du paiement.</p>
                </div>
                <div className='flex flex-col sm:flex-row gap-3 sm:items-end'>
                    <TextField
                        label='Référence de votre paiement'
                        hint='Ex. : identifiant de la transaction MVola.'
                        className='flex-1'
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                    />
                    <Button onClick={() => send()} loading={saving} disabled={!reference.trim()}>Envoyer la référence</Button>
                </div>
                <div className='flex flex-wrap gap-3'>
                    <Link href={`/espace/etablissement/facture/?id=${invoice.id}`} className='inline-flex min-h-11 items-center gap-1.5 font-semibold text-secondary hover:text-primary'>
                        <Icon icon='tabler:printer' /> Voir et imprimer la facture
                    </Link>
                    <button type='button' onClick={() => send(true)} className='min-h-11 font-semibold text-ink/60 hover:text-primary hover:cursor-pointer'>Annuler la facture</button>
                </div>
            </div>
        </Panel>
    )
}

function Billing() {
    const { establishment: e, reload: reloadEstablishment } = useEstablishment()
    const { data, reload } = useApi<{ data: Billing }>(`/establishments/${e.id}/billing`)
    const [choice, setChoice] = useState<Plan | null>(null)
    const [cycle, setCycle] = useState('yearly')
    const [method, setMethod] = useState('mvola')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<ApiError | null>(null)

    if (!data) return <div className='h-64 rounded-2xl bg-white animate-pulse' />
    const billing = data.data
    const pending = billing.invoices.find((i) => i.status === 'pending')

    const request = async () => {
        if (!choice) return
        setSaving(true)
        setError(null)
        try {
            await api(`/establishments/${e.id}/subscription-requests`, { method: 'POST', body: { plan: choice.code, billingCycle: cycle, paymentMethod: method } })
            toast.success('Facture créée : suivez les instructions de paiement.')
            setChoice(null)
            await reload()
        } catch (err) {
            setError(err as ApiError)
        } finally {
            setSaving(false)
        }
    }

    const sub = billing.subscription

    return (
        <>
            <Panel title={`Formule ${billing.plan.name}`}>
                {sub ? (
                    <div className='flex flex-col gap-2'>
                        <p className='text-ink/80'>
                            {sub.status === 'grace' ? (
                                <>Votre abonnement est arrivé à échéance : période de grâce jusqu&apos;au <strong>{dateFr(sub.graceEndsAt!)}</strong>. Renouvelez pour garder les fonctions payantes.</>
                            ) : sub.endsAt ? (
                                <>Active jusqu&apos;au <strong>{dateFr(sub.endsAt)}</strong> ({sub.billingCycleLabel.toLowerCase()}). Vous recevrez un rappel 30, 7 et 1 jour(s) avant.</>
                            ) : (
                                'Formule active.'
                            )}
                        </p>
                        <p className='text-sm text-ink/60'>À l&apos;expiration, votre fiche reste en ligne avec la formule Gratuit ; seules les fonctions payantes s&apos;arrêtent.</p>
                    </div>
                ) : (
                    <p className='text-ink/80'>
                        Votre fiche est référencée gratuitement ({billing.publishedOffersCount} offre(s) publiée(s){billing.plan.maxPublishedOffers ? ` sur ${billing.plan.maxPublishedOffers}` : ''}).
                        Passez à Pro pour gérer vos demandes et publier sans limite, ou à Premium pour promouvoir vos formations.
                    </p>
                )}
            </Panel>

            {pending && <PendingInvoice key={pending.id + (pending.paymentReference ?? '')} invoice={pending} onChanged={() => { reload(); reloadEstablishment() }} />}

            <PlanCards
                plans={billing.plans}
                current={billing.plan.code}
                action={(plan) =>
                    plan.code === 'free' ? null : (
                        <Button
                            variant={plan.code === 'pro' ? 'primary' : 'dark'}
                            disabled={!!pending}
                            onClick={() => {
                                setChoice(plan)
                                setCycle(plan.yearlyPrice !== null ? 'yearly' : 'monthly')
                            }}>
                            {billing.plan.code === plan.code ? 'Renouveler' : `Choisir ${plan.name}`}
                        </Button>
                    )
                }
            />
            <p className='text-sm text-ink/60'>
                Prix de lancement indicatifs. Pour une rentrée ponctuelle, une campagne Premium d&apos;un mois peut suffire : pas besoin d&apos;un abonnement toute l&apos;année.
            </p>

            <Panel title='Factures'>
                {billing.invoices.length === 0 ? (
                    <p className='text-ink/60'>Aucune facture.</p>
                ) : (
                    <ul className='flex flex-col divide-y divide-gray-100'>
                        {billing.invoices.map((invoice) => (
                            <li key={invoice.id} className='flex flex-wrap items-center justify-between gap-3 py-3'>
                                <span className='flex flex-col'>
                                    <span className='font-semibold text-secondary'>{invoice.number} · {invoice.plan.name}</span>
                                    <span className='text-sm text-ink/60'>{formatDateTime(invoice.createdAt)} · {formatAriary(invoice.amount)}</span>
                                </span>
                                <span className='flex items-center gap-3'>
                                    <Badge tone={INVOICE_TONE[invoice.status]}>{invoice.statusLabel}</Badge>
                                    <Link href={`/espace/etablissement/facture/?id=${invoice.id}`} className='inline-flex min-h-11 items-center px-2 font-semibold text-secondary hover:text-primary' aria-label={`Voir la facture ${invoice.number}`}>
                                        <Icon icon='tabler:file-invoice' className='text-xl' />
                                    </Link>
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </Panel>

            <Dialog open={!!choice} onClose={() => setChoice(null)} title={`Formule ${choice?.name ?? ''}`} description='Une facture est créée ; la formule est activée dès que le paiement est confirmé par Edumada.'>
                {choice && (
                    <div className='flex flex-col gap-4'>
                        {error && <FormAlert>{error.field('billingCycle') ?? error.field('plan') ?? error.message}</FormAlert>}
                        <SelectField
                            label='Rythme'
                            options={[
                                { value: 'monthly', label: `Mensuel — ${formatAriary(choice.monthlyPrice)}` },
                                ...(choice.yearlyPrice !== null ? [{ value: 'yearly', label: `Annuel — ${formatAriary(choice.yearlyPrice)}` }] : []),
                            ]}
                            value={cycle}
                            onChange={(ev) => setCycle(ev.target.value)}
                        />
                        <SelectField label='Moyen de paiement' options={billing.paymentMethods.map((m) => ({ value: m.value, label: m.label }))} value={method} onChange={(ev) => setMethod(ev.target.value)} />
                        <p className='rounded-lg bg-offwhite px-4 py-3 text-sm text-ink/80'>{billing.paymentMethods.find((m) => m.value === method)?.instructions}</p>
                        <Button onClick={request} loading={saving}>Créer la facture</Button>
                    </div>
                )}
            </Dialog>
        </>
    )
}

export default function BillingPage() {
    return (
        <EstablishmentSpace title='Formule et factures'>
            <Billing />
        </EstablishmentSpace>
    )
}
