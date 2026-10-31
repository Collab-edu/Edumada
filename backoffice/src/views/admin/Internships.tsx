'use client'
import { useState, type FormEvent } from 'react'
import { CButton, CCol, CForm, CFormInput, CFormSelect, CFormTextarea, CModal, CModalBody, CModalHeader, CModalTitle, CRow, CTable, CTableBody, CTableDataCell, CTableHead, CTableHeaderCell, CTableRow } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus } from '@coreui/icons'
import { useToast } from '@/context/ToastContext'
import { api, errorMessage, fieldError, isGeneralError, SITE_URL } from '@/lib/api'
import { useApi } from '@/lib/useApi'
import type { Domain, ManagedEstablishment, ManagedOffer, Paginated, ReferenceData } from '@/lib/types'
import { EmptyState, ErrorAlert, Loading, PageCard, StatusBadge } from '@/components/ui'
import PageBanner from '@/components/PageBanner'

const initial = (offer: ManagedOffer | null) => ({
    establishment: offer?.schoolId ?? '',
    title: offer?.title ?? '',
    domain: offer?.domain ?? '',
    months: offer?.durationYears ? String(Math.round(offer.durationYears * 12)) : '',
    modality: offer?.modality ?? 'Présentiel',
    registration: offer?.registration ?? 'Ouvertes',
    startDate: offer?.startDate ?? '',
    description: offer?.details.description ?? '',
})

function InternshipForm({ offer, onDone }: { offer: ManagedOffer | null; onDone: () => void }) {
    const toast = useToast()
    const [form, setForm] = useState(() => initial(offer))
    const [q, setQ] = useState('')
    const [error, setError] = useState<unknown>(null)
    const [saving, setSaving] = useState(false)
    const { data: establishments } = useApi<Paginated<ManagedEstablishment>>(offer ? null : '/admin/establishments', { status: 'published', q })
    const { data: domains } = useApi<{ data: Domain[] }>('/domains')
    const { data: reference } = useApi<{ data: ReferenceData }>('/reference')
    const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }))
    const err = (field: string) => fieldError(error, field)

    const save = async (status: 'draft' | 'published') => {
        setSaving(true)
        setError(null)
        const body = {
            kind: 'stage',
            title: form.title,
            domain: form.domain || null,
            durationYears: form.months ? Number(form.months) / 12 : null,
            modality: form.modality,
            registration: form.registration,
            startDate: form.startDate || null,
            admission: offer?.admission ?? { level: 'Aucun', bacSeries: [], selection: 'Sur dossier' },
            details: { description: form.description || null },
            status,
        }
        try {
            await api(offer ? `/offers/${offer.id}` : `/establishments/${form.establishment}/offers`, { method: offer ? 'PATCH' : 'POST', body })
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
                {offer ? (
                    <CCol md={12}>
                        <CFormInput label='Établissement' value={offer.school} disabled />
                    </CCol>
                ) : (
                    <>
                        <CCol md={6}>
                            <CFormInput label='Chercher un établissement' placeholder='Nom ou ville' value={q} onChange={(e) => setQ(e.target.value)} />
                        </CCol>
                        <CCol md={6}>
                            <CFormSelect label='Établissement' value={form.establishment} onChange={(e) => set('establishment', e.target.value)} required>
                                <option value=''>Choisir…</option>
                                {(establishments?.data ?? []).map((e) => (
                                    <option key={e.id} value={e.id}>
                                        {e.name}
                                    </option>
                                ))}
                            </CFormSelect>
                        </CCol>
                    </>
                )}
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
                    <CFormInput label='Durée (mois)' inputMode='numeric' value={form.months} onChange={(e) => set('months', e.target.value)} invalid={!!err('durationYears')} feedbackInvalid={err('durationYears')} />
                </CCol>
                <CCol md={4}>
                    <CFormSelect label='Modalité' value={form.modality} onChange={(e) => set('modality', e.target.value)}>
                        {(reference?.data.modalities ?? [form.modality]).map((m) => (
                            <option key={m}>{m}</option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol md={4}>
                    <CFormSelect label='Candidatures' value={form.registration} onChange={(e) => set('registration', e.target.value)}>
                        <option>Ouvertes</option>
                        <option>À venir</option>
                        <option>Fermées</option>
                    </CFormSelect>
                </CCol>
                <CCol md={4}>
                    <CFormInput label='Début du stage' type='date' value={form.startDate} onChange={(e) => set('startDate', e.target.value)} invalid={!!err('startDate')} feedbackInvalid={err('startDate')} />
                </CCol>
                <CCol md={12}>
                    <CFormTextarea label='Description' rows={5} maxLength={5000} value={form.description} onChange={(e) => set('description', e.target.value)} />
                </CCol>
                <CCol md={12} className='d-flex flex-wrap justify-content-end gap-2'>
                    <CButton color='secondary' variant='outline' disabled={saving || !form.title.trim() || (!offer && !form.establishment)} onClick={() => save('draft')}>
                        Enregistrer en brouillon
                    </CButton>
                    <CButton type='submit' color='primary' disabled={saving || !form.title.trim() || (!offer && !form.establishment)}>
                        Publier
                    </CButton>
                </CCol>
            </CRow>
        </CForm>
    )
}

/** Offres de stage : seule l'administration Edumada les publie, au nom d'un établissement. */
export default function Internships() {
    const toast = useToast()
    const { data, reload } = useApi<{ data: ManagedOffer[] }>('/admin/stages')
    const [editing, setEditing] = useState<ManagedOffer | 'new' | null>(null)

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
                description='Les stages sont publiés uniquement par Edumada. Les candidats contactent l’établissement choisi pour chaque offre.'
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
                            {data.data.map((o) => (
                                <CTableRow key={o.id}>
                                    <CTableDataCell>
                                        <strong>{o.title}</strong>
                                        <div className='small text-body-secondary'>
                                            {o.school} · {o.city}
                                        </div>
                                    </CTableDataCell>
                                    <CTableDataCell>
                                        <StatusBadge status={o.status}>{o.statusLabel}</StatusBadge>
                                    </CTableDataCell>
                                    <CTableDataCell className='text-end text-nowrap'>
                                        {o.status === 'published' && (
                                            <CButton size='sm' color='secondary' variant='ghost' href={`${SITE_URL}/etablissements/${o.schoolId}/${o.urlSlug}/`} target='_blank' rel='noopener noreferrer'>
                                                Voir
                                            </CButton>
                                        )}
                                        <CButton size='sm' color='secondary' variant='ghost' onClick={() => setEditing(o)}>
                                            Modifier
                                        </CButton>
                                        {o.status === 'published' && (
                                            <CButton size='sm' color='secondary' variant='ghost' onClick={() => run(() => api(`/offers/${o.id}`, { method: 'PATCH', body: { status: 'archived' } }), 'Offre retirée du site')}>
                                                Retirer
                                            </CButton>
                                        )}
                                        <CButton
                                            size='sm'
                                            color='danger'
                                            variant='ghost'
                                            onClick={() => window.confirm(`Supprimer « ${o.title} » ?`) && run(() => api(`/offers/${o.id}`, { method: 'DELETE' }), 'Offre supprimée')}
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
                            offer={editing === 'new' ? null : editing}
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
