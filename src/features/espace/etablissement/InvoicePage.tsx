'use client'
import { useSearchParams } from 'next/navigation'
import { Icon } from '@iconify/react/dist/iconify.js'
import Logo from '@/components/layout/header/Logo'
import { Button, EmptyState } from '@/components/ui/form'
import { PageSkeleton } from '@/components/ui/page-state'
import { useApi } from '../useApi'
import { SpaceShell, formatAriary } from '../components/SpaceShell'
import type { Invoice } from '../types'

const dateFr = (iso: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso))

/** Facture imprimable (ou enregistrable en PDF depuis le navigateur). */
function InvoiceView() {
    const id = useSearchParams().get('id')
    const { data, error } = useApi<{ data: Invoice }>(id ? `/invoices/${id}` : null)
    if (error) return <EmptyState icon='tabler:file-off' title='Facture introuvable' />
    if (!data) return <PageSkeleton />
    const invoice = data.data

    return (
        <div className='flex flex-col gap-4'>
            <Button variant='secondary' className='w-fit print:hidden' onClick={() => window.print()}>
                <Icon icon='tabler:printer' /> Imprimer ou enregistrer en PDF
            </Button>
            <article className='rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-10 print:shadow-none print:ring-0'>
                <header className='flex flex-col sm:flex-row justify-between gap-6 border-b border-gray-100 pb-6'>
                    <div className='max-w-[160px]'><Logo /></div>
                    <div className='sm:text-right'>
                        <p className='text-2xl font-bold text-secondary'>Facture {invoice.number}</p>
                        <p className='text-ink/70'>Émise le {dateFr(invoice.createdAt)}</p>
                        <p className='mt-1 font-semibold text-secondary'>{invoice.statusLabel}{invoice.paidAt ? ` le ${dateFr(invoice.paidAt)}` : ''}</p>
                    </div>
                </header>
                <section className='grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 text-ink/80'>
                    <div>
                        <p className='text-sm font-semibold uppercase text-ink/50'>Facturé à</p>
                        <p className='font-semibold text-secondary'>{invoice.establishment.name}</p>
                        {invoice.establishment.address && <p>{invoice.establishment.address}</p>}
                        <p>{invoice.establishment.city}</p>
                        {invoice.establishment.email && <p>{invoice.establishment.email}</p>}
                    </div>
                    <div>
                        <p className='text-sm font-semibold uppercase text-ink/50'>Paiement</p>
                        <p>{invoice.paymentMethodLabel}</p>
                        {invoice.paymentReference && <p>Référence : {invoice.paymentReference}</p>}
                        {invoice.status === 'pending' && invoice.paymentInstructions && <p className='mt-1 text-sm'>{invoice.paymentInstructions}</p>}
                    </div>
                </section>
                <table className='w-full text-left'>
                    <thead className='border-b border-gray-100 text-sm text-ink/60'>
                        <tr><th className='py-2'>Désignation</th><th className='py-2 text-right'>Montant</th></tr>
                    </thead>
                    <tbody>
                        <tr className='border-b border-gray-100'>
                            <td className='py-3'>
                                Formule {invoice.plan.name} — {invoice.billingCycleLabel.toLowerCase()}
                                {invoice.periodStartsOn && invoice.periodEndsOn && (
                                    <span className='block text-sm text-ink/60'>Du {dateFr(invoice.periodStartsOn)} au {dateFr(invoice.periodEndsOn)}</span>
                                )}
                            </td>
                            <td className='py-3 text-right tabular-nums'>{formatAriary(invoice.amount)}</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr><td className='pt-4 font-bold text-secondary'>Total</td><td className='pt-4 text-right text-xl font-bold text-secondary tabular-nums'>{formatAriary(invoice.amount)}</td></tr>
                    </tfoot>
                </table>
            </article>
        </div>
    )
}

export default function InvoicePage() {
    return (
        <SpaceShell roles={['establishment', 'admin']} title='Facture' nav={[{ href: '/espace/etablissement/', label: 'Retour à mon espace', icon: 'tabler:arrow-left' }]}>
            <InvoiceView />
        </SpaceShell>
    )
}
