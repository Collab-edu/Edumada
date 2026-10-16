'use client'
import { useState, type FormEvent } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import toast from 'react-hot-toast'
import Dialog from '@/components/ui/dialog'
import { Badge, Button, ButtonLink, EmptyState, FormAlert, SelectField, TextArea, TextField } from '@/components/ui/form'
import { api, ApiError } from '@/lib/api'
import type { CategoryType } from '@/features/categories/types'
import { useApi } from '../useApi'
import { Panel } from '../components/SpaceShell'
import ImageUpload from '../components/ImageUpload'
import type { Campaign } from '../types'
import { EstablishmentSpace, useEstablishment } from './EstablishmentSpace'

const CITIES = ['Antananarivo', 'Antsirabe', 'Fianarantsoa', 'Toamasina', 'Mahajanga', 'Toliara', 'Antsiranana']
const today = () => new Date().toISOString().slice(0, 10)
const inDays = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10)
const dateFr = (iso: string) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`))

function CampaignForm({ onDone }: { onDone: () => void }) {
    const { establishment: e } = useEstablishment()
    const { data: categories } = useApi<{ data: CategoryType[] }>('/categories')
    const { data: domains } = useApi<{ data: { name: string }[] }>('/domains')
    const published = (e.offers ?? []).filter((o) => o.status === 'published')
    const [form, setForm] = useState({
        offer: published[0]?.id ?? '', title: '', description: '', image: '', callToAction: 'Postuler',
        startsOn: today(), endsOn: inDays(30), targetCategory: '', targetDomain: '', targetCity: '',
    })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<ApiError | null>(null)
    const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }))

    const submit = async (ev: FormEvent) => {
        ev.preventDefault()
        setSaving(true)
        setError(null)
        try {
            await api(`/establishments/${e.id}/campaigns`, {
                method: 'POST',
                body: { ...form, targetCategory: form.targetCategory || null, targetDomain: form.targetDomain || null, targetCity: form.targetCity || null, image: form.image || null },
            })
            toast.success('Campagne programmée')
            onDone()
        } catch (err) {
            setError(err as ApiError)
        } finally {
            setSaving(false)
        }
    }

    if (published.length === 0) return <FormAlert tone='info'>Publiez d&apos;abord une offre : une campagne met en avant une offre publiée.</FormAlert>

    return (
        <form onSubmit={submit} className='flex flex-col gap-4'>
            {error && Object.keys(error.errors).length === 0 && <FormAlert>{error.message}</FormAlert>}
            <SelectField label='Offre à promouvoir' options={published.map((o) => ({ value: o.id, label: o.title }))} value={form.offer} onChange={(ev) => set('offer', ev.target.value)} error={error?.field('offer')} />
            <TextField label='Titre de la campagne' required placeholder='Ex. : Inscriptions ouvertes pour la rentrée 2027' value={form.title} onChange={(ev) => set('title', ev.target.value)} error={error?.field('title')} />
            <TextArea label='Accroche' rows={2} maxLength={500} value={form.description} onChange={(ev) => set('description', ev.target.value)} />
            <TextField label="Bouton d'action" maxLength={60} value={form.callToAction} onChange={(ev) => set('callToAction', ev.target.value)} />
            <ImageUpload label='Visuel (facultatif)' value={form.image} onChange={(v) => set('image', v as string)} />
            <div className='grid grid-cols-2 gap-3'>
                <TextField label='Début' type='date' min={today()} value={form.startsOn} onChange={(ev) => set('startsOn', ev.target.value)} error={error?.field('startsOn')} />
                <TextField label='Fin' type='date' value={form.endsOn} onChange={(ev) => set('endsOn', ev.target.value)} error={error?.field('endsOn')} />
            </div>
            <p className='text-sm font-semibold text-secondary'>Ciblage (facultatif) : la campagne s&apos;affiche dans ces recherches</p>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                <SelectField label='Catégorie' placeholder='Toutes' options={(categories?.data ?? []).map((c) => ({ value: c.id, label: c.shortLabel }))} value={form.targetCategory} onChange={(ev) => set('targetCategory', ev.target.value)} />
                <SelectField label='Domaine' placeholder='Tous' options={(domains?.data ?? []).map((d) => d.name)} value={form.targetDomain} onChange={(ev) => set('targetDomain', ev.target.value)} />
                <SelectField label='Ville' placeholder='Toutes' options={CITIES} value={form.targetCity} onChange={(ev) => set('targetCity', ev.target.value)} />
            </div>
            <Button type='submit' loading={saving}>Programmer la campagne</Button>
        </form>
    )
}

function Campaigns() {
    const { establishment: e, href } = useEstablishment()
    const premium = !!e.plan.features.sponsoredPlacement
    const { data, reload } = useApi<{ data: Campaign[] }>(`/establishments/${e.id}/campaigns`)
    const [creating, setCreating] = useState(false)

    const update = async (campaign: Campaign, body: Record<string, string>) => {
        try {
            await api(`/campaigns/${campaign.id}`, { method: 'PATCH', body })
            await reload()
        } catch (err) {
            toast.error((err as Error).message)
        }
    }

    return (
        <Panel
            title='Campagnes sponsorisées'
            description='Vos offres en tête des recherches ciblées, avec la mention « Sponsorisé ». Aucun nombre de candidatures n’est garanti.'
            actions={premium && <Button onClick={() => setCreating(true)}><Icon icon='tabler:plus' /> Nouvelle campagne</Button>}>
            {!premium && (
                <div className='mb-4 flex flex-col gap-3'>
                    <FormAlert tone='info'>Les campagnes sont incluses dans la formule Premium. Les campagnes existantes ne sont plus diffusées sans Premium.</FormAlert>
                    <ButtonLink href={href('formule')} className='w-fit'>Découvrir Premium</ButtonLink>
                </div>
            )}
            {!data ? (
                <div className='h-32 rounded-xl bg-offwhite animate-pulse' />
            ) : data.data.length === 0 ? (
                premium && <EmptyState icon='tabler:speakerphone' title='Aucune campagne'>Programmez une campagne avant une rentrée ou pendant les inscriptions.</EmptyState>
            ) : (
                <ul className='flex flex-col gap-3'>
                    {data.data.map((c) => (
                        <li key={c.id} className='flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-gray-100 p-4'>
                            <div className='flex min-w-0 flex-1 flex-col gap-1'>
                                <div className='flex flex-wrap items-center gap-2'>
                                    <Badge tone={c.isRunning ? 'success' : c.status === 'paused' ? 'warning' : 'neutral'}>{c.isRunning ? 'En diffusion' : c.statusLabel}</Badge>
                                    <span className='text-sm text-ink/60'>{dateFr(c.startsOn)} → {dateFr(c.endsOn)}</span>
                                </div>
                                <p className='font-semibold text-secondary'>{c.title}</p>
                                <p className='text-sm text-ink/60'>{[c.offer.title, c.targetCategory, c.targetDomain, c.targetCity].filter(Boolean).join(' · ')}</p>
                            </div>
                            <div className='flex gap-2'>
                                {c.status === 'active' && <Button size='sm' variant='secondary' onClick={() => update(c, { status: 'paused' })}>Mettre en pause</Button>}
                                {c.status === 'paused' && premium && <Button size='sm' onClick={() => update(c, { status: 'active' })}>Reprendre</Button>}
                                {c.status !== 'ended' && <Button size='sm' variant='ghost' onClick={() => update(c, { status: 'ended' })}>Terminer</Button>}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <Dialog open={creating} onClose={() => setCreating(false)} title='Nouvelle campagne' className='sm:max-w-2xl'>
                <CampaignForm onDone={() => { setCreating(false); reload() }} />
            </Dialog>
        </Panel>
    )
}

export default function CampaignsPage() {
    return (
        <EstablishmentSpace title='Campagnes'>
            <Campaigns />
        </EstablishmentSpace>
    )
}
