'use client'
import { useState, type FormEvent } from 'react'
import { CButton, CCol, CForm, CFormInput, CFormSelect, CFormTextarea, CModal, CModalBody, CModalHeader, CModalTitle, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus } from '@coreui/icons'
import { useToast } from '@/context/ToastContext'
import { api, assetUrl, errorMessage, fieldError, isGeneralError, SITE_URL } from '@/lib/api'
import { useApi } from '@/lib/useApi'
import type { Domain, Internship, ReferenceData } from '@/lib/types'
import PlaceInput from '@/components/PlaceInput'
import { EmptyState, ErrorAlert, ImageUpload, Loading, PageCard, StatusBadge } from '@/components/ui'
import PageBanner from '@/components/PageBanner'

const initial = (i: Internship | null) => ({
    companyName: i?.companyName ?? '',
    companyLogo: i?.companyLogo ?? '',
    title: i?.title ?? '',
    domain: i?.domain ?? '',
    city: i?.city ?? '',
    months: i?.durationMonths ? String(i.durationMonths) : '',
    modality: i?.modality ?? 'Présentiel',
    registration: i?.registration ?? 'Ouvertes',
    startDate: i?.startDate ?? '',
    contact: i?.contact ?? '',
    description: i?.description ?? '',
})

function InternshipForm({ internship, onDone }: { internship: Internship | null; onDone: () => void }) {
    const toast = useToast()
    const [form, setForm] = useState(() => initial(internship))
    const [error, setError] = useState<unknown>(null)
    const [saving, setSaving] = useState(false)
    const { data: domains } = useApi<{ data: Domain[] }>('/domains')
    const { data: reference } = useApi<{ data: ReferenceData }>('/reference')
    const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }))
    const err = (field: string) => fieldError(error, field)

    const save = async (status: Internship['status']) => {
        setSaving(true)
        setError(null)
        const body = {
            companyName: form.companyName,
            companyLogo: form.companyLogo || null,
            title: form.title,
            domain: form.domain || null,
            city: form.city,
            durationMonths: form.months ? Number(form.months) : null,
            modality: form.modality,
            registration: form.registration,
            startDate: form.startDate || null,
            contact: form.contact,
            description: form.description || null,
            status,
        }
        try {
            await api(internship ? `/admin/internships/${internship.id}` : '/admin/internships', { method: internship ? 'PATCH' : 'POST', body })
            toast.success(status === 'published' ? 'Offre de stage publiée' : 'Brouillon enregistré')
            onDone()
        } catch (ex) {
            setError(ex)
            toast.error('Vérifiez les champs signalés.')
        } finally {
            setSaving(false)
        }
    }
    const submit = (e: FormEvent) => {
        e.preventDefault()
        save('published')
    }

    return (
        <CForm onSubmit={submit} noValidate>
            {isGeneralError(error) && <ErrorAlert error={error} />}
            <CRow className='g-3'>
                <CCol md={12}>
                    <CFormInput label='Nom de la société' value={form.companyName} onChange={(e) => set('companyName', e.target.value)} invalid={!!err('companyName')} feedbackInvalid={err('companyName')} required />
                </CCol>
                <CCol md={12}>
                    <ImageUpload media='logo' label='Logo de la société' value={form.companyLogo} onChange={(v: string) => set('companyLogo', v)} />
                </CCol>
                <CCol md={12}>
                    <CFormInput label='Intitulé du stage' value={form.title} onChange={(e) => set('title', e.target.value)} invalid={!!err('title')} feedbackInvalid={err('title')} required />
                </CCol>
                <CCol md={6}>
                    <CFormSelect label='Domaine' value={form.domain} onChange={(e) => set('domain', e.target.value)}>
                        <option value=''>Non précisé</option>
                        {(domains?.data ?? []).map((d) => (
                            <option key={d.id}>{d.name}</option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol md={6}>
                    <PlaceInput id='bo-internship-city' label='Ville' value={form.city} error={err('city')} onChange={(city) => set('city', city)} />
                </CCol>
                <CCol md={6}>
                    <CFormInput label='Durée (mois)' inputMode='numeric' value={form.months} onChange={(e) => set('months', e.target.value)} invalid={!!err('durationMonths')} feedbackInvalid={err('durationMonths')} />
                </CCol>
                <CCol md={6}>
                    <CFormInput label='Début du stage' type='date' value={form.startDate} onChange={(e) => set('startDate', e.target.value)} invalid={!!err('startDate')} feedbackInvalid={err('startDate')} />
                </CCol>
                <CCol md={6}>
                    <CFormSelect label='Modalité' value={form.modality} onChange={(e) => set('modality', e.target.value)}>
                        {(reference?.data.modalities ?? [form.modality]).map((m) => (
                            <option key={m}>{m}</option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol md={6}>
                    <CFormSelect label='Candidatures' value={form.registration} onChange={(e) => set('registration', e.target.value)}>
                        <option>Ouvertes</option>
                        <option>À venir</option>
                        <option>Fermées</option>
                    </CFormSelect>
                </CCol>
                <CCol md={12}>
                    <CFormInput
                        label='Contact pour postuler'
                        text='E-mail, téléphone ou lien : affiché sur le bouton « Postuler ».'
                        value={form.contact}
                        onChange={(e) => set('contact', e.target.value)}
                        invalid={!!err('contact')}
                        feedbackInvalid={err('contact')}
                        required
                    />
                </CCol>
                <CCol md={12}>
                    <CFormTextarea label='Description' rows={5} maxLength={5000} value={form.description} onChange={(e) => set('description', e.target.value)} />
                </CCol>
                <CCol md={12} className='d-flex flex-wrap justify-content-end gap-2'>
                    <CButton color='secondary' variant='outline' disabled={saving} onClick={() => save('draft')}>
                        Enregistrer en brouillon
                    </CButton>
                    <CButton type='submit' color='primary' disabled={saving}>
                        Publier
                    </CButton>
                </CCol>
            </CRow>
        </CForm>
    )
}

/** Offres de stage : seule l'administration Edumada les publie, pour le compte de sociétés. */
export default function Internships() {
    const toast = useToast()
    const { data, reload } = useApi<{ data: Internship[] }>('/admin/internships')
    const [editing, setEditing] = useState<Internship | 'new' | null>(null)

    const run = async (action: () => Promise<unknown>, message: string) => {
        try {
            await action()
            toast.success(message)
            reload()
        } catch (err) {
            toast.error(errorMessage(err))
        }
    }

    return (
        <>
            <PageBanner
                description='Les stages sont publiés uniquement par Edumada. Les candidats postulent avec le contact indiqué sur chaque offre.'
                actions={
                    <CButton color='light' onClick={() => setEditing('new')}>
                        <CIcon icon={cilPlus} className='me-2' />
                        Nouvelle offre de stage
                    </CButton>
                }
            />
            <PageCard title='Offres de stage'>
                {!data ? (
                    <Loading />
                ) : data.data.length === 0 ? (
                    <EmptyState title='Aucune offre de stage'>Publiez la première : elle apparaîtra sur la page « Offres de stage » du site.</EmptyState>
                ) : (
                    <CTable align='middle' hover responsive className='mb-0'>
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell>Stage</CTableHeaderCell>
                                <CTableHeaderCell>Statut</CTableHeaderCell>
                                <CTableHeaderCell className='text-end'>Actions</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {data.data.map((i) => (
                                <CTableRow key={i.id}>
                                    <CTableDataCell>
                                        <div className='d-flex align-items-center gap-3'>
                                            {i.companyLogo && (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={assetUrl(i.companyLogo)} alt='' width={40} height={40} className='rounded bg-white' style={{ objectFit: 'contain' }} />
                                            )}
                                            <div>
                                                <strong>{i.title}</strong>
                                                <div className='small text-body-secondary'>
                                                    {i.companyName} · {i.city}
                                                </div>
                                            </div>
                                        </div>
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        <StatusBadge status={i.status}>{i.statusLabel}</StatusBadge>
                                    </CTableDataCell>
                                    <CTableDataCell className='text-end text-nowrap'>
                                        {i.status === 'published' && (
                                            <CButton size='sm' color='secondary' variant='ghost' href={`${SITE_URL}/stages/voir/?id=${i.id}`} target='_blank' rel='noopener noreferrer'>
                                                Voir
                                            </CButton>
                                        )}
                                        <CButton size='sm' color='secondary' variant='ghost' onClick={() => setEditing(i)}>
                                            Modifier
                                        </CButton>
                                        {i.status === 'published' && (
                                            <CButton size='sm' color='secondary' variant='ghost' onClick={() => run(() => api(`/admin/internships/${i.id}`, { method: 'PATCH', body: { status: 'archived' } }), 'Offre retirée du site')}>
                                                Retirer
                                            </CButton>
                                        )}
                                        <CButton
                                            size='sm'
                                            color='danger'
                                            variant='ghost'
                                            onClick={() => window.confirm(`Supprimer « ${i.title} » ?`) && run(() => api(`/admin/internships/${i.id}`, { method: 'DELETE' }), 'Offre supprimée')}
                                        >
                                            Supprimer
                                        </CButton>
                                    </CTableDataCell>
                                </CTableRow>
                            ))}
                        </CTableBody>
                    </CTable>
                )}
            </PageCard>

            <CModal size='lg' visible={!!editing} onClose={() => setEditing(null)}>
                <CModalHeader>
                    <CModalTitle>{editing === 'new' ? 'Nouvelle offre de stage' : 'Modifier l’offre de stage'}</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    {editing && (
                        <InternshipForm
                            key={editing === 'new' ? 'new' : editing.id}
                            internship={editing === 'new' ? null : editing}
                            onDone={() => {
                                setEditing(null)
                                reload()
                            }}
                        />
                    )}
                </CModalBody>
            </CModal>
        </>
    )
}
