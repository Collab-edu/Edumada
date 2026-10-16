'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import toast from 'react-hot-toast'
import { Badge, Button, ButtonLink, EmptyState, FormAlert } from '@/components/ui/form'
import { api, ApiError } from '@/lib/api'
import { imageOr } from '@/lib/media'
import { formatTuition } from '@/features/formations/format'
import { Panel, formatDateTime } from '../components/SpaceShell'
import type { ManagedOffer } from '../types'
import { EstablishmentSpace, useEstablishment } from './EstablishmentSpace'

const STATUS_TONE = { draft: 'neutral', published: 'success', archived: 'warning' } as const

function Offers() {
    const { establishment: e, href, reload } = useEstablishment()
    const [busy, setBusy] = useState<string | null>(null)
    const [filter, setFilter] = useState<'all' | ManagedOffer['status']>('all')
    const offers = (e.offers ?? []).filter((o) => filter === 'all' || o.status === filter)
    const limit = e.plan.maxPublishedOffers
    const atLimit = limit !== null && e.publishedOffersCount >= limit

    const setStatus = async (offer: ManagedOffer, status: ManagedOffer['status']) => {
        setBusy(offer.id)
        try {
            await api(`/offers/${offer.id}`, { method: 'PATCH', body: { status } })
            toast.success(status === 'published' ? 'Offre publiée' : status === 'archived' ? 'Offre archivée' : 'Offre repassée en brouillon')
            await reload()
        } catch (err) {
            toast.error((err as ApiError).field('status') ?? (err as Error).message, { duration: 6000 })
        } finally {
            setBusy(null)
        }
    }

    const remove = async (offer: ManagedOffer) => {
        if (!window.confirm(`Supprimer définitivement « ${offer.title} » ?`)) return
        setBusy(offer.id)
        try {
            await api(`/offers/${offer.id}`, { method: 'DELETE' })
            toast.success('Offre supprimée')
            await reload()
        } catch (err) {
            toast.error((err as Error).message)
        } finally {
            setBusy(null)
        }
    }

    return (
        <Panel
            title='Mes offres'
            description={limit ? `${e.publishedOffersCount} offre(s) publiée(s) sur ${limit} avec la formule ${e.plan.name}.` : `Formule ${e.plan.name} : offres illimitées.`}
            actions={<ButtonLink href={href('offre')}><Icon icon='tabler:plus' /> Nouvelle offre</ButtonLink>}>
            {atLimit && (
                <div className='mb-4'>
                    <FormAlert tone='info'>
                        Vous avez atteint la limite de la formule {e.plan.name}. Vous pouvez enregistrer des brouillons ;{' '}
                        <Link href={href('formule')} className='underline'>passez à Pro</Link> pour publier sans limite.
                    </FormAlert>
                </div>
            )}

            <div className='mb-4 flex gap-2 overflow-x-auto' role='tablist' aria-label='Filtrer les offres'>
                {([['all', 'Toutes'], ['published', 'Publiées'], ['draft', 'Brouillons'], ['archived', 'Archivées']] as const).map(([value, label]) => (
                    <button
                        key={value}
                        type='button'
                        role='tab'
                        aria-selected={filter === value}
                        onClick={() => setFilter(value)}
                        className={`min-h-10 whitespace-nowrap rounded-full px-4 text-sm font-semibold hover:cursor-pointer ${filter === value ? 'bg-secondary text-white' : 'bg-offwhite text-secondary'}`}>
                        {label}
                    </button>
                ))}
            </div>

            {offers.length === 0 ? (
                <EmptyState icon='tabler:school' title='Aucune offre ici' action={<ButtonLink href={href('offre')}>Ajouter une offre</ButtonLink>}>
                    Ajoutez vos formations, niveaux scolaires ou modes d&apos;accueil : ils apparaîtront dans la recherche.
                </EmptyState>
            ) : (
                <ul className='flex flex-col gap-3'>
                    {offers.map((offer) => (
                        <li key={offer.id} className='flex flex-col sm:flex-row gap-4 rounded-xl border border-gray-100 p-3'>
                            <div className='relative h-28 w-full shrink-0 overflow-hidden rounded-lg bg-cream sm:h-24 sm:w-36'>
                                <Image src={imageOr(offer.imageSrc)} alt='' fill className='object-cover' />
                            </div>
                            <div className='flex min-w-0 flex-1 flex-col gap-1'>
                                <div className='flex flex-wrap items-center gap-2'>
                                    <Badge tone={STATUS_TONE[offer.status]}>{offer.statusLabel}</Badge>
                                    <Badge tone='info'>{offer.registration}</Badge>
                                </div>
                                <p className='font-semibold text-secondary'>{offer.title}</p>
                                <p className='text-sm text-ink/60'>
                                    {[offer.diploma, formatTuition(offer) ?? 'Frais non communiqués', offer.modality].filter(Boolean).join(' · ')}
                                </p>
                                <p className='text-xs text-ink/50'>Modifiée le {formatDateTime(offer.updatedAt)}</p>
                            </div>
                            <div className='flex flex-wrap items-center gap-2 sm:flex-col sm:items-stretch sm:justify-center'>
                                <ButtonLink href={href('offre', { id: offer.id })} variant='secondary' size='sm'><Icon icon='tabler:pencil' /> Modifier</ButtonLink>
                                {offer.status !== 'published' ? (
                                    <Button size='sm' loading={busy === offer.id} onClick={() => setStatus(offer, 'published')}>Publier</Button>
                                ) : (
                                    <Button size='sm' variant='ghost' loading={busy === offer.id} onClick={() => setStatus(offer, 'archived')}>Archiver</Button>
                                )}
                                {offer.status === 'published' && (
                                    <Link href={`/formations/${offer.id}/`} className='inline-flex min-h-9 items-center justify-center gap-1 px-3 text-sm font-semibold text-secondary hover:text-primary'>
                                        <Icon icon='tabler:external-link' /> Voir
                                    </Link>
                                )}
                                {offer.status !== 'published' && (
                                    <Button size='sm' variant='ghost' onClick={() => remove(offer)} aria-label={`Supprimer ${offer.title}`}><Icon icon='tabler:trash' /></Button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </Panel>
    )
}

export default function OffersPage() {
    return (
        <EstablishmentSpace title='Offres'>
            <Offers />
        </EstablishmentSpace>
    )
}
