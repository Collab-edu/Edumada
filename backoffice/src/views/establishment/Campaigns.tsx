'use client'
import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import {
    CAlert,
    CButton,
    CCol,
    CForm,
    CFormInput,
    CFormSelect,
    CFormTextarea,
    CModal,
    CModalBody,
    CModalHeader,
    CModalTitle,
    CRow,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus } from '@coreui/icons'
import { useCurrentEstablishment } from '@/context/EstablishmentContext'
import { useToast } from '@/context/ToastContext'
import { api, errorMessage, fieldError, isGeneralError } from '@/lib/api'
import { useApi } from '@/lib/useApi'
import { CITIES } from '@/lib/labels'
import type { Campaign, Category, Domain } from '@/lib/types'
import { ErrorAlert, ImageUpload, Loading, PageCard, StatusBadge } from '@/components/ui'
import PageBanner from '@/components/PageBanner'

const today = () => new Date().toISOString().slice(0, 10)
const inDays = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10)

function CampaignForm({ onDone }: { onDone: () => void }) {
    const { current: e } = useCurrentEstablishment()
    const toast = useToast()
    const { data: categories } = useApi<{ data: Category[] }>('/categories')
    const { data: domains } = useApi<{ data: Domain[] }>('/domains')
    const published = (e.offers ?? []).filter((o) => o.status === 'published')
    const [form, setForm] = useState({
        offer: published[0]?.id ?? '',
        title: '',
        description: '',
        image: '',
        callToAction: 'Postuler',
        startsOn: today(),
        endsOn: inDays(30),
        targetCategory: '',
        targetDomain: '',
        targetCity: '',
    })
    const [error, setError] = useState<unknown>(null)
    const set = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }))
    const err = (f: string) => fieldError(error, f)

    if (published.length === 0) return <CAlert color='info'>Publiez d&apos;abord une offre : une campagne met en avant une offre publiée.</CAlert>

    const submit = async (ev: FormEvent) => {
        ev.preventDefault()
        setError(null)
        try {
            await api(`/establishments/${e.id}/campaigns`, {
                method: 'POST',
                body: {
                    ...form,
                    image: form.image || null,
                    targetCategory: form.targetCategory || null,
                    targetDomain: form.targetDomain || null,
                    targetCity: form.targetCity || null,
                },
            })
            toast.success('Campagne programmée')
            onDone()
        } catch (ex) {
            setError(ex)
        }
    }

    return (
        <CForm onSubmit={submit}>
            {isGeneralError(error) && <ErrorAlert error={error} />}
            <CRow className='g-3'>
                <CCol md={12}>
                    <CFormSelect label='Offre à promouvoir' value={form.offer} onChange={(ev) => set('offer', ev.target.value)}>
                        {published.map((o) => (
                            <option key={o.id} value={o.id}>
                                {o.title}
                            </option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol md={12}>
                    <CFormInput
                        label='Titre de la campagne'
                        placeholder='Ex. : Inscriptions ouvertes pour la rentrée'
                        value={form.title}
                        onChange={(ev) => set('title', ev.target.value)}
                        invalid={!!err('title')}
                        feedbackInvalid={err('title')}
                    />
                </CCol>
                <CCol md={12}>
                    <CFormTextarea label='Accroche' rows={2} value={form.description} onChange={(ev) => set('description', ev.target.value)} />
                </CCol>
                <CCol md={6}>
                    <CFormInput label="Bouton d'action" value={form.callToAction} onChange={(ev) => set('callToAction', ev.target.value)} />
                </CCol>
                <CCol xs={6} md={3}>
                    <CFormInput
                        label='Début'
                        type='date'
                        min={today()}
                        value={form.startsOn}
                        onChange={(ev) => set('startsOn', ev.target.value)}
                        invalid={!!err('startsOn')}
                        feedbackInvalid={err('startsOn')}
                    />
                </CCol>
                <CCol xs={6} md={3}>
                    <CFormInput
                        label='Fin'
                        type='date'
                        value={form.endsOn}
                        onChange={(ev) => set('endsOn', ev.target.value)}
                        invalid={!!err('endsOn')}
                        feedbackInvalid={err('endsOn')}
                    />
                </CCol>
                <CCol md={12}>
                    <ImageUpload label='Visuel (facultatif)' value={form.image} onChange={(v: string) => set('image', v)} />
                </CCol>
                <CCol md={12} className='fw-semibold'>
                    Ciblage (facultatif) : la campagne s&apos;affiche dans ces recherches
                </CCol>
                <CCol md={4}>
                    <CFormSelect label='Catégorie' value={form.targetCategory} onChange={(ev) => set('targetCategory', ev.target.value)}>
                        <option value=''>Toutes</option>
                        {(categories?.data ?? []).map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.shortLabel}
                            </option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol md={4}>
                    <CFormSelect label='Domaine' value={form.targetDomain} onChange={(ev) => set('targetDomain', ev.target.value)}>
                        <option value=''>Tous</option>
                        {(domains?.data ?? []).map((d) => (
                            <option key={d.id}>{d.name}</option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol md={4}>
                    <CFormSelect label='Ville' value={form.targetCity} onChange={(ev) => set('targetCity', ev.target.value)}>
                        <option value=''>Toutes</option>
                        {CITIES.map((c) => (
                            <option key={c}>{c}</option>
                        ))}
                    </CFormSelect>
                </CCol>
                <CCol md={12} className='text-end'>
                    <CButton type='submit' color='primary'>
                        Programmer la campagne
                    </CButton>
                </CCol>
            </CRow>
        </CForm>
    )
}

export default function Campaigns() {
    const { current: e } = useCurrentEstablishment()
    const toast = useToast()
    const premium = !!e.plan.features.sponsoredPlacement
    const { data, reload } = useApi<{ data: Campaign[] }>(`/establishments/${e.id}/campaigns`)
    const [creating, setCreating] = useState(false)

    const update = async (c: Campaign, body: { status: Campaign['status'] }) => {
        try {
            await api(`/campaigns/${c.id}`, { method: 'PATCH', body })
            reload()
        } catch (err) {
            toast.error(errorMessage(err))
        }
    }

    return (
        <>
            <PageBanner
                description="Vos offres en tête des recherches ciblées, toujours signalées « Sponsorisé ». Aucun nombre de candidatures n'est garanti."
                actions={
                    premium && (
                        <CButton color='light' onClick={() => setCreating(true)}>
                            <CIcon icon={cilPlus} className='me-2' />
                            Nouvelle campagne
                        </CButton>
                    )
                }
            />
            <PageCard title='Campagnes sponsorisées'>
                {!premium && (
                    <CAlert color='info'>
                        Les campagnes sont incluses dans la formule Premium. <Link href='/formule/'>Découvrir Premium</Link>
                    </CAlert>
                )}
                {!data ? (
                    <Loading />
                ) : data.data.length === 0 ? (
                    <p className='text-body-secondary mb-0'>Aucune campagne. Programmez-en une avant une rentrée ou pendant les inscriptions.</p>
                ) : (
                    <CTable align='middle' hover responsive className='mb-0'>
                        <CTableHead>
                            <CTableRow>
                                <CTableHeaderCell>Campagne</CTableHeaderCell>
                                <CTableHeaderCell>Période</CTableHeaderCell>
                                <CTableHeaderCell>Ciblage</CTableHeaderCell>
                                <CTableHeaderCell>Statut</CTableHeaderCell>
                                <CTableHeaderCell className='text-end'>Actions</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {data.data.map((c) => (
                                <CTableRow key={c.id}>
                                    <CTableDataCell>
                                        <strong>{c.title}</strong>
                                        <div className='small text-body-secondary'>{c.offer.title}</div>
                                    </CTableDataCell>
                                    <CTableDataCell className='text-nowrap'>
                                        {c.startsOn} → {c.endsOn}
                                    </CTableDataCell>
                                    <CTableDataCell>{[c.targetCategory, c.targetDomain, c.targetCity].filter(Boolean).join(' · ') || 'Toutes les recherches'}</CTableDataCell>
                                    <CTableDataCell>
                                        <StatusBadge status={c.isRunning ? 'active' : c.status}>{c.isRunning ? 'En diffusion' : c.statusLabel}</StatusBadge>
                                    </CTableDataCell>
                                    <CTableDataCell className='text-end text-nowrap'>
                                        {c.status === 'active' && (
                                            <CButton size='sm' color='secondary' variant='outline' className='me-2' onClick={() => update(c, { status: 'paused' })}>
                                                Pause
                                            </CButton>
                                        )}
                                        {c.status === 'paused' && premium && (
                                            <CButton size='sm' color='primary' className='me-2' onClick={() => update(c, { status: 'active' })}>
                                                Reprendre
                                            </CButton>
                                        )}
                                        {c.status !== 'ended' && (
                                            <CButton size='sm' color='danger' variant='ghost' onClick={() => update(c, { status: 'ended' })}>
                                                Terminer
                                            </CButton>
                                        )}
                                    </CTableDataCell>
                                </CTableRow>
                            ))}
                        </CTableBody>
                    </CTable>
                )}
            </PageCard>

            <CModal size='lg' visible={creating} onClose={() => setCreating(false)}>
                <CModalHeader>
                    <CModalTitle>Nouvelle campagne</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CampaignForm
                        onDone={() => {
                            setCreating(false)
                            reload()
                        }}
                    />
                </CModalBody>
            </CModal>
        </>
    )
}
