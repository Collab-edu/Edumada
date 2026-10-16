'use client'
import { useState, type FormEvent } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import toast from 'react-hot-toast'
import { Button, FormAlert, ListField, SelectField, TextArea, TextField } from '@/components/ui/form'
import { api, ApiError } from '@/lib/api'
import type { CategoryType } from '@/features/categories/types'
import { useApi } from '../useApi'
import { Panel } from '../components/SpaceShell'
import ImageUpload from '../components/ImageUpload'
import type { ManagedEstablishment } from '../types'

const CITIES = ['Antananarivo', 'Antsirabe', 'Fianarantsoa', 'Toamasina', 'Mahajanga', 'Toliara', 'Antsiranana']
const SOCIALS = [
    { key: 'facebook', label: 'Facebook' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'youtube', label: 'YouTube' },
] as const

type FormState = {
    name: string
    type: string
    category: string
    subCategory: string
    city: string
    address: string
    phone: string
    email: string
    website: string
    description: string
    socialLinks: Record<string, string>
    infrastructures: string[]
    accreditation: string
    lat: string
    lng: string
    admissionDocuments: string[]
    imageSrc: string
    photos: string[]
}

function initialState(e?: ManagedEstablishment): FormState {
    return {
        name: e?.name ?? '',
        type: e?.type ?? 'Privé',
        category: e?.category ?? '',
        subCategory: e?.subCategory ?? '',
        city: e?.city ?? '',
        address: e?.address ?? '',
        phone: e?.phone ?? '',
        email: e?.email ?? '',
        website: e?.website ?? '',
        description: e?.description ?? '',
        socialLinks: { ...(e?.socialLinks ?? {}) } as Record<string, string>,
        infrastructures: e?.infrastructures ?? [],
        accreditation: e?.accreditation ?? '',
        lat: e?.coordinates ? String(e.coordinates.lat) : '',
        lng: e?.coordinates ? String(e.coordinates.lng) : '',
        admissionDocuments: e?.admissionDocuments ?? [],
        imageSrc: e?.imageSrc ?? '',
        photos: e?.photos ?? [],
    }
}

/**
 * Fiche établissement, au format `SchoolType` du site. Création : la fiche part en validation.
 * Le statut, le badge « vérifié » et l'accréditation vérifiée restent décidés par Edumada.
 */
export function EstablishmentForm({ establishment, onSaved }: { establishment?: ManagedEstablishment; onSaved: (saved: ManagedEstablishment) => void }) {
    const { data: categories } = useApi<{ data: CategoryType[] }>('/categories')
    const [form, setForm] = useState<FormState>(() => initialState(establishment))
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<ApiError | null>(null)
    const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }))
    const category = categories?.data.find((c) => c.id === form.category)

    const locate = () => {
        if (!navigator.geolocation) return toast.error('La géolocalisation n’est pas disponible sur cet appareil.')
        navigator.geolocation.getCurrentPosition(
            (pos) => setForm((f) => ({ ...f, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) })),
            () => toast.error('Position introuvable. Saisissez-la à la main ou autorisez la localisation.')
        )
    }

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        const body = {
            name: form.name,
            type: form.type,
            category: form.category,
            subCategory: form.subCategory || null,
            city: form.city,
            address: form.address || null,
            phone: form.phone || null,
            email: form.email || null,
            website: form.website || null,
            description: form.description || null,
            socialLinks: Object.fromEntries(Object.entries(form.socialLinks).filter(([, url]) => url)),
            infrastructures: form.infrastructures,
            accreditation: form.accreditation || null,
            coordinates: form.lat && form.lng ? { lat: Number(form.lat), lng: Number(form.lng) } : null,
            admissionDocuments: form.admissionDocuments,
            imageSrc: form.imageSrc || null,
            photos: form.photos,
        }
        try {
            const res = establishment
                ? await api<{ data: ManagedEstablishment }>(`/establishments/${establishment.id}`, { method: 'PATCH', body })
                : await api<{ data: ManagedEstablishment }>('/establishments', { method: 'POST', body })
            toast.success(establishment ? 'Fiche enregistrée' : 'Fiche créée : elle sera publiée après validation par Edumada.')
            onSaved(res.data)
        } catch (err) {
            setError(err as ApiError)
            toast.error('Vérifiez les champs signalés.')
        } finally {
            setSaving(false)
        }
    }

    const err = (field: string) => error?.field(field)

    return (
        <form onSubmit={submit} className='flex flex-col gap-6' noValidate>
            {error && Object.keys(error.errors).length === 0 && <FormAlert>{error.message}</FormAlert>}

            <Panel title='Identité' description='Les informations principales affichées en haut de votre fiche.'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <TextField label="Nom de l'établissement" required className='sm:col-span-2' value={form.name} onChange={(e) => set('name', e.target.value)} error={err('name')} />
                    <SelectField
                        label='Catégorie'
                        required
                        placeholder='Choisir…'
                        options={(categories?.data ?? []).map((c) => ({ value: c.id, label: c.label }))}
                        value={form.category}
                        onChange={(e) => setForm((f) => ({ ...f, category: e.target.value, subCategory: '' }))}
                        error={err('category')}
                    />
                    <SelectField
                        label='Type précis'
                        placeholder={category ? 'Choisir…' : "Choisissez d'abord la catégorie"}
                        options={category?.subCategories ?? []}
                        value={form.subCategory}
                        disabled={!category}
                        onChange={(e) => set('subCategory', e.target.value)}
                        error={err('subCategory')}
                    />
                    <SelectField label='Statut' required options={['Privé', 'Public']} value={form.type} onChange={(e) => set('type', e.target.value)} error={err('type')} />
                    <TextField label='Ville' required list='edumada-cities' value={form.city} onChange={(e) => set('city', e.target.value)} error={err('city')} />
                    <datalist id='edumada-cities'>{CITIES.map((c) => <option key={c} value={c} />)}</datalist>
                    <TextArea label='Présentation' className='sm:col-span-2' rows={5} maxLength={5000} hint='Ce qui distingue votre établissement, en quelques phrases.' value={form.description} onChange={(e) => set('description', e.target.value)} error={err('description')} />
                </div>
            </Panel>

            <Panel title='Coordonnées' description="Les étudiants vous contactent directement avec ces informations.">
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <TextField label='Adresse' className='sm:col-span-2' value={form.address} onChange={(e) => set('address', e.target.value)} error={err('address')} />
                    <TextField label='Téléphone' type='tel' value={form.phone} onChange={(e) => set('phone', e.target.value)} error={err('phone')} />
                    <TextField label='E-mail public' type='email' hint='Reçoit aussi les demandes envoyées via Edumada.' value={form.email} onChange={(e) => set('email', e.target.value)} error={err('email')} />
                    <TextField label='Site web' type='url' placeholder='https://' className='sm:col-span-2' value={form.website} onChange={(e) => set('website', e.target.value)} error={err('website')} />
                    {SOCIALS.map((s) => (
                        <TextField
                            key={s.key}
                            label={s.label}
                            type='url'
                            placeholder='https://'
                            value={form.socialLinks[s.key] ?? ''}
                            onChange={(e) => set('socialLinks', { ...form.socialLinks, [s.key]: e.target.value })}
                            error={err(`socialLinks.${s.key}`)}
                        />
                    ))}
                    <div className='sm:col-span-2 grid grid-cols-2 gap-4 items-end'>
                        <TextField label='Latitude' inputMode='decimal' placeholder='-18.8792' value={form.lat} onChange={(e) => set('lat', e.target.value)} error={err('coordinates.lat')} />
                        <TextField label='Longitude' inputMode='decimal' placeholder='47.5079' value={form.lng} onChange={(e) => set('lng', e.target.value)} error={err('coordinates.lng')} />
                        <Button type='button' variant='secondary' onClick={locate} className='col-span-2 sm:w-fit'>
                            <Icon icon='tabler:current-location' /> Utiliser ma position actuelle
                        </Button>
                    </div>
                </div>
            </Panel>

            <Panel title='Photos' description='Une couverture et quelques photos des locaux rassurent les familles.'>
                <div className='flex flex-col gap-5'>
                    <ImageUpload label='Photo de couverture' value={form.imageSrc} onChange={(v) => set('imageSrc', v as string)} />
                    <ImageUpload label='Photos des locaux' hint='Jusqu’à 8 photos.' value={form.photos} onChange={(v) => set('photos', v as string[])} />
                </div>
            </Panel>

            <Panel title='Admission et infrastructures'>
                <div className='grid grid-cols-1 gap-5'>
                    <ListField label='Pièces à fournir pour une inscription' placeholder='Ex. : copie du dernier diplôme' value={form.admissionDocuments} onChange={(v) => set('admissionDocuments', v)} />
                    <ListField label='Infrastructures' placeholder='Ex. : bibliothèque, cantine, salle informatique' value={form.infrastructures} onChange={(v) => set('infrastructures', v)} />
                    <TextField
                        label='Reconnaissance / accréditation'
                        hint="Affichée seulement après vérification par Edumada auprès des autorités."
                        value={form.accreditation}
                        onChange={(e) => set('accreditation', e.target.value)}
                        error={err('accreditation')}
                    />
                </div>
            </Panel>

            <div className='sticky bottom-0 z-20 -mx-4 flex justify-end gap-3 border-t border-gray-100 bg-white/95 px-4 py-3 backdrop-blur-sm sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0'>
                <Button type='submit' loading={saving} className='w-full sm:w-auto'>
                    <Icon icon='tabler:device-floppy' /> {establishment ? 'Enregistrer la fiche' : 'Créer la fiche'}
                </Button>
            </div>
        </form>
    )
}

export default EstablishmentForm
