'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import toast from 'react-hot-toast'
import { Button, ButtonLink, FormAlert } from '@/components/ui/form'
import { api } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useApi } from '../useApi'
import { Panel, StatCard } from '../components/SpaceShell'
import type { Inquiry } from '../types'
import { EstablishmentSpace, useEstablishment } from './EstablishmentSpace'

function Dashboard() {
    const { establishment: e, href, reload } = useEstablishment()
    const hasInbox = !!e.plan.features.inquiryInbox
    const { data: inbox } = useApi<{ data: Inquiry[]; counts: Record<string, number> }>(hasInbox ? `/establishments/${e.id}/inquiries` : null, { perPage: 5 })
    const [requesting, setRequesting] = useState(false)
    const offers = e.offers ?? []
    const limit = e.plan.maxPublishedOffers

    // Fiche complète : ce qui aide les étudiants à choisir.
    const checklist = [
        { done: !!e.description && e.description.length > 80, label: 'Une présentation de quelques phrases', page: 'fiche' },
        { done: !!e.imageSrc, label: 'Une photo de couverture', page: 'fiche' },
        { done: e.photos.length >= 2, label: 'Au moins 2 photos des locaux', page: 'fiche' },
        { done: !!e.phone && !!e.email, label: 'Téléphone et e-mail', page: 'fiche' },
        { done: !!e.coordinates, label: 'La position sur la carte', page: 'fiche' },
        { done: e.admissionDocuments.length > 0, label: "Les pièces demandées à l'inscription", page: 'fiche' },
        { done: e.publishedOffersCount > 0, label: 'Au moins une offre publiée', page: 'offres' },
    ]
    const doneCount = checklist.filter((c) => c.done).length

    const requestVerification = async () => {
        setRequesting(true)
        try {
            await api(`/establishments/${e.id}/verification-request`, { method: 'POST' })
            toast.success('Demande envoyée : Edumada vous contactera pour la vérification.')
            await reload()
        } catch (err) {
            toast.error((err as Error).message)
        } finally {
            setRequesting(false)
        }
    }

    return (
        <>
            {e.status === 'pending_review' && (
                <FormAlert tone='info'>Votre fiche est en cours de validation par Edumada. Vous pouvez la compléter en attendant : elle sera visible sur le site dès sa publication.</FormAlert>
            )}
            {e.status === 'suspended' && <FormAlert>Votre fiche est suspendue et n&apos;apparaît plus sur le site. Contactez Edumada pour en savoir plus.</FormAlert>}

            <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
                <StatCard icon='tabler:school' label='Offres publiées' value={limit ? `${e.publishedOffersCount} / ${limit}` : e.publishedOffersCount} hint={limit ? `Limite de la formule ${e.plan.name}` : 'Illimitées'} href={href('offres')} />
                <StatCard icon='tabler:pencil' label='Brouillons' value={offers.filter((o) => o.status === 'draft').length} href={href('offres')} />
                <StatCard
                    icon='tabler:inbox'
                    label='Nouvelles demandes'
                    value={hasInbox ? (inbox?.counts?.new ?? '…') : '—'}
                    hint={hasInbox ? undefined : 'Reçues par e-mail (Gratuit)'}
                    href={href('demandes')}
                />
                <StatCard icon='tabler:shield-check' label='Vérification' value={e.verification.status} href={href('fiche')} />
            </div>

            <Panel
                title={`Fiche complète à ${Math.round((doneCount / checklist.length) * 100)} %`}
                description='Une fiche complète inspire confiance et reçoit plus de demandes.'>
                <div className='mb-4 h-2 overflow-hidden rounded-full bg-offwhite' role='progressbar' aria-valuenow={doneCount} aria-valuemin={0} aria-valuemax={checklist.length}>
                    <div className='h-full rounded-full bg-primary transition-all' style={{ width: `${(doneCount / checklist.length) * 100}%` }} />
                </div>
                <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                    {checklist.map((item) => (
                        <li key={item.label}>
                            <Link href={href(item.page)} className='flex min-h-11 items-center gap-2 rounded-lg px-2 hover:bg-offwhite'>
                                <Icon icon={item.done ? 'tabler:circle-check-filled' : 'tabler:circle-dashed'} className={cn('shrink-0 text-xl', item.done ? 'text-success' : 'text-ink/30')} />
                                <span className={cn(item.done ? 'text-ink/60 line-through' : 'text-ink')}>{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </Panel>

            <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
                <Panel title='Dernières demandes' actions={<ButtonLink href={href('demandes')} variant='secondary' size='sm'>Tout voir</ButtonLink>}>
                    {!hasInbox ? (
                        <div className='flex flex-col gap-3'>
                            <p className='text-ink/70'>
                                Avec la formule Gratuit, chaque demande d&apos;un étudiant vous est envoyée par e-mail{e.email ? ` (${e.email})` : ''}.
                                La boîte de réception avec suivi des statuts est incluse dans Pro et Premium.
                            </p>
                            <ButtonLink href={href('formule')} className='w-fit'>Découvrir Pro</ButtonLink>
                        </div>
                    ) : inbox && inbox.data.length > 0 ? (
                        <ul className='flex flex-col divide-y divide-gray-100'>
                            {inbox.data.map((inquiry) => (
                                <li key={inquiry.id}>
                                    <Link href={href('demandes', { id: String(inquiry.id) })} className='flex items-center justify-between gap-3 py-3 hover:text-primary'>
                                        <span className='flex min-w-0 flex-col'>
                                            <span className='font-semibold text-secondary'>{inquiry.name}</span>
                                            <span className='truncate text-sm text-ink/60'>{inquiry.typeLabel} · {inquiry.offer?.title ?? 'Établissement'}</span>
                                        </span>
                                        <Icon icon='tabler:chevron-right' className='shrink-0 text-ink/40' />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className='text-ink/60'>Aucune demande pour le moment.</p>
                    )}
                </Panel>

                <Panel title='Badge « Établissement vérifié »'>
                    <p className='text-ink/70'>
                        Le badge est attribué par Edumada après un contrôle réel de votre identité et de vos autorisations. Il ne s&apos;achète pas.
                    </p>
                    <div className='mt-4'>
                        {e.verification.status === 'Vérifié' ? (
                            <FormAlert tone='success'>Votre fiche est vérifiée.</FormAlert>
                        ) : e.verification.status === 'En cours' ? (
                            <FormAlert tone='info'>Vérification en cours : Edumada vous contactera.</FormAlert>
                        ) : (
                            <Button onClick={requestVerification} loading={requesting}>
                                <Icon icon='tabler:shield-check' /> Demander la vérification
                            </Button>
                        )}
                    </div>
                </Panel>
            </div>
        </>
    )
}

export default function DashboardPage() {
    return (
        <EstablishmentSpace title='Espace établissement'>
            <Dashboard />
        </EstablishmentSpace>
    )
}
