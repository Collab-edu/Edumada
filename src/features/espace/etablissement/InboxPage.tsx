'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Icon } from '@iconify/react/dist/iconify.js'
import toast from 'react-hot-toast'
import Dialog from '@/components/ui/dialog'
import { Badge, Button, ButtonLink, EmptyState, FormAlert, SelectField, TextArea, TextField } from '@/components/ui/form'
import { api, downloadFile, type Paginated } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useApi } from '../useApi'
import { Pager, Panel, formatDateTime } from '../components/SpaceShell'
import { INQUIRY_STATUS_FOR_ESTABLISHMENT, INQUIRY_STATUS_TONE, type Inquiry, type InquiryStatus } from '../types'
import { EstablishmentSpace, useEstablishment } from './EstablishmentSpace'

const STATUSES = Object.keys(INQUIRY_STATUS_FOR_ESTABLISHMENT) as InquiryStatus[]

/** Fiche d'une demande : message, pièces jointes, historique et changement de statut. */
export function InquiryDetail({ inquiry, onChanged, readOnly = false }: { inquiry: Inquiry; onChanged?: (inquiry: Inquiry) => void; readOnly?: boolean }) {
    const [status, setStatus] = useState<InquiryStatus>(inquiry.status === 'new' ? 'in_review' : inquiry.status)
    const [note, setNote] = useState('')
    const [saving, setSaving] = useState(false)

    const save = async () => {
        setSaving(true)
        try {
            const res = await api<{ data: Inquiry }>(`/inquiries/${inquiry.id}/status`, { method: 'PUT', body: { status, note: note || undefined } })
            toast.success("Statut mis à jour : l'étudiant est prévenu par e-mail.")
            setNote('')
            onChanged?.(res.data)
        } catch (err) {
            toast.error((err as Error).message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className='flex flex-col gap-5'>
            <div className='flex flex-wrap items-center gap-2'>
                <Badge tone={inquiry.type === 'application' ? 'info' : 'neutral'}>{inquiry.typeLabel}</Badge>
                <Badge tone={INQUIRY_STATUS_TONE[inquiry.status]}>{readOnly ? inquiry.statusLabel : INQUIRY_STATUS_FOR_ESTABLISHMENT[inquiry.status]}</Badge>
                <span className='text-sm text-ink/60'>{formatDateTime(inquiry.createdAt)}</span>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-xl bg-offwhite p-4 text-sm'>
                <a href={`mailto:${inquiry.email}`} className='flex min-h-10 items-center gap-2 text-secondary hover:text-primary'><Icon icon='tabler:mail' /> {inquiry.email}</a>
                {inquiry.phone && <a href={`tel:${inquiry.phone.replace(/\s/g, '')}`} className='flex min-h-10 items-center gap-2 text-secondary hover:text-primary'><Icon icon='tabler:phone' /> {inquiry.phone}</a>}
                <span className='flex items-center gap-2 text-ink/80 sm:col-span-2'><Icon icon='tabler:school' className='text-secondary' /> {inquiry.offer?.title ?? "L'établissement"}</span>
            </div>
            {inquiry.message && <p className='whitespace-pre-line text-ink/90'>{inquiry.message}</p>}

            {inquiry.attachments && inquiry.attachments.length > 0 && (
                <div className='flex flex-col gap-2'>
                    <p className='text-sm font-semibold text-secondary'>Documents joints</p>
                    {inquiry.attachments.map((file) => (
                        <button
                            key={file.id}
                            type='button'
                            onClick={() => downloadFile(`/inquiries/${inquiry.id}/attachments/${file.id}`, file.name).catch((e) => toast.error(e.message))}
                            className='flex min-h-11 items-center gap-2 rounded-lg border border-gray-100 px-3 text-left text-secondary hover:border-primary hover:text-primary hover:cursor-pointer'>
                            <Icon icon={file.mimeType === 'application/pdf' ? 'tabler:file-type-pdf' : 'tabler:photo'} className='text-lg' />
                            <span className='flex-1 truncate'>{file.name}</span>
                            <span className='text-xs text-ink/50'>{Math.round(file.size / 1024)} Ko</span>
                        </button>
                    ))}
                </div>
            )}

            {inquiry.history && inquiry.history.length > 0 && (
                <div>
                    <p className='mb-2 text-sm font-semibold text-secondary'>Historique</p>
                    <ol className='flex flex-col gap-3 border-l-2 border-gray-100 pl-4'>
                        {inquiry.history.map((step, i) => (
                            <li key={i} className='relative'>
                                <span className='absolute -left-[23px] top-1.5 h-3 w-3 rounded-full bg-primary' aria-hidden='true' />
                                <p className='font-semibold text-secondary'>{readOnly ? step.toLabel : INQUIRY_STATUS_FOR_ESTABLISHMENT[step.to]}</p>
                                <p className='text-xs text-ink/50'>{formatDateTime(step.at)}</p>
                                {step.note && <p className='mt-1 rounded-lg bg-offwhite px-3 py-2 text-sm text-ink/80'>{step.note}</p>}
                            </li>
                        ))}
                    </ol>
                </div>
            )}

            {!readOnly && (
                <div className='flex flex-col gap-3 border-t border-gray-100 pt-4'>
                    <SelectField
                        label='Nouveau statut'
                        options={STATUSES.filter((s) => s !== 'new').map((s) => ({ value: s, label: INQUIRY_STATUS_FOR_ESTABLISHMENT[s] }))}
                        value={status}
                        onChange={(e) => setStatus(e.target.value as InquiryStatus)}
                    />
                    <TextArea label="Message pour l'étudiant (facultatif)" rows={3} placeholder='Ex. : entretien le mardi 12 à 10 h, apportez votre relevé de notes.' value={note} onChange={(e) => setNote(e.target.value)} />
                    <Button onClick={save} loading={saving}>Mettre à jour et prévenir l&apos;étudiant</Button>
                </div>
            )}
        </div>
    )
}

function Inbox() {
    const { establishment: e, href } = useEstablishment()
    const router = useRouter()
    const openId = useSearchParams().get('id')
    const [filters, setFilters] = useState({ status: '', type: '', offer: '', q: '', page: 1 })
    const hasInbox = !!e.plan.features.inquiryInbox
    const { data, loading, reload } = useApi<Paginated<Inquiry> & { counts: Record<string, number> }>(
        hasInbox ? `/establishments/${e.id}/inquiries` : null,
        { status: filters.status, type: filters.type, offer: filters.offer, q: filters.q, page: filters.page }
    )
    const [selected, setSelected] = useState<Inquiry | null>(null)

    useEffect(() => {
        if (!openId) return setSelected(null)
        api<{ data: Inquiry }>(`/inquiries/${openId}`).then((res) => setSelected(res.data)).catch(() => setSelected(null))
    }, [openId])

    const open = (inquiry: Inquiry) => router.push(href('demandes', { id: String(inquiry.id) }), { scroll: false })
    const close = () => router.push(href('demandes'), { scroll: false })

    if (!hasInbox) {
        return (
            <Panel title='Boîte de réception' description={`Formule ${e.plan.name}`}>
                <div className='flex flex-col gap-4'>
                    <FormAlert tone='info'>
                        Avec la formule Gratuit, chaque demande et candidature vous est envoyée par e-mail{e.email ? ` à ${e.email}` : ''}, avec les coordonnées de l&apos;étudiant.
                    </FormAlert>
                    <ul className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-ink/80'>
                        {['Toutes les demandes au même endroit', 'Statuts : en cours, entretien, acceptée…', "L'étudiant est prévenu à chaque étape", 'Filtres par offre et export CSV'].map((item) => (
                            <li key={item} className='flex items-start gap-2'><Icon icon='tabler:circle-check-filled' className='mt-0.5 text-primary' /> {item}</li>
                        ))}
                    </ul>
                    <ButtonLink href={href('formule')} className='w-fit'>Passer à Pro</ButtonLink>
                </div>
            </Panel>
        )
    }

    const counts = data?.counts ?? {}
    const total = Object.values(counts).reduce((a, b) => a + Number(b), 0)

    return (
        <Panel
            title='Demandes et candidatures'
            actions={
                <Button
                    variant='secondary'
                    size='sm'
                    onClick={() =>
                        downloadFile(`/establishments/${e.id}/inquiries/export?status=${filters.status}&type=${filters.type}&offer=${filters.offer}`, `demandes-${e.id}.csv`).catch((err) => toast.error(err.message))
                    }>
                    <Icon icon='tabler:download' /> Exporter (CSV)
                </Button>
            }>
            <div className='mb-4 flex gap-2 overflow-x-auto pb-1'>
                {[['', `Toutes (${total})`], ...STATUSES.map((s) => [s, `${INQUIRY_STATUS_FOR_ESTABLISHMENT[s]} (${counts[s] ?? 0})`])].map(([value, label]) => (
                    <button
                        key={value}
                        type='button'
                        aria-pressed={filters.status === value}
                        onClick={() => setFilters({ ...filters, status: value, page: 1 })}
                        className={cn('min-h-10 whitespace-nowrap rounded-full px-4 text-sm font-semibold hover:cursor-pointer', filters.status === value ? 'bg-secondary text-white' : 'bg-offwhite text-secondary')}>
                        {label}
                    </button>
                ))}
            </div>
            <div className='mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3'>
                <TextField label='Rechercher' placeholder='Nom ou e-mail' value={filters.q} onChange={(ev) => setFilters({ ...filters, q: ev.target.value, page: 1 })} />
                <SelectField label='Type' placeholder='Tous' options={[{ value: 'information', label: "Demandes d'information" }, { value: 'application', label: 'Candidatures' }]} value={filters.type} onChange={(ev) => setFilters({ ...filters, type: ev.target.value, page: 1 })} />
                <SelectField label='Offre' placeholder='Toutes' options={(e.offers ?? []).map((o) => ({ value: o.id, label: o.title }))} value={filters.offer} onChange={(ev) => setFilters({ ...filters, offer: ev.target.value, page: 1 })} />
            </div>

            {loading && !data ? (
                <div className='h-40 rounded-xl bg-offwhite animate-pulse' />
            ) : !data || data.data.length === 0 ? (
                <EmptyState icon='tabler:inbox' title='Aucune demande'>Les demandes des étudiants apparaîtront ici.</EmptyState>
            ) : (
                <>
                    <ul className='flex flex-col divide-y divide-gray-100'>
                        {data.data.map((inquiry) => (
                            <li key={inquiry.id}>
                                <button type='button' onClick={() => open(inquiry)} className='flex w-full items-center gap-3 py-3 text-left hover:bg-offwhite hover:cursor-pointer sm:px-2'>
                                    <span className={cn('h-2.5 w-2.5 shrink-0 rounded-full', inquiry.status === 'new' ? 'bg-primary' : 'bg-transparent')} aria-hidden='true' />
                                    <span className='flex min-w-0 flex-1 flex-col'>
                                        <span className='flex flex-wrap items-center gap-2'>
                                            <span className='font-semibold text-secondary'>{inquiry.name}</span>
                                            <Badge tone={INQUIRY_STATUS_TONE[inquiry.status]}>{INQUIRY_STATUS_FOR_ESTABLISHMENT[inquiry.status]}</Badge>
                                        </span>
                                        <span className='truncate text-sm text-ink/60'>{inquiry.typeLabel} · {inquiry.offer?.title ?? "L'établissement"}</span>
                                    </span>
                                    <span className='hidden sm:block shrink-0 text-xs text-ink/50'>{formatDateTime(inquiry.createdAt)}</span>
                                    <Icon icon='tabler:chevron-right' className='shrink-0 text-ink/40' />
                                </button>
                            </li>
                        ))}
                    </ul>
                    <Pager page={data.meta.current_page} lastPage={data.meta.last_page} onChange={(page) => setFilters({ ...filters, page })} />
                </>
            )}

            <Dialog open={!!selected} onClose={close} title={selected?.name ?? ''} className='sm:max-w-2xl'>
                {selected && (
                    <InquiryDetail
                        key={selected.updatedAt}
                        inquiry={selected}
                        onChanged={(updated) => {
                            setSelected(updated)
                            reload()
                        }}
                    />
                )}
            </Dialog>
        </Panel>
    )
}

export default function InboxPage() {
    return (
        <EstablishmentSpace title='Demandes'>
            <Inbox />
        </EstablishmentSpace>
    )
}
