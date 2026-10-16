'use client'
import { useState, type FormEvent } from 'react'
import { CButton, CCol, CForm, CFormInput, CFormSelect, CFormTextarea, CRow, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLocationPin, cilSave } from '@coreui/icons'
import { api, fieldError, isGeneralError } from '@/lib/api'
import { useApi } from '@/lib/useApi'
import { CITIES } from '@/lib/labels'
import type { Category, ManagedEstablishment } from '@/lib/types'
import { useToast } from '@/context/ToastContext'
import { ErrorAlert, ImageUpload, ListInput, PageCard } from '@/components/ui'

const SOCIALS = [
    ['facebook', 'Facebook'],
    ['instagram', 'Instagram'],
    ['linkedin', 'LinkedIn'],
    ['youtube', 'YouTube'],
] as const

const initial = (e?: ManagedEstablishment) => ({
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
})

type FormState = ReturnType<typeof initial>

/**
 * Fiche établissement au format `SchoolType` du site. Le statut de publication, le badge « vérifié »
 * et l'accréditation vérifiée restent décidés par Edumada.
 */
export default function EstablishmentForm({ establishment, onSaved }: { establishment?: ManagedEstablishment; onSaved: (saved: ManagedEstablishment) => void }) {
    const toast = useToast()
    const { data: categories } = useApi<{ data: Category[] }>('/categories')
    const [form, setForm] = useState<FormState>(() => initial(establishment))
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<unknown>(null)
    const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }))
    const category = categories?.data.find((c) => c.id === form.category)
    const err = (field: string) => fieldError(error, field)

    const locate = () =>
        navigator.geolocation?.getCurrentPosition(
            (pos) => setForm((f) => ({ ...f, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) })),
            () => toast.error('Position introuvable : saisissez-la à la main.')
        )

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)
        const { lat, lng, ...rest } = form
        const body = {
            ...rest,
            subCategory: form.subCategory || null,
            address: form.address || null,
            phone: form.phone || null,
            email: form.email || null,
            website: form.website || null,
            description: form.description || null,
            accreditation: form.accreditation || null,
            imageSrc: form.imageSrc || null,
            socialLinks: Object.fromEntries(Object.entries(form.socialLinks).filter(([, url]) => url)),
            coordinates: lat && lng ? { lat: Number(lat), lng: Number(lng) } : null,
        }
        try {
            const res = establishment
                ? await api<{ data: ManagedEstablishment }>(`/establishments/${establishment.id}`, { method: 'PATCH', body })
                : await api<{ data: ManagedEstablishment }>('/establishments', { method: 'POST', body })
            toast.success(establishment ? 'Fiche enregistrée' : 'Fiche créée : elle sera publiée après validation par Edumada.')
            onSaved(res.data)
        } catch (ex) {
            setError(ex)
            toast.error('Vérifiez les champs signalés.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <CForm onSubmit={submit} noValidate>
            {isGeneralError(error) && <ErrorAlert error={error} />}
            <PageCard title='Identité' subtitle='Informations affichées en haut de la fiche publique'>
                <CRow className='g-3'>
                    <CCol md={12}>
                        <CFormInput
                            label="Nom de l'établissement"
                            value={form.name}
                            onChange={(e) => set('name', e.target.value)}
                            invalid={!!err('name')}
                            feedbackInvalid={err('name')}
                            required
                        />
                    </CCol>
                    <CCol md={6}>
                        <CFormSelect
                            label='Catégorie'
                            value={form.category}
                            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value, subCategory: '' }))}
                            invalid={!!err('category')}
                            feedbackInvalid={err('category')}
                        >
                            <option value=''>Choisir…</option>
                            {(categories?.data ?? []).map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.label}
                                </option>
                            ))}
                        </CFormSelect>
                    </CCol>
                    <CCol md={6}>
                        <CFormSelect
                            label='Type précis'
                            value={form.subCategory}
                            disabled={!category}
                            onChange={(e) => set('subCategory', e.target.value)}
                            invalid={!!err('subCategory')}
                            feedbackInvalid={err('subCategory')}
                        >
                            <option value=''>{category ? 'Choisir…' : "Choisissez d'abord la catégorie"}</option>
                            {(category?.subCategories ?? []).map((s) => (
                                <option key={s}>{s}</option>
                            ))}
                        </CFormSelect>
                    </CCol>
                    <CCol md={6}>
                        <CFormSelect label='Statut' value={form.type} onChange={(e) => set('type', e.target.value)}>
                            <option>Privé</option>
                            <option>Public</option>
                        </CFormSelect>
                    </CCol>
                    <CCol md={6}>
                        <CFormInput
                            label='Ville'
                            list='bo-cities'
                            value={form.city}
                            onChange={(e) => set('city', e.target.value)}
                            invalid={!!err('city')}
                            feedbackInvalid={err('city')}
                        />
                        <datalist id='bo-cities'>
                            {CITIES.map((c) => (
                                <option key={c} value={c} />
                            ))}
                        </datalist>
                    </CCol>
                    <CCol md={12}>
                        <CFormTextarea
                            label='Présentation'
                            rows={5}
                            value={form.description}
                            onChange={(e) => set('description', e.target.value)}
                            invalid={!!err('description')}
                            feedbackInvalid={err('description')}
                        />
                    </CCol>
                </CRow>
            </PageCard>

            <PageCard title='Coordonnées' subtitle="L'e-mail public reçoit aussi les demandes envoyées via Edumada">
                <CRow className='g-3'>
                    <CCol md={12}>
                        <CFormInput label='Adresse' value={form.address} onChange={(e) => set('address', e.target.value)} />
                    </CCol>
                    <CCol md={6}>
                        <CFormInput
                            label='Téléphone'
                            type='tel'
                            value={form.phone}
                            onChange={(e) => set('phone', e.target.value)}
                            invalid={!!err('phone')}
                            feedbackInvalid={err('phone')}
                        />
                    </CCol>
                    <CCol md={6}>
                        <CFormInput
                            label='E-mail public'
                            type='email'
                            value={form.email}
                            onChange={(e) => set('email', e.target.value)}
                            invalid={!!err('email')}
                            feedbackInvalid={err('email')}
                        />
                    </CCol>
                    <CCol md={12}>
                        <CFormInput
                            label='Site web'
                            type='url'
                            placeholder='https://'
                            value={form.website}
                            onChange={(e) => set('website', e.target.value)}
                            invalid={!!err('website')}
                            feedbackInvalid={err('website')}
                        />
                    </CCol>
                    {SOCIALS.map(([key, label]) => (
                        <CCol md={6} key={key}>
                            <CFormInput
                                label={label}
                                type='url'
                                placeholder='https://'
                                value={form.socialLinks[key] ?? ''}
                                onChange={(e) => set('socialLinks', { ...form.socialLinks, [key]: e.target.value })}
                                invalid={!!err(`socialLinks.${key}`)}
                                feedbackInvalid={err(`socialLinks.${key}`)}
                            />
                        </CCol>
                    ))}
                    <CCol md={4}>
                        <CFormInput
                            label='Latitude'
                            inputMode='decimal'
                            placeholder='-18.8792'
                            value={form.lat}
                            onChange={(e) => set('lat', e.target.value)}
                            invalid={!!err('coordinates.lat')}
                            feedbackInvalid={err('coordinates.lat')}
                        />
                    </CCol>
                    <CCol md={4}>
                        <CFormInput
                            label='Longitude'
                            inputMode='decimal'
                            placeholder='47.5079'
                            value={form.lng}
                            onChange={(e) => set('lng', e.target.value)}
                            invalid={!!err('coordinates.lng')}
                            feedbackInvalid={err('coordinates.lng')}
                        />
                    </CCol>
                    <CCol md={4} className='d-flex align-items-end'>
                        <CButton color='secondary' variant='outline' onClick={locate} className='w-100'>
                            <CIcon icon={cilLocationPin} className='me-2' />
                            Ma position actuelle
                        </CButton>
                    </CCol>
                </CRow>
            </PageCard>

            <PageCard title='Photos'>
                <ImageUpload label='Photo de couverture' value={form.imageSrc} onChange={(v: string) => set('imageSrc', v)} />
                <ImageUpload label='Photos des locaux (8 au maximum)' value={form.photos} onChange={(v: string[]) => set('photos', v)} />
            </PageCard>

            <PageCard title='Admission et infrastructures'>
                <ListInput label='Pièces à fournir pour une inscription' value={form.admissionDocuments} onChange={(v) => set('admissionDocuments', v)} />
                <ListInput label='Infrastructures' placeholder='Ex. : bibliothèque, cantine…' value={form.infrastructures} onChange={(v) => set('infrastructures', v)} />
                <CFormInput
                    label='Reconnaissance / accréditation'
                    text='Affichée seulement après vérification par Edumada auprès des autorités.'
                    value={form.accreditation}
                    onChange={(e) => set('accreditation', e.target.value)}
                />
            </PageCard>

            <div className='d-flex justify-content-end mb-4'>
                <CButton color='primary' type='submit' disabled={saving}>
                    {saving ? <CSpinner size='sm' className='me-2' /> : <CIcon icon={cilSave} className='me-2' />}
                    {establishment ? 'Enregistrer la fiche' : 'Créer la fiche'}
                </CButton>
            </div>
        </CForm>
    )
}
