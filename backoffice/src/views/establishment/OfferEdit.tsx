'use client'
import { useState, type ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CAlert, CButton, CCol, CForm, CFormCheck, CFormInput, CFormSelect, CFormTextarea, CRow, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBriefcase, cilCalendar, cilClipboard, cilEducation, cilList, cilMoney, cilNotes, cilPlus, cilSend, cilTrash } from '@coreui/icons'
import { useCurrentEstablishment } from '@/context/EstablishmentContext'
import { useToast } from '@/context/ToastContext'
import { api, ApiError } from '@/lib/api'
import { useApi } from '@/lib/useApi'
import type { Category, CategoryFields, Domain, ManagedEstablishment, ManagedOffer, ReferenceData } from '@/lib/types'
import { EmptyState, ImageUpload, ListInput, PageCard } from '@/components/ui'
import PageBanner from '@/components/PageBanner'

const DEFAULT_FIELDS: CategoryFields = { diplomas: true, programme: true, level: true, childAge: true, duration: true, careers: true }
const KIND_LABEL: Record<string, string> = { formation: 'Formation', niveau: 'Niveau scolaire', accueil: 'Accueil (crèche, garderie…)' }
const KNOWN_LANGUAGES = ['Français', 'Malgache', 'Anglais']
const BAC_SERIES = ['A', 'C', 'D', 'Technique']

const str = (v: number | string | null | undefined) => (v === null || v === undefined ? '' : String(v))
const num = (v: string) => (String(v).trim() === '' ? null : Number(String(v).replace(/\s/g, '').replace(',', '.')))

function initialState(offer: ManagedOffer | undefined, e: ManagedEstablishment, kind: string) {
    const d: Partial<ManagedOffer['details']> = offer?.details ?? {}
    return {
        title: offer?.title ?? '',
        kind: offer?.kind ?? kind,
        domain: offer?.domain ?? '',
        diploma: offer?.diploma ?? '',
        durationYears: str(offer?.durationYears),
        ageMin: str(offer?.ageRange?.min),
        ageMax: str(offer?.ageRange?.max),
        fees: str(offer?.fees),
        feesPeriod: offer?.feesPeriod ?? (kind === 'formation' ? 'an' : 'mois'),
        registrationFee: str(offer?.registrationFee),
        registrationStart: offer?.registrationPeriod?.start ?? '',
        registrationEnd: offer?.registrationPeriod?.end ?? '',
        startDate: offer?.startDate ?? '',
        modality: offer?.modality ?? 'Présentiel',
        registration: offer?.registration ?? 'À venir',
        languages: (offer?.languages ?? ['Français']).filter((l) => KNOWN_LANGUAGES.includes(l)),
        otherLanguages: (offer?.languages ?? []).filter((l) => !KNOWN_LANGUAGES.includes(l)).join(', '),
        level: offer?.admission.level ?? 'Aucun',
        bacSeries: offer?.admission.bacSeries ?? [],
        selection: offer?.admission.selection ?? 'Sur dossier',
        housing: offer?.housing ?? 'Non renseigné',
        scholarship: offer?.scholarship ?? 'Non renseigné',
        imageSrc: offer?.imageSrc ?? '',
        description: d.description ?? '',
        objectives: d.objectives ?? [],
        skills: d.skills ?? [],
        subjects: d.subjects ?? [],
        program: d.program ?? [],
        specializations: d.specializations ?? [],
        teachingMethods: d.teachingMethods ?? [],
        evaluation: d.evaluation ?? '',
        prerequisites: d.admission?.prerequisites ?? [],
        specialConditions: d.admission?.specialConditions ?? '',
        minAge: str(d.admission?.minAge),
        applicationFee: str(d.costs?.applicationFee),
        otherFees: (d.costs?.otherFees ?? []).map((f) => ({ label: f.label, amount: str(f.amount) })),
        costsStatus: d.costs?.status ?? 'Confirmés',
        paymentOptions: d.costs?.paymentOptions ?? [],
        scholarshipsInfo: d.costs?.scholarships ?? '',
        discounts: d.costs?.discounts ?? '',
        schedule: d.organization?.schedule ?? '',
        campus: d.organization?.campus ?? (e.address ? `${e.name} — ${e.address}` : ''),
        rhythm: d.organization?.rhythm ?? [],
        jobs: d.careers?.jobs ?? [],
        sectors: d.careers?.sectors ?? [],
        furtherStudies: d.careers?.furtherStudies ?? [],
        internship: d.careers?.internship ?? '',
        partnerships: d.careers?.partnerships ?? [],
        onlineApplication: d.onlineApplication ?? false,
        brochureUrl: d.brochureUrl ?? '',
        academicCalendar: d.academicCalendar ?? [],
    }
}

type State = ReturnType<typeof initialState>
type ListKey = { [K in keyof State]: State[K] extends string[] ? K : never }[keyof State]
type RowKey = 'program' | 'otherFees' | 'academicCalendar'

/** Corps de la requête au format `FormationType` + `details` attendu par l'API. */
function toPayload(s: State, fields: CategoryFields, status?: string) {
    return {
        title: s.title,
        kind: s.kind,
        domain: s.domain || null,
        diploma: fields.diplomas ? s.diploma || null : null,
        durationYears: fields.duration ? num(s.durationYears) : null,
        ageRange: fields.childAge && s.ageMin && s.ageMax ? { min: num(s.ageMin), max: num(s.ageMax) } : null,
        fees: num(s.fees),
        feesPeriod: s.feesPeriod,
        registrationFee: num(s.registrationFee),
        registrationPeriod: s.registrationStart && s.registrationEnd ? { start: s.registrationStart, end: s.registrationEnd } : null,
        startDate: s.startDate || null,
        modality: s.modality,
        registration: s.registration,
        languages: [
            ...s.languages,
            ...s.otherLanguages
                .split(',')
                .map((l) => l.trim())
                .filter(Boolean),
        ],
        admission: { level: fields.level ? s.level : 'Aucun', bacSeries: fields.level ? s.bacSeries : [], selection: s.selection },
        housing: s.housing,
        scholarship: s.scholarship,
        imageSrc: s.imageSrc || null,
        ...(status ? { status } : {}),
        details: {
            description: s.description || null,
            objectives: s.objectives,
            skills: s.skills,
            subjects: fields.programme ? s.subjects : [],
            program: fields.programme ? s.program.filter((p) => p.period.trim()) : [],
            specializations: fields.programme ? s.specializations : [],
            teachingMethods: fields.programme ? s.teachingMethods : [],
            evaluation: fields.programme ? s.evaluation || null : null,
            admission: { prerequisites: s.prerequisites, specialConditions: s.specialConditions || null, minAge: num(s.minAge) },
            costs: {
                applicationFee: num(s.applicationFee),
                otherFees: s.otherFees.filter((f) => f.label.trim()).map((f) => ({ label: f.label, amount: num(f.amount) })),
                status: s.costsStatus,
                paymentOptions: s.paymentOptions,
                scholarships: s.scholarshipsInfo || null,
                discounts: s.discounts || null,
            },
            organization: { schedule: s.schedule || null, campus: s.campus || null, rhythm: s.rhythm },
            careers: fields.careers
                ? { jobs: s.jobs, sectors: s.sectors, furtherStudies: s.furtherStudies, internship: s.internship || null, partnerships: s.partnerships }
                : { jobs: [], sectors: [], furtherStudies: [], internship: null, partnerships: [] },
            onlineApplication: s.onlineApplication,
            brochureUrl: s.brochureUrl || null,
            academicCalendar: s.academicCalendar.filter((c) => c.label.trim() && c.date),
        },
    }
}

function OfferForm({ offer }: { offer?: ManagedOffer }) {
    const { current: e, reload } = useCurrentEstablishment()
    const router = useRouter()
    const toast = useToast()
    const { data: category } = useApi<{ data: Category }>(`/categories/${e.category}`)
    const { data: domains } = useApi<{ data: Domain[] }>('/domains')
    const { data: reference } = useApi<{ data: ReferenceData }>('/reference')
    const fields = category?.data.fields ?? DEFAULT_FIELDS
    const ref = reference?.data
    const defaultKind = e.category === 'petite-enfance' ? 'accueil' : e.category === 'scolaire' ? 'niveau' : 'formation'
    const [s, setState] = useState<State>(() => initialState(offer, e, defaultKind))
    const [saving, setSaving] = useState<string | null>(null)
    const [error, setError] = useState<unknown>(null)
    const set = <K extends keyof State>(key: K, value: State[K]) => setState((prev) => ({ ...prev, [key]: value }))
    const toggle = (key: ListKey, value: string) => set(key, s[key].includes(value) ? s[key].filter((v) => v !== value) : [...s[key], value])
    const apiError = error instanceof ApiError ? error : null
    const err = (field: string) => apiError?.field(field)
    const opts = (list?: string[]) => (list ?? []).map((v) => <option key={v}>{v}</option>)

    const save = async (status?: string) => {
        setSaving(status ?? 'save')
        setError(null)
        try {
            const body = toPayload(s, fields, status)
            if (offer) await api(`/offers/${offer.id}`, { method: 'PATCH', body })
            else await api(`/establishments/${e.id}/offers`, { method: 'POST', body })
            toast.success(status === 'published' ? 'Offre publiée' : 'Offre enregistrée')
            await reload()
            router.push('/offres/')
        } catch (ex) {
            setError(ex)
            toast.error((ex instanceof ApiError && ex.field('status')) || 'Vérifiez les champs signalés.')
        } finally {
            setSaving(null)
        }
    }

    function rowEditor<K extends RowKey>(key: K, empty: State[K][number], render: (item: State[K][number], update: (patch: Partial<State[K][number]>) => void) => ReactNode, addLabel: string) {
        const rows = s[key] as State[K][number][]
        const update = (next: State[K][number][]) => set(key, next as State[K])
        return (
            <>
                {rows.map((item, i) => (
                    <CRow key={i} className='g-2 align-items-end mb-2'>
                        {render(item, (patch) => update(rows.map((x, j) => (j === i ? { ...x, ...patch } : x))))}
                        <CCol xs='auto'>
                            <CButton color='danger' variant='ghost' aria-label='Retirer' onClick={() => update(rows.filter((_, j) => j !== i))}>
                                <CIcon icon={cilTrash} />
                            </CButton>
                        </CCol>
                    </CRow>
                ))}
                <CButton color='secondary' variant='outline' size='sm' onClick={() => update([...rows, empty])}>
                    <CIcon icon={cilPlus} className='me-1' />
                    {addLabel}
                </CButton>
            </>
        )
    }

    return (
        <CForm
            onSubmit={(ev) => {
                ev.preventDefault()
                save(offer ? undefined : 'draft')
            }}
            noValidate
        >
            {!!error && (
                <CAlert color='danger'>
                    {apiError?.field('status') ??
                        (apiError && Object.keys(apiError.errors).length ? 'Certains champs sont à corriger (en rouge).' : error instanceof Error ? error.message : '')}
                </CAlert>
            )}

            <PageCard icon={cilEducation} title='Informations principales'>
                <CRow className='g-3'>
                    <CCol md={12}>
                        <CFormInput
                            label='Intitulé'
                            placeholder='Ex. : Licence en informatique'
                            value={s.title}
                            onChange={(ev) => set('title', ev.target.value)}
                            invalid={!!err('title')}
                            feedbackInvalid={err('title')}
                        />
                    </CCol>
                    <CCol md={6}>
                        <CFormSelect label="Type d'offre" value={s.kind} onChange={(ev) => set('kind', ev.target.value)}>
                            {(ref?.offerKinds ?? Object.keys(KIND_LABEL)).map((k) => (
                                <option key={k} value={k}>
                                    {KIND_LABEL[k] ?? k}
                                </option>
                            ))}
                        </CFormSelect>
                    </CCol>
                    <CCol md={6}>
                        <CFormSelect label="Domaine d'études" value={s.domain} onChange={(ev) => set('domain', ev.target.value)}>
                            <option value=''>Choisir…</option>
                            {opts((domains?.data ?? []).map((d) => d.name))}
                        </CFormSelect>
                    </CCol>
                    {fields.diplomas && (
                        <CCol md={4}>
                            <CFormSelect label='Diplôme préparé' value={s.diploma} onChange={(ev) => set('diploma', ev.target.value)}>
                                <option value=''>Aucun diplôme</option>
                                {opts(ref?.diplomas)}
                            </CFormSelect>
                        </CCol>
                    )}
                    {fields.duration && (
                        <CCol md={4}>
                            <CFormInput
                                label='Durée (années)'
                                text='0,5 = six mois'
                                inputMode='decimal'
                                value={s.durationYears}
                                onChange={(ev) => set('durationYears', ev.target.value)}
                                invalid={!!err('durationYears')}
                                feedbackInvalid={err('durationYears')}
                            />
                        </CCol>
                    )}
                    {fields.childAge && (
                        <>
                            <CCol xs={6} md={2}>
                                <CFormInput label='Âge min.' text='0,25 = 3 mois' inputMode='decimal' value={s.ageMin} onChange={(ev) => set('ageMin', ev.target.value)} />
                            </CCol>
                            <CCol xs={6} md={2}>
                                <CFormInput
                                    label='Âge max.'
                                    inputMode='decimal'
                                    value={s.ageMax}
                                    onChange={(ev) => set('ageMax', ev.target.value)}
                                    invalid={!!err('ageRange.max')}
                                    feedbackInvalid={err('ageRange.max')}
                                />
                            </CCol>
                        </>
                    )}
                    <CCol md={4}>
                        <CFormSelect label='Modalité' value={s.modality} onChange={(ev) => set('modality', ev.target.value)}>
                            {opts(ref?.modalities ?? ['Présentiel', 'Distanciel', 'Hybride'])}
                        </CFormSelect>
                    </CCol>
                    <CCol md={4}>
                        <CFormSelect label='Inscriptions' value={s.registration} onChange={(ev) => set('registration', ev.target.value)}>
                            {opts(ref?.registrationStatuses ?? ['Ouvertes', 'À venir', 'Fermées'])}
                        </CFormSelect>
                    </CCol>
                    <CCol md={12}>
                        <div className='form-label'>Langues d&apos;enseignement</div>
                        {KNOWN_LANGUAGES.map((l) => (
                            <CFormCheck inline key={l} id={`lang-${l}`} label={l} checked={s.languages.includes(l)} onChange={() => toggle('languages', l)} />
                        ))}
                        <CFormInput
                            className='mt-2'
                            placeholder='Autres langues, séparées par des virgules'
                            value={s.otherLanguages}
                            onChange={(ev) => set('otherLanguages', ev.target.value)}
                        />
                    </CCol>
                    <CCol md={12}>
                        <ImageUpload label="Image de l'offre" value={s.imageSrc} onChange={(v: string) => set('imageSrc', v)} />
                    </CCol>
                </CRow>
            </PageCard>

            <PageCard icon={cilNotes} title='Présentation'>
                <CFormTextarea label='Description' rows={5} className='mb-3' value={s.description} onChange={(ev) => set('description', ev.target.value)} />
                <ListInput label='Objectifs' value={s.objectives} onChange={(v) => set('objectives', v)} />
                <ListInput label={s.kind === 'formation' ? 'Compétences acquises' : "Ce que l'enfant développe"} value={s.skills} onChange={(v) => set('skills', v)} />
            </PageCard>

            {fields.programme && (
                <PageCard icon={cilList} title='Programme'>
                    <ListInput label='Matières principales' value={s.subjects} onChange={(v) => set('subjects', v)} />
                    <div className='form-label'>Programme détaillé</div>
                    {rowEditor(
                        'program',
                        { period: '', courses: [] },
                        (p, update) => (
                            <CCol>
                                <CFormInput className='mb-2' placeholder='Période (ex. : 1re année)' value={p.period} onChange={(ev) => update({ period: ev.target.value })} />
                                <ListInput label='Cours' value={p.courses} onChange={(v) => update({ courses: v })} />
                            </CCol>
                        ),
                        'Ajouter une période'
                    )}
                    <div className='mt-3'>
                        <ListInput label='Spécialisations' value={s.specializations} onChange={(v) => set('specializations', v)} />
                        <ListInput label="Méthodes d'enseignement" value={s.teachingMethods} onChange={(v) => set('teachingMethods', v)} />
                        <CFormTextarea label='Évaluation' rows={2} value={s.evaluation} onChange={(ev) => set('evaluation', ev.target.value)} />
                    </div>
                </PageCard>
            )}

            <PageCard icon={cilClipboard} title='Admission'>
                <CRow className='g-3 mb-3'>
                    {fields.level && (
                        <CCol md={4}>
                            <CFormSelect label='Niveau requis' value={s.level} onChange={(ev) => set('level', ev.target.value)}>
                                {opts(ref?.admissionLevels ?? ['Aucun', 'BAC', 'BAC+2', 'BAC+3'])}
                            </CFormSelect>
                        </CCol>
                    )}
                    <CCol md={4}>
                        <CFormSelect label='Sélection' value={s.selection} onChange={(ev) => set('selection', ev.target.value)}>
                            {opts(ref?.admissionSelections)}
                        </CFormSelect>
                    </CCol>
                    <CCol md={4}>
                        <CFormInput label='Âge minimum (facultatif)' inputMode='decimal' value={s.minAge} onChange={(ev) => set('minAge', ev.target.value)} />
                    </CCol>
                    {fields.level && s.level !== 'Aucun' && (
                        <CCol md={12}>
                            <div className='form-label'>Séries du BAC acceptées (aucune = toutes)</div>
                            {BAC_SERIES.map((serie) => (
                                <CFormCheck
                                    inline
                                    key={serie}
                                    id={`bac-${serie}`}
                                    label={serie}
                                    checked={s.bacSeries.includes(serie)}
                                    onChange={() => toggle('bacSeries', serie)}
                                />
                            ))}
                        </CCol>
                    )}
                </CRow>
                <ListInput label='Prérequis' value={s.prerequisites} onChange={(v) => set('prerequisites', v)} />
                <CFormTextarea label='Conditions particulières' rows={2} value={s.specialConditions} onChange={(ev) => set('specialConditions', ev.target.value)} />
            </PageCard>

            <PageCard icon={cilMoney} title='Frais et financement' subtitle="Laissez vide si vous ne savez pas : « Non communiqué » vaut mieux qu'un montant approximatif">
                <CRow className='g-3 mb-3'>
                    <CCol xs={8} md={4}>
                        <CFormInput
                            label='Frais de scolarité (Ar)'
                            inputMode='numeric'
                            value={s.fees}
                            onChange={(ev) => set('fees', ev.target.value)}
                            invalid={!!err('fees')}
                            feedbackInvalid={err('fees')}
                        />
                    </CCol>
                    <CCol xs={4} md={2}>
                        <CFormSelect label='Par' value={s.feesPeriod} onChange={(ev) => set('feesPeriod', ev.target.value)}>
                            <option value='an'>an</option>
                            <option value='mois'>mois</option>
                        </CFormSelect>
                    </CCol>
                    <CCol md={3}>
                        <CFormInput label='Inscription (Ar)' inputMode='numeric' value={s.registrationFee} onChange={(ev) => set('registrationFee', ev.target.value)} />
                    </CCol>
                    <CCol md={3}>
                        <CFormInput label='Frais de dossier (Ar)' inputMode='numeric' value={s.applicationFee} onChange={(ev) => set('applicationFee', ev.target.value)} />
                    </CCol>
                    <CCol md={4}>
                        <CFormSelect label='Ces montants sont' value={s.costsStatus} onChange={(ev) => set('costsStatus', ev.target.value)}>
                            {opts(ref?.costsStatuses ?? ['Confirmés', 'Estimés', 'Non communiqués'])}
                        </CFormSelect>
                    </CCol>
                    <CCol md={4}>
                        <CFormSelect label='Bourses' value={s.scholarship} onChange={(ev) => set('scholarship', ev.target.value)}>
                            {opts(ref?.scholarships)}
                        </CFormSelect>
                    </CCol>
                    <CCol md={4}>
                        <CFormSelect label='Hébergement' value={s.housing} onChange={(ev) => set('housing', ev.target.value)}>
                            {opts(ref?.housing)}
                        </CFormSelect>
                    </CCol>
                </CRow>
                <div className='form-label'>Autres frais</div>
                {rowEditor(
                    'otherFees',
                    { label: '', amount: '' },
                    (fee, update) => (
                        <>
                            <CCol>
                                <CFormInput aria-label='Intitulé du frais' placeholder='Intitulé du frais' value={fee.label} onChange={(ev) => update({ label: ev.target.value })} />
                            </CCol>
                            <CCol xs={4}>
                                <CFormInput
                                    aria-label='Montant (Ar)'
                                    placeholder='Montant (Ar)'
                                    inputMode='numeric'
                                    value={fee.amount}
                                    onChange={(ev) => update({ amount: ev.target.value })}
                                />
                            </CCol>
                        </>
                    ),
                    'Ajouter un frais'
                )}
                <div className='mt-3'>
                    <ListInput label='Modalités de paiement' placeholder='Ex. : Mensuel' value={s.paymentOptions} onChange={(v) => set('paymentOptions', v)} />
                    <CFormTextarea label='Bourses : précisions' rows={2} className='mb-3' value={s.scholarshipsInfo} onChange={(ev) => set('scholarshipsInfo', ev.target.value)} />
                    <CFormTextarea label='Réductions' rows={2} value={s.discounts} onChange={(ev) => set('discounts', ev.target.value)} />
                </div>
            </PageCard>

            <PageCard icon={cilCalendar} title='Organisation et calendrier'>
                <CRow className='g-3 mb-3'>
                    <CCol md={4}>
                        <CFormInput label='Début des inscriptions' type='date' value={s.registrationStart} onChange={(ev) => set('registrationStart', ev.target.value)} />
                    </CCol>
                    <CCol md={4}>
                        <CFormInput
                            label='Fin des inscriptions'
                            type='date'
                            value={s.registrationEnd}
                            onChange={(ev) => set('registrationEnd', ev.target.value)}
                            invalid={!!err('registrationPeriod.end')}
                            feedbackInvalid={err('registrationPeriod.end')}
                        />
                    </CCol>
                    <CCol md={4}>
                        <CFormInput label='Date de rentrée' type='date' value={s.startDate} onChange={(ev) => set('startDate', ev.target.value)} />
                    </CCol>
                    <CCol md={6}>
                        <CFormInput label='Horaires' value={s.schedule} onChange={(ev) => set('schedule', ev.target.value)} />
                    </CCol>
                    <CCol md={6}>
                        <CFormInput label='Lieu des cours' value={s.campus} onChange={(ev) => set('campus', ev.target.value)} />
                    </CCol>
                </CRow>
                <ListInput label='Rythme' placeholder='Ex. : Temps plein' value={s.rhythm} onChange={(v) => set('rhythm', v)} />
                <div className='form-label'>Calendrier</div>
                {rowEditor(
                    'academicCalendar',
                    { label: '', date: '' },
                    (item, update) => (
                        <>
                            <CCol>
                                <CFormInput aria-label='Étape' placeholder='Étape' value={item.label} onChange={(ev) => update({ label: ev.target.value })} />
                            </CCol>
                            <CCol xs={5} md={4}>
                                <CFormInput aria-label='Date' type='date' value={item.date} onChange={(ev) => update({ date: ev.target.value })} />
                            </CCol>
                        </>
                    ),
                    'Ajouter une étape'
                )}
            </PageCard>

            {fields.careers && (
                <PageCard icon={cilBriefcase} title='Débouchés' subtitle='Uniquement les partenariats confirmés'>
                    <ListInput label='Métiers' value={s.jobs} onChange={(v) => set('jobs', v)} />
                    <ListInput label="Secteurs d'activité" value={s.sectors} onChange={(v) => set('sectors', v)} />
                    <ListInput label="Poursuite d'études" value={s.furtherStudies} onChange={(v) => set('furtherStudies', v)} />
                    <CFormTextarea label='Stage' rows={2} className='mb-3' value={s.internship} onChange={(ev) => set('internship', ev.target.value)} />
                    <ListInput label='Partenariats' value={s.partnerships} onChange={(v) => set('partnerships', v)} />
                </PageCard>
            )}

            <PageCard icon={cilSend} title='Candidature'>
                <CFormCheck
                    id='online-application'
                    className='mb-3'
                    label='Recevoir les candidatures en ligne (les étudiants postulent avec leurs documents ; suivi dans « Demandes »)'
                    checked={s.onlineApplication}
                    onChange={(ev) => set('onlineApplication', ev.target.checked)}
                />
                <CFormInput
                    label='Brochure (lien vers un PDF)'
                    type='url'
                    placeholder='https://'
                    value={s.brochureUrl}
                    onChange={(ev) => set('brochureUrl', ev.target.value)}
                    invalid={!!err('details.brochureUrl')}
                    feedbackInvalid={err('details.brochureUrl')}
                />
            </PageCard>

            <div className='d-flex flex-wrap justify-content-end gap-2 mb-4'>
                <CButton color='secondary' variant='ghost' onClick={() => router.push('/offres/')}>
                    Annuler
                </CButton>
                {offer ? (
                    <>
                        <CButton type='submit' color={offer.status === 'published' ? 'primary' : 'secondary'} disabled={!!saving}>
                            {saving === 'save' && <CSpinner size='sm' className='me-2' />}
                            Enregistrer
                        </CButton>
                        {offer.status !== 'published' && (
                            <CButton color='primary' disabled={!!saving} onClick={() => save('published')}>
                                {saving === 'published' && <CSpinner size='sm' className='me-2' />}
                                Enregistrer et publier
                            </CButton>
                        )}
                    </>
                ) : (
                    <>
                        <CButton type='submit' color='secondary' disabled={!!saving}>
                            Enregistrer le brouillon
                        </CButton>
                        <CButton color='primary' disabled={!!saving} onClick={() => save('published')}>
                            {saving === 'published' && <CSpinner size='sm' className='me-2' />}
                            Publier
                        </CButton>
                    </>
                )}
            </div>
        </CForm>
    )
}

/** /offres/nouvelle/ ou /offres/modifier/?id=… */
export default function OfferEdit() {
    const id = useSearchParams().get('id')
    const { current } = useCurrentEstablishment()
    const offer = id ? current.offers?.find((o) => o.id === id) : undefined
    return (
        <>
            <PageBanner title={offer?.title} description={offer ? `${offer.statusLabel} · ${current.name}` : undefined} />
            {id && !offer ? (
                <PageCard>
                    <EmptyState title='Offre introuvable'>Elle a peut-être été supprimée.</EmptyState>
                </PageCard>
            ) : (
                <OfferForm key={offer?.updatedAt ?? 'new'} offer={offer} />
            )}
        </>
    )
}
