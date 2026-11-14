'use client'
import { useState, type ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CAlert, CButton, CCol, CForm, CFormCheck, CFormInput, CFormSelect, CFormTextarea, CRow, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheckAlt, cilChevronBottom, cilChevronRight, cilChevronTop, cilEducation, cilPlus, cilSave, cilSend, cilTrash } from '@coreui/icons'
import { useCurrentEstablishment } from '@/context/EstablishmentContext'
import { useToast } from '@/context/ToastContext'
import { api, ApiError } from '@/lib/api'
import { formatDate } from '@/lib/format'
import { useApi } from '@/lib/useApi'
import { DURATION_UNITS, formationStructure, HIGHER_DIPLOMAS, kindsForCategory, OFFER_KINDS, VOCATIONAL_DIPLOMAS, type FormationStructure, type OfferKindRules } from '@/lib/offerKinds'
import type { Domain, ManagedEstablishment, ManagedOffer, ReferenceData } from '@/lib/types'
import { EmptyState, FileUpload, ImageUpload, ListInput, PageCard, StatusDot } from '@/components/ui'

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
        diplomaOther: offer?.diplomaOther ?? '',
        durationYears: str(offer?.durationYears),
        durationValue: str(offer?.duration?.value),
        durationUnit: offer?.duration?.unit ?? 'mois',
        levels: (offer?.levels ?? []).map((l) => ({ diploma: l.diploma, diplomaOther: l.diplomaOther ?? '', durationYears: str(l.durationYears), admissionLevel: l.admissionLevel })),
        ageMin: str(offer?.ageRange?.min),
        ageMax: str(offer?.ageRange?.max),
        fees: str(offer?.fees),
        feesPeriod: offer?.feesPeriod ?? OFFER_KINDS[kind].defaultFeesPeriod,
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
        selection: offer?.admission.selection ?? OFFER_KINDS[kind].defaultSelection,
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
        examFee: str(d.costs?.examFee),
        otherFees: (d.costs?.otherFees ?? []).map((f) => ({ label: f.label, amount: str(f.amount) })),
        costsStatus: d.costs?.status ?? 'Confirmés',
        paymentOptions: d.costs?.paymentOptions ?? [],
        schedule: d.organization?.schedule ?? '',
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
type RowKey = 'program' | 'otherFees' | 'academicCalendar' | 'levels'

/** Corps de la requête au format `FormationType` + `details` attendu par l'API. */
function toPayload(s: State, rules: OfferKindRules, structure: FormationStructure, status?: string) {
    const levels = structure === 'levels' ? s.levels.filter((l) => l.diploma) : []
    const diplomas = structure === 'vocational' ? VOCATIONAL_DIPLOMAS : structure === 'levels' ? [] : rules.diplomas
    return {
        title: s.title,
        kind: s.kind,
        domain: s.domain || rules.autoDomain,
        diploma: diplomas.includes(s.diploma) ? s.diploma : null,
        // « Autre » : nom du diplôme précisé par l'établissement.
        diplomaOther: s.diploma === 'Autre' && diplomas.includes(s.diploma) ? s.diplomaOther.trim() || null : null,
        durationYears: structure === 'simple' && rules.duration ? num(s.durationYears) : null,
        // Supérieur : niveaux de la filière ; l'API en déduit diplôme, durée, frais et niveau requis pour la recherche.
        levels: levels.map((l) => ({
            diploma: l.diploma,
            diplomaOther: l.diploma === 'Autre' ? l.diplomaOther.trim() || null : null,
            durationYears: num(l.durationYears),
            admissionLevel: l.admissionLevel,
        })),
        // Formation professionnelle : durée dans son unité.
        duration: structure === 'vocational' && num(s.durationValue) ? { value: num(s.durationValue), unit: s.durationUnit } : null,
        ageRange: rules.childAge && s.ageMin && s.ageMax ? { min: num(s.ageMin), max: num(s.ageMax) } : null,
        fees: num(s.fees),
        feesPeriod: s.feesPeriod,
        registrationFee: num(s.registrationFee),
        registrationPeriod: s.registrationStart && s.registrationEnd ? { start: s.registrationStart, end: s.registrationEnd } : null,
        startDate: s.startDate || null,
        modality: rules.modality ? s.modality : 'Présentiel',
        registration: s.registration,
        languages: [
            ...s.languages,
            ...s.otherLanguages
                .split(',')
                .map((l) => l.trim())
                .filter(Boolean),
        ],
        admission: { level: rules.level && structure !== 'levels' ? s.level : 'Aucun', bacSeries: rules.level ? s.bacSeries : [], selection: rules.selection ? s.selection : rules.defaultSelection },
        housing: 'Non renseigné',
        scholarship: 'Non renseigné',
        imageSrc: s.imageSrc || null,
        ...(status ? { status } : {}),
        details: {
            description: s.description || null,
            objectives: s.objectives,
            skills: s.skills,
            subjects: rules.subjects ? s.subjects : [],
            program: rules.fullProgramme ? s.program.filter((p) => p.period.trim()).map((p) => ({ period: p.period, courses: [] })) : [],
            specializations: rules.fullProgramme ? s.specializations : [],
            teachingMethods: rules.subjects ? s.teachingMethods : [],
            evaluation: rules.fullProgramme ? s.evaluation || null : null,
            admission: { prerequisites: s.prerequisites, specialConditions: s.specialConditions || null, minAge: rules.minAge ? num(s.minAge) : null },
            costs: {
                applicationFee: num(s.applicationFee),
                // Frais de concours : seulement pour une sélection sur concours ; vide = pas de frais.
                examFee: rules.selection && s.selection === 'Concours' ? num(s.examFee) : null,
                otherFees: s.otherFees.filter((f) => f.label.trim()).map((f) => ({ label: f.label, amount: num(f.amount) })),
                status: s.costsStatus,
                paymentOptions: s.paymentOptions,
                scholarships: null,
                discounts: null,
            },
            organization: { schedule: s.schedule || null, campus: null, rhythm: s.rhythm },
            careers: rules.careers
                ? { jobs: s.jobs, sectors: s.sectors, furtherStudies: s.furtherStudies, internship: s.internship || null, partnerships: s.partnerships }
                : { jobs: [], sectors: [], furtherStudies: [], internship: null, partnerships: [] },
            onlineApplication: s.onlineApplication,
            brochureUrl: s.brochureUrl || null,
            academicCalendar: s.academicCalendar.filter((c) => c.label.trim() && c.date),
        },
    }
}

/** Exemples d'intitulés selon le type d'établissement (sous-catégorie). */
const TITLE_EXAMPLES: Record<string, string> = {
    Université: 'Ex. : Droit des affaires',
    'École supérieure': 'Ex. : Génie logiciel',
    'Institut supérieur': 'Ex. : Gestion des entreprises',
    'Grande école': 'Ex. : Génie civil',
    'Centre de formation professionnelle': 'Ex. : Électricité bâtiment',
    "Centre d'apprentissage": 'Ex. : Mécanique automobile',
    'École technique': 'Ex. : Froid et climatisation',
    'Centre de formation en informatique': 'Ex. : Bureautique',
    'Centre de langues': 'Ex. : Anglais général',
}

/** Libellés de l'intitulé selon la structure de l'offre : Domaine → Filière → Niveaux, ou Domaine → Formation → Durée / Niveau. */
function offerLabels(structure: FormationStructure, subCategory: string, rules: OfferKindRules) {
    if (structure === 'levels')
        return { title: 'Filière', titleHelp: 'La spécialité enseignée, sans le diplôme : les niveaux (Licence, Master…) se précisent juste en dessous.', titlePlaceholder: TITLE_EXAMPLES[subCategory] ?? 'Ex. : Génie logiciel' }
    if (structure === 'vocational')
        return { title: 'Formation', titleHelp: 'Le métier ou la compétence enseignée.', titlePlaceholder: TITLE_EXAMPLES[subCategory] ?? 'Ex. : Électricité bâtiment' }
    return { title: 'Intitulé', titleHelp: undefined, titlePlaceholder: rules.titlePlaceholder }
}

type StepMeta = { key: string; n: number; title: string; subtitle: string; done: boolean }

/** Étape repliable du formulaire : numéro, titre, état de complétion. */
function Step({ meta, open, onToggle, children }: { meta?: StepMeta; open: boolean; onToggle: () => void; children: ReactNode }) {
    if (!meta) return null
    return (
        <section id={`step-${meta.key}`} className={`bo-step card mb-3${open ? ' is-open' : ''}${meta.done ? ' is-done' : ''}`}>
            <button type='button' className='bo-step-head' onClick={onToggle} aria-expanded={open} aria-controls={`step-body-${meta.key}`}>
                <span className='bo-step-num'>{meta.done ? <CIcon icon={cilCheckAlt} /> : meta.n}</span>
                <span className='me-auto text-start'>
                    <strong>{meta.title}</strong>
                    <small>{meta.subtitle}</small>
                </span>
                <span className='bo-step-state d-none d-sm-inline'>
                    <StatusDot />
                    {meta.done ? 'Complété' : 'Non complété'}
                </span>
                <CIcon icon={open ? cilChevronTop : cilChevronBottom} />
            </button>
            <div id={`step-body-${meta.key}`} className='bo-step-body' hidden={!open}>
                {children}
            </div>
        </section>
    )
}

function OfferForm({ offer }: { offer?: ManagedOffer }) {
    const { current: e, reload } = useCurrentEstablishment()
    const router = useRouter()
    const toast = useToast()
    // Seulement les domaines de la catégorie (ex. pas « Médecine & Santé » pour un centre de formation professionnelle).
    const { data: domains } = useApi<{ data: Domain[] }>('/domains', { category: e.category })
    const { data: reference } = useApi<{ data: ReferenceData }>('/reference')
    const ref = reference?.data
    const defaultKind = e.category === 'petite-enfance' ? 'accueil' : e.category === 'scolaire' ? 'niveau' : 'formation'
    const [s, setState] = useState<State>(() => initialState(offer, e, offer?.kind ?? defaultKind))
    const rules = OFFER_KINDS[s.kind] ?? OFFER_KINDS.formation
    const kinds = kindsForCategory(e.category, offer?.kind)
    const structure = formationStructure(e.category, s.kind)
    const labels = offerLabels(structure, e.subCategory, rules)
    const showBacSeries = rules.level && (structure === 'levels' ? s.levels.some((l) => l.admissionLevel !== 'Aucun') : s.level !== 'Aucun')
    const [saving, setSaving] = useState<string | null>(null)
    // Formule Gratuit : l'offre publiée est verrouillée un an (voir Offers).
    const lock = e.offerLock
    const isLockedOffer = !!lock && !!offer && offer.id === lock.offerId
    const identityLocked = isLockedOffer && new Date(lock.correctableUntil) < new Date()
    const cannotPublish = !!lock && !isLockedOffer
    const [error, setError] = useState<unknown>(null)
    const set = <K extends keyof State>(key: K, value: State[K]) => setState((prev) => ({ ...prev, [key]: value }))
    // Changer de type : on repart des valeurs par défaut de ce type pour les champs qu'il ne partage pas.
    const changeKind = (kind: string) => {
        const next = OFFER_KINDS[kind]
        setState((prev) => ({
            ...prev,
            kind,
            domain: next.domain ? prev.domain : '',
            diploma: next.diplomas.includes(prev.diploma) ? prev.diploma : '',
            feesPeriod: next.defaultFeesPeriod,
            selection: next.defaultSelection,
        }))
    }
    const toggle = (key: ListKey, value: string) => set(key, s[key].includes(value) ? s[key].filter((v) => v !== value) : [...s[key], value])
    const apiError = error instanceof ApiError ? error : null
    const err = (field: string) => apiError?.field(field)
    const opts = (list?: string[]) => (list ?? []).map((v) => <option key={v}>{v}</option>)

    const steps: StepMeta[] = [
        {
            key: 'main',
            title: 'Informations principales',
            subtitle: structure === 'levels' ? 'Le domaine, la filière et les niveaux proposés.' : 'Les informations de base sur votre offre.',
            done: !!s.title.trim() && (!rules.domain || !!s.domain) && (structure !== 'levels' || s.levels.some((l) => l.diploma)),
        },
        { key: 'presentation', title: 'Présentation', subtitle: 'Le contenu détaillé de votre offre.', done: !!s.description.trim() },
        ...(rules.subjects
            ? [{ key: 'programme', title: rules.fullProgramme ? 'Programme' : 'Matières', subtitle: rules.fullProgramme ? 'Les matières et le déroulement du cursus.' : 'Les matières enseignées à ce niveau.', done: s.subjects.length > 0 || s.program.some((x) => x.period.trim()) }]
            : []),
        { key: 'admission', title: rules.level ? 'Admission' : 'Inscription', subtitle: rules.level ? 'Les conditions d’admission et prérequis.' : 'Les conditions et pièces demandées.', done: s.prerequisites.length > 0 },
        { key: 'frais', title: 'Frais', subtitle: 'Les coûts et modalités de paiement.', done: s.fees.trim() !== '' },
        { key: 'organisation', title: 'Organisation et calendrier', subtitle: s.kind === 'accueil' ? 'Les dates, horaires et lieu d’accueil.' : 'Les dates, horaires et lieu des cours.', done: !!s.startDate || !!s.schedule.trim() || s.rhythm.length > 0 },
        ...(rules.careers ? [{ key: 'debouches', title: 'Débouchés', subtitle: 'Les métiers et secteurs d’activité.', done: s.jobs.length > 0 }] : []),
        { key: 'candidature', title: s.kind === 'formation' ? 'Candidature' : 'Demande d’inscription', subtitle: s.kind === 'formation' ? 'Les modalités de candidature et documents.' : 'Les demandes en ligne et documents.', done: s.onlineApplication || !!s.brochureUrl.trim() },
    ].map((step, i) => ({ ...step, n: i + 1 }))
    const stepOf = (key: string) => steps.find((step) => step.key === key)
    const [openSteps, setOpenSteps] = useState<string[]>(['main'])
    const isOpen = (key: string) => openSteps.includes(key)
    const toggleStep = (key: string) => setOpenSteps((list) => (list.includes(key) ? list.filter((k) => k !== key) : [...list, key]))
    const goTo = (key: string) => {
        setOpenSteps((list) => (list.includes(key) ? list : [...list, key]))
        requestAnimationFrame(() => document.getElementById(`step-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    }
    const doneCount = steps.filter((step) => step.done).length

    const save = async (status?: string) => {
        setSaving(status ?? 'save')
        setError(null)
        try {
            const body = toPayload(s, rules, structure, status)
            if (offer) await api(`/offers/${offer.id}`, { method: 'PATCH', body })
            else await api(`/establishments/${e.id}/offers`, { method: 'POST', body })
            toast.success(status === 'published' ? 'Offre publiée' : 'Offre enregistrée')
            await reload()
            router.push('/offres/')
        } catch (ex) {
            setError(ex)
            setOpenSteps(steps.map((step) => step.key))
            toast.error((ex instanceof ApiError && ex.field('status')) || 'Vérifiez les champs signalés.')
        } finally {
            setSaving(null)
        }
    }

    function rowEditor<K extends RowKey>(key: K, empty: State[K][number], render: (item: State[K][number], update: (patch: Partial<State[K][number]>) => void, index: number) => ReactNode, addLabel: string) {
        const rows = s[key] as State[K][number][]
        const update = (next: State[K][number][]) => set(key, next as State[K])
        return (
            <>
                {rows.map((item, i) => (
                    <CRow key={i} className='g-2 align-items-end mb-2'>
                        {render(item, (patch) => update(rows.map((x, j) => (j === i ? { ...x, ...patch } : x))), i)}
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
            <div className='bo-offer-head card mb-4'>
                <span className='bo-offer-head-icon' aria-hidden='true'>
                    <CIcon icon={cilEducation} size='xl' />
                </span>
                <div className='me-auto' style={{ minWidth: 0 }}>
                    <h1 className='h4 mb-1 text-truncate'>{offer ? offer.title : 'Nouvelle offre'}</h1>
                    <p className='small text-body-secondary mb-0'>
                        {offer ? `${offer.statusLabel} · ${e.name}` : 'Ajoutez une nouvelle offre proposée par votre établissement.'}
                    </p>
                </div>
                <div className='bo-offer-progress'>
                    <div className='small fw-semibold mb-1'>
                        {doneCount} / {steps.length} étapes complétées
                    </div>
                    <div className='progress' style={{ height: 6 }} role='progressbar' aria-valuenow={doneCount} aria-valuemin={0} aria-valuemax={steps.length} aria-label='Avancement'>
                        <div className='progress-bar bg-danger' style={{ width: `${(doneCount / steps.length) * 100}%` }} />
                    </div>
                </div>
            </div>

            <CRow className='g-4'>
            <CCol xl={9}>
            {!!error && (
                <CAlert color='danger'>
                    {apiError?.field('status') ??
                        (apiError && Object.keys(apiError.errors).length ? 'Certains champs sont à corriger (en rouge).' : error instanceof Error ? error.message : '')}
                </CAlert>
            )}

            {identityLocked && (
                <CAlert color='info'>
                    Le titre, le domaine et le diplôme de cette offre sont verrouillés jusqu&apos;au {formatDate(lock.until)} (formule {e.plan.name}). Tout le reste se modifie librement.
                </CAlert>
            )}
            {isLockedOffer && !identityLocked && (
                <CAlert color='info'>
                    Vous pouvez encore corriger le titre, le domaine et le diplôme jusqu&apos;au {formatDate(lock.correctableUntil)}. Ensuite, ils seront verrouillés jusqu&apos;au {formatDate(lock.until)} (formule {e.plan.name}).
                </CAlert>
            )}
            {cannotPublish && (
                <CAlert color='warning'>
                    Avec la formule {e.plan.name}, vous changez d&apos;offre publiée une fois par an : celle-ci pourra être publiée à partir du {formatDate(lock.until)}. Vous pouvez la préparer en brouillon, ou passer à Pro pour la publier tout de suite.
                </CAlert>
            )}

            <Step meta={stepOf('main')} open={isOpen('main')} onToggle={() => toggleStep('main')}>
                <CRow className='g-3'>
                    {kinds.length > 1 ? (
                        <CCol md={6}>
                            <CFormSelect label="Type d'offre" value={s.kind} onChange={(ev) => changeKind(ev.target.value)}>
                                {kinds.map((k) => (
                                    <option key={k} value={k}>
                                        {OFFER_KINDS[k]?.label ?? k}
                                    </option>
                                ))}
                            </CFormSelect>
                        </CCol>
                    ) : (
                        // Un seul type possible : on rappelle plutôt le type d'établissement, qui détermine les champs.
                        <CCol md={6}>
                            <CFormInput label="Type d'établissement" value={e.subCategory || OFFER_KINDS[s.kind]?.label || ''} disabled readOnly />
                        </CCol>
                    )}
                    {rules.domain && (
                        <CCol md={6}>
                            <CFormSelect
                                label={structure === 'simple' ? "Domaine d'études" : 'Domaine'}
                                value={s.domain}
                                onChange={(ev) => set('domain', ev.target.value)}
                                invalid={!!err('domain')}
                                feedbackInvalid={err('domain')}
                            >
                                <option value=''>Choisir…</option>
                                {/* Le domaine déjà enregistré reste affiché, même s'il n'est plus proposé pour cette catégorie. */}
                                {opts([...new Set([...(domains?.data ?? []).map((d) => d.name), ...(offer?.domain ? [offer.domain] : [])])])}
                            </CFormSelect>
                        </CCol>
                    )}
                    <CCol md={12}>
                        <CFormInput
                            label={labels.title}
                            text={labels.titleHelp}
                            placeholder={labels.titlePlaceholder}
                            value={s.title}
                            onChange={(ev) => set('title', ev.target.value)}
                            invalid={!!err('title')}
                            feedbackInvalid={err('title')}
                        />
                    </CCol>
                    {structure === 'levels' && (
                        <CCol md={12}>
                            <div className='form-label mb-1'>Niveaux proposés</div>
                            <p className='small text-body-secondary mb-2'>Les niveaux auxquels cette filière est proposée (ex. : Licence puis Master), chacun avec sa durée et le niveau requis pour y entrer.</p>
                            {rowEditor(
                                'levels',
                                { diploma: '', diplomaOther: '', durationYears: '', admissionLevel: 'BAC' },
                                (l, update, i) => (
                                    <>
                                        <CCol xs={6} md={l.diploma === 'Autre' ? 2 : 4}>
                                            <CFormSelect aria-label='Diplôme' value={l.diploma} onChange={(ev) => update({ diploma: ev.target.value })}>
                                                <option value=''>Diplôme…</option>
                                                {opts(HIGHER_DIPLOMAS)}
                                            </CFormSelect>
                                        </CCol>
                                        {l.diploma === 'Autre' && (
                                            <CCol xs={6} md={3}>
                                                <CFormInput
                                                    aria-label='Précisez le diplôme'
                                                    placeholder='Précisez (ex. : DTS)'
                                                    value={l.diplomaOther}
                                                    onChange={(ev) => update({ diplomaOther: ev.target.value })}
                                                    invalid={!!err(`levels.${i}.diplomaOther`)}
                                                    feedbackInvalid={err(`levels.${i}.diplomaOther`)}
                                                />
                                            </CCol>
                                        )}
                                        <CCol xs={6} md={l.diploma === 'Autre' ? 2 : 3}>
                                            <CFormInput aria-label='Durée (années)' placeholder='Durée (ans)' inputMode='decimal' value={l.durationYears} onChange={(ev) => update({ durationYears: ev.target.value })} />
                                        </CCol>
                                        <CCol xs={6} md={4}>
                                            <CFormSelect aria-label='Niveau requis' value={l.admissionLevel} onChange={(ev) => update({ admissionLevel: ev.target.value })}>
                                                {(ref?.admissionLevels ?? ['Aucun', 'BAC', 'BAC+2', 'BAC+3', 'BAC+4']).map((v) => (
                                                    <option key={v} value={v}>
                                                        {v === 'Aucun' ? 'Accès sans diplôme' : `Accès : ${v}`}
                                                    </option>
                                                ))}
                                            </CFormSelect>
                                        </CCol>
                                    </>
                                ),
                                'Ajouter un niveau'
                            )}
                        </CCol>
                    )}
                    {structure === 'vocational' && (
                        <>
                            <CCol md={4}>
                                <CFormSelect label='Niveau (diplôme obtenu)' value={s.diploma} onChange={(ev) => set('diploma', ev.target.value)}>
                                    <option value=''>Aucun diplôme</option>
                                    {opts(VOCATIONAL_DIPLOMAS)}
                                </CFormSelect>
                            </CCol>
                            {s.diploma === 'Autre' && (
                                <CCol md={4}>
                                    <CFormInput
                                        label='Précisez le diplôme'
                                        placeholder='Ex. : Permis poids lourd'
                                        value={s.diplomaOther}
                                        onChange={(ev) => set('diplomaOther', ev.target.value)}
                                        invalid={!!err('diplomaOther')}
                                        feedbackInvalid={err('diplomaOther')}
                                    />
                                </CCol>
                            )}
                            <CCol xs={6} md={2}>
                                <CFormInput
                                    label='Durée'
                                    inputMode='decimal'
                                    value={s.durationValue}
                                    onChange={(ev) => set('durationValue', ev.target.value)}
                                    invalid={!!err('duration.value')}
                                    feedbackInvalid={err('duration.value')}
                                />
                            </CCol>
                            <CCol xs={6} md={2}>
                                <CFormSelect label='Unité' value={s.durationUnit} onChange={(ev) => set('durationUnit', ev.target.value)}>
                                    {opts(ref?.durationUnits ?? DURATION_UNITS)}
                                </CFormSelect>
                            </CCol>
                        </>
                    )}
                    {structure === 'simple' && rules.diplomas.length > 0 && (
                        <CCol md={4}>
                            <CFormSelect label={rules.level ? 'Diplôme préparé' : 'Examen préparé'} value={s.diploma} onChange={(ev) => set('diploma', ev.target.value)}>
                                <option value=''>{rules.level ? 'Aucun diplôme' : 'Aucun examen'}</option>
                                {opts(rules.diplomas)}
                            </CFormSelect>
                        </CCol>
                    )}
                    {structure === 'simple' && rules.duration && (
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
                    {rules.childAge && (
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
                    {rules.modality && (
                        <CCol md={4}>
                            <CFormSelect label='Modalité' value={s.modality} onChange={(ev) => set('modality', ev.target.value)}>
                                {opts(ref?.modalities ?? ['Présentiel', 'Distanciel', 'Hybride'])}
                            </CFormSelect>
                        </CCol>
                    )}
                    <CCol md={4}>
                        <CFormSelect label='Inscriptions' value={s.registration} onChange={(ev) => set('registration', ev.target.value)}>
                            {opts(ref?.registrationStatuses ?? ['Ouvertes', 'À venir', 'Fermées'])}
                        </CFormSelect>
                    </CCol>
                    <CCol md={12}>
                        <div className='form-label'>{rules.languagesLabel}</div>
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
            </Step>

            <Step meta={stepOf('presentation')} open={isOpen('presentation')} onToggle={() => toggleStep('presentation')}>
                <CFormTextarea label='Description' rows={5} className='mb-3' value={s.description} onChange={(ev) => set('description', ev.target.value)} />
                <ListInput label='Objectifs' value={s.objectives} onChange={(v) => set('objectives', v)} />
                <ListInput label={rules.skillsLabel} value={s.skills} onChange={(v) => set('skills', v)} />
            </Step>

            {rules.subjects && (
                <Step meta={stepOf('programme')} open={isOpen('programme')} onToggle={() => toggleStep('programme')}>
                    <ListInput label='Matières principales' value={s.subjects} onChange={(v) => set('subjects', v)} />
                    {rules.fullProgramme && (
                        <>
                            <div className='form-label'>Programme détaillé</div>
                            {rowEditor(
                                'program',
                                { period: '', courses: [] },
                                (p, update) => (
                                    <CCol>
                                        <CFormInput placeholder='Période (ex. : 1re année)' value={p.period} onChange={(ev) => update({ period: ev.target.value })} />
                                    </CCol>
                                ),
                                'Ajouter une période'
                            )}
                        </>
                    )}
                    <div className='mt-3'>
                        {rules.fullProgramme && <ListInput label='Spécialisations' value={s.specializations} onChange={(v) => set('specializations', v)} />}
                        <ListInput label="Méthodes d'enseignement" value={s.teachingMethods} onChange={(v) => set('teachingMethods', v)} />
                        {rules.fullProgramme && <CFormTextarea label='Évaluation' rows={2} value={s.evaluation} onChange={(ev) => set('evaluation', ev.target.value)} />}
                    </div>
                </Step>
            )}

            <Step meta={stepOf('admission')} open={isOpen('admission')} onToggle={() => toggleStep('admission')}>
                <CRow className='g-3 mb-3'>
                    {rules.level && structure !== 'levels' && (
                        <CCol md={4}>
                            <CFormSelect label='Niveau requis' value={s.level} onChange={(ev) => set('level', ev.target.value)}>
                                {opts(ref?.admissionLevels ?? ['Aucun', 'BAC', 'BAC+2', 'BAC+3', 'BAC+4'])}
                            </CFormSelect>
                        </CCol>
                    )}
                    {rules.selection && (
                        <CCol md={4}>
                            <CFormSelect label='Sélection' value={s.selection} onChange={(ev) => set('selection', ev.target.value)}>
                                {opts(ref?.admissionSelections)}
                            </CFormSelect>
                        </CCol>
                    )}
                    {rules.selection && s.selection === 'Concours' && (
                        <CCol md={4}>
                            <CFormInput
                                label='Frais de concours (Ar)'
                                text='Laissez vide s’il n’y a pas de frais.'
                                inputMode='numeric'
                                value={s.examFee}
                                onChange={(ev) => set('examFee', ev.target.value)}
                                invalid={!!err('details.costs.examFee')}
                                feedbackInvalid={err('details.costs.examFee')}
                            />
                        </CCol>
                    )}
                    {rules.minAge && (
                        <CCol md={4}>
                            <CFormInput label='Âge minimum (facultatif)' inputMode='decimal' value={s.minAge} onChange={(ev) => set('minAge', ev.target.value)} />
                        </CCol>
                    )}
                    {showBacSeries && (
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
                <ListInput label={rules.level ? 'Prérequis' : 'Pièces et conditions demandées'} value={s.prerequisites} onChange={(v) => set('prerequisites', v)} />
                <CFormTextarea label='Conditions particulières' rows={2} value={s.specialConditions} onChange={(ev) => set('specialConditions', ev.target.value)} />
            </Step>

            <Step meta={stepOf('frais')} open={isOpen('frais')} onToggle={() => toggleStep('frais')}>
                <p className='small text-body-secondary'>Laissez vide si vous ne savez pas : « Non communiqué » vaut mieux qu&apos;un montant approximatif.</p>
                <CRow className='g-3 mb-3'>
                    <CCol xs={8} md={4}>
                        <CFormInput
                            label={rules.feesLabel}
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
                </div>
            </Step>

            <Step meta={stepOf('organisation')} open={isOpen('organisation')} onToggle={() => toggleStep('organisation')}>
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
                        <CFormInput label={rules.startLabel} type='date' value={s.startDate} onChange={(ev) => set('startDate', ev.target.value)} />
                    </CCol>
                    <CCol md={6}>
                        <CFormInput label={rules.scheduleLabel} value={s.schedule} onChange={(ev) => set('schedule', ev.target.value)} />
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
            </Step>

            {rules.careers && (
                <Step meta={stepOf('debouches')} open={isOpen('debouches')} onToggle={() => toggleStep('debouches')}>
                <p className='small text-body-secondary'>Uniquement les partenariats confirmés.</p>
                    <ListInput label='Métiers' value={s.jobs} onChange={(v) => set('jobs', v)} />
                    <ListInput label="Secteurs d'activité" value={s.sectors} onChange={(v) => set('sectors', v)} />
                    <ListInput label="Poursuite d'études" value={s.furtherStudies} onChange={(v) => set('furtherStudies', v)} />
                    <CFormTextarea label='Stage' rows={2} className='mb-3' value={s.internship} onChange={(ev) => set('internship', ev.target.value)} />
                    <ListInput label='Partenariats' value={s.partnerships} onChange={(v) => set('partnerships', v)} />
                </Step>
            )}

            <Step meta={stepOf('candidature')} open={isOpen('candidature')} onToggle={() => toggleStep('candidature')}>
                <CFormCheck
                    id='online-application'
                    className='mb-3'
                    label={rules.onlineLabel}
                    checked={s.onlineApplication}
                    onChange={(ev) => set('onlineApplication', ev.target.checked)}
                />
                <FileUpload
                    label={rules.brochureLabel}
                    value={s.brochureUrl}
                    onChange={(url) => set('brochureUrl', url)}
                    hint='Les visiteurs pourront la télécharger depuis la fiche de l’offre sur le site.'
                    error={err('details.brochureUrl')}
                />
            </Step>

            </CCol>
            <CCol xl={3} className='d-none d-xl-block'>
                <nav className='bo-steps-aside card' aria-label='Étapes de la création'>
                    <h2 className='h6 fw-bold px-3 pt-3 mb-2'>Étapes de la création</h2>
                    {steps.map((step) => (
                        <button key={step.key} type='button' className={`bo-steps-aside-item${isOpen(step.key) ? ' is-open' : ''}`} onClick={() => goTo(step.key)}>
                            <span className={`bo-step-num${step.done ? ' is-done' : ''}`}>{step.done ? <CIcon icon={cilCheckAlt} /> : step.n}</span>
                            <span className='me-auto text-start'>
                                <span className='d-block fw-semibold'>{step.title}</span>
                                <small className={step.done ? 'text-success' : 'text-danger'}>
                                    <StatusDot />
                                    {step.done ? 'Complété' : 'Non complété'}
                                </small>
                            </span>
                            <CIcon icon={cilChevronRight} />
                        </button>
                    ))}
                </nav>
            </CCol>
            </CRow>

            <div className='bo-actionbar'>
                <CButton color='secondary' variant='outline' onClick={() => router.push('/offres/')}>
                    Annuler
                </CButton>
                <div className='ms-auto d-flex flex-wrap gap-2'>
                {offer ? (
                    <>
                        <CButton type='submit' color={offer.status === 'published' ? 'primary' : 'secondary'} disabled={!!saving}>
                            {saving === 'save' && <CSpinner size='sm' className='me-2' />}
                            Enregistrer
                        </CButton>
                        {offer.status !== 'published' && !cannotPublish && (
                            <CButton color='danger' className='text-white' disabled={!!saving} onClick={() => save('published')}>
                                {saving === 'published' ? <CSpinner size='sm' className='me-2' /> : <CIcon icon={cilSend} className='me-2' />}
                                Enregistrer et publier
                            </CButton>
                        )}
                    </>
                ) : (
                    <>
                        <CButton type='submit' color='secondary' variant='outline' disabled={!!saving}>
                            <CIcon icon={cilSave} className='me-2' />
                            Enregistrer le brouillon
                        </CButton>
                        {!cannotPublish && (
                            <CButton color='danger' className='text-white' disabled={!!saving} onClick={() => save('published')}>
                                {saving === 'published' ? <CSpinner size='sm' className='me-2' /> : <CIcon icon={cilSend} className='me-2' />}
                                Publier
                            </CButton>
                        )}
                    </>
                )}
                </div>
            </div>
        </CForm>
    )
}

/** /offres/nouvelle/ ou /offres/modifier/?id=… */
export default function OfferEdit() {
    const id = useSearchParams().get('id')
    const { current } = useCurrentEstablishment()
    const offer = id ? current.offers?.find((o) => o.id === id) : undefined
    if (id && !offer) {
        return (
            <PageCard>
                <EmptyState title='Offre introuvable'>Elle a peut-être été supprimée.</EmptyState>
            </PageCard>
        )
    }
    return <OfferForm key={offer?.updatedAt ?? 'new'} offer={offer} />
}
