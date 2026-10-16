'use client'
import { useState, type FormEvent, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react/dist/iconify.js'
import toast from 'react-hot-toast'
import { Button, Checkbox, FormAlert, ListField, SelectField, TextArea, TextField } from '@/components/ui/form'
import { api, ApiError } from '@/lib/api'
import { DEFAULT_FIELDS, type CategoryType } from '@/features/categories/types'
import type { FormationDetailType } from '@/features/formations/types'
import { useApi } from '../useApi'
import { Panel } from '../components/SpaceShell'
import ImageUpload from '../components/ImageUpload'
import type { ManagedEstablishment, ManagedOffer, ReferenceData } from '../types'

const KIND_LABEL: Record<string, string> = { formation: 'Formation', niveau: 'Niveau scolaire', accueil: 'Accueil (crèche, garderie…)' }
const KNOWN_LANGUAGES = ['Français', 'Malgache', 'Anglais']
const BAC_SERIES = ['A', 'C', 'D', 'Technique']

type Fee = { label: string; amount: string }
type Period = { period: string; courses: string[] }
type CalendarItem = { label: string; date: string }

/** État du formulaire : champs texte pour les nombres, convertis à l'envoi. */
type State = {
    title: string
    kind: string
    domain: string
    diploma: string
    durationYears: string
    ageMin: string
    ageMax: string
    fees: string
    feesPeriod: string
    registrationFee: string
    registrationStart: string
    registrationEnd: string
    startDate: string
    modality: string
    registration: string
    languages: string[]
    otherLanguages: string
    level: string
    bacSeries: string[]
    selection: string
    housing: string
    scholarship: string
    imageSrc: string
    description: string
    objectives: string[]
    skills: string[]
    subjects: string[]
    program: Period[]
    specializations: string[]
    teachingMethods: string[]
    evaluation: string
    prerequisites: string[]
    specialConditions: string
    minAge: string
    applicationFee: string
    otherFees: Fee[]
    costsStatus: string
    paymentOptions: string[]
    scholarshipsInfo: string
    discounts: string
    schedule: string
    campus: string
    rhythm: string[]
    jobs: string[]
    sectors: string[]
    furtherStudies: string[]
    internship: string
    partnerships: string[]
    onlineApplication: boolean
    brochureUrl: string
    academicCalendar: CalendarItem[]
}

const str = (v: number | null | undefined) => (v === null || v === undefined ? '' : String(v))
const num = (v: string) => (v.trim() === '' ? null : Number(v.replace(/\s/g, '').replace(',', '.')))

function initialState(offer: ManagedOffer | undefined, establishment: ManagedEstablishment, kind: string): State {
    const d: Partial<FormationDetailType> = offer?.details ?? {}
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
        campus: d.organization?.campus ?? (establishment.address ? `${establishment.name} — ${establishment.address}` : ''),
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

/** Corps de la requête, au format `FormationType` + `details` attendu par l'API. */
function toPayload(s: State, fields: CategoryType['fields'], status?: string) {
    const languages = [...s.languages, ...s.otherLanguages.split(',').map((l) => l.trim()).filter(Boolean)]
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
        languages,
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

function Grid({ children }: { children: ReactNode }) {
    return <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>{children}</div>
}

export function OfferForm({ establishment, offer, onDone }: { establishment: ManagedEstablishment; offer?: ManagedOffer; onDone: () => void }) {
    const router = useRouter()
    const { data: category } = useApi<{ data: CategoryType }>(`/categories/${establishment.category}`)
    const { data: domains } = useApi<{ data: { name: string }[] }>('/domains')
    const { data: reference } = useApi<{ data: ReferenceData }>('/reference')
    const fields = category?.data.fields ?? DEFAULT_FIELDS
    const defaultKind = establishment.category === 'petite-enfance' ? 'accueil' : establishment.category === 'scolaire' ? 'niveau' : 'formation'
    const [s, setState] = useState<State>(() => initialState(offer, establishment, defaultKind))
    const [saving, setSaving] = useState<string | null>(null)
    const [error, setError] = useState<ApiError | null>(null)
    const set = <K extends keyof State>(key: K, value: State[K]) => setState((prev) => ({ ...prev, [key]: value }))
    const ref = reference?.data
    const err = (field: string) => error?.field(field)
    const toggle = (key: 'languages' | 'bacSeries', value: string) =>
        set(key, s[key].includes(value) ? s[key].filter((v) => v !== value) : [...s[key], value])

    const save = async (status?: 'draft' | 'published') => {
        setSaving(status ?? 'save')
        setError(null)
        try {
            const body = toPayload(s, fields, status)
            if (offer) await api(`/offers/${offer.id}`, { method: 'PATCH', body })
            else await api(`/establishments/${establishment.id}/offers`, { method: 'POST', body })
            toast.success(status === 'published' ? 'Offre publiée' : 'Offre enregistrée')
            onDone()
        } catch (e) {
            const apiError = e as ApiError
            setError(apiError)
            toast.error(apiError.field('status') ?? 'Vérifiez les champs signalés.', { duration: 6000 })
        } finally {
            setSaving(null)
        }
    }

    const submit = (e: FormEvent) => {
        e.preventDefault()
        save(offer ? undefined : 'draft')
    }

    return (
        <form onSubmit={submit} className='flex flex-col gap-6' noValidate>
            {error && <FormAlert>{error.field('status') ?? (Object.keys(error.errors).length ? 'Certains champs sont à corriger : ils sont signalés en rouge.' : error.message)}</FormAlert>}

            <Panel title='Informations principales'>
                <Grid>
                    <TextField label='Intitulé' required className='sm:col-span-2' placeholder='Ex. : Licence en informatique' value={s.title} onChange={(e) => set('title', e.target.value)} error={err('title')} />
                    <SelectField label="Type d'offre" options={(ref?.offerKinds ?? ['formation', 'niveau', 'accueil']).map((k) => ({ value: k, label: KIND_LABEL[k] ?? k }))} value={s.kind} onChange={(e) => set('kind', e.target.value)} />
                    <SelectField label="Domaine d'études" placeholder='Choisir…' options={(domains?.data ?? []).map((d) => d.name)} value={s.domain} onChange={(e) => set('domain', e.target.value)} error={err('domain')} />
                    {fields.diplomas && (
                        <SelectField label='Diplôme préparé' placeholder='Aucun diplôme' options={ref?.diplomas ?? []} value={s.diploma} onChange={(e) => set('diploma', e.target.value)} error={err('diploma')} />
                    )}
                    {fields.duration && (
                        <TextField label='Durée (en années)' inputMode='decimal' hint='0,5 = six mois' value={s.durationYears} onChange={(e) => set('durationYears', e.target.value)} error={err('durationYears')} />
                    )}
                    {fields.childAge && (
                        <>
                            <TextField label='Âge minimum (ans)' inputMode='decimal' hint='0,25 = 3 mois' value={s.ageMin} onChange={(e) => set('ageMin', e.target.value)} error={err('ageRange.min')} />
                            <TextField label='Âge maximum (ans)' inputMode='decimal' value={s.ageMax} onChange={(e) => set('ageMax', e.target.value)} error={err('ageRange.max')} />
                        </>
                    )}
                    <SelectField label='Modalité' options={ref?.modalities ?? ['Présentiel', 'Distanciel', 'Hybride']} value={s.modality} onChange={(e) => set('modality', e.target.value)} />
                    <SelectField label='Inscriptions' options={ref?.registrationStatuses ?? ['Ouvertes', 'À venir', 'Fermées']} value={s.registration} onChange={(e) => set('registration', e.target.value)} />
                    <fieldset className='sm:col-span-2'>
                        <legend className='mb-1 text-sm font-semibold text-secondary'>Langues d&apos;enseignement</legend>
                        <div className='flex flex-wrap gap-x-6'>
                            {KNOWN_LANGUAGES.map((l) => <Checkbox key={l} label={l} checked={s.languages.includes(l)} onChange={() => toggle('languages', l)} />)}
                        </div>
                        <TextField label='Autres langues' placeholder='Ex. : Chinois, Allemand' value={s.otherLanguages} onChange={(e) => set('otherLanguages', e.target.value)} />
                    </fieldset>
                    <div className='sm:col-span-2'>
                        <ImageUpload label="Image de l'offre" value={s.imageSrc} onChange={(v) => set('imageSrc', v as string)} />
                    </div>
                </Grid>
            </Panel>

            <Panel title='Présentation'>
                <div className='flex flex-col gap-4'>
                    <TextArea label='Description' rows={5} value={s.description} onChange={(e) => set('description', e.target.value)} error={err('details.description')} />
                    <ListField label='Objectifs' value={s.objectives} onChange={(v) => set('objectives', v)} />
                    <ListField label={s.kind === 'formation' ? 'Compétences acquises' : 'Ce que l’enfant développe'} value={s.skills} onChange={(v) => set('skills', v)} />
                </div>
            </Panel>

            {fields.programme && (
                <Panel title='Programme' description='Matières et programme par année ou par niveau.'>
                    <div className='flex flex-col gap-4'>
                        <ListField label='Matières principales' value={s.subjects} onChange={(v) => set('subjects', v)} />
                        <div className='flex flex-col gap-3'>
                            <span className='text-sm font-semibold text-secondary'>Programme détaillé</span>
                            {s.program.map((period, i) => (
                                <div key={i} className='flex flex-col gap-3 rounded-xl bg-offwhite p-3'>
                                    <div className='flex items-end gap-2'>
                                        <TextField
                                            label='Période'
                                            className='flex-1'
                                            placeholder='Ex. : 1re année, Semestre 1'
                                            value={period.period}
                                            onChange={(e) => set('program', s.program.map((p, j) => (j === i ? { ...p, period: e.target.value } : p)))}
                                        />
                                        <Button type='button' variant='ghost' aria-label='Retirer cette période' onClick={() => set('program', s.program.filter((_, j) => j !== i))}>
                                            <Icon icon='tabler:trash' />
                                        </Button>
                                    </div>
                                    <ListField label='Cours' value={period.courses} onChange={(v) => set('program', s.program.map((p, j) => (j === i ? { ...p, courses: v } : p)))} />
                                </div>
                            ))}
                            <Button type='button' variant='secondary' className='w-fit' onClick={() => set('program', [...s.program, { period: '', courses: [] }])}>
                                <Icon icon='tabler:plus' /> Ajouter une période
                            </Button>
                        </div>
                        <ListField label='Spécialisations' value={s.specializations} onChange={(v) => set('specializations', v)} />
                        <ListField label="Méthodes d'enseignement" value={s.teachingMethods} onChange={(v) => set('teachingMethods', v)} />
                        <TextArea label='Évaluation' rows={3} value={s.evaluation} onChange={(e) => set('evaluation', e.target.value)} />
                    </div>
                </Panel>
            )}

            <Panel title='Admission'>
                <div className='flex flex-col gap-4'>
                    <Grid>
                        {fields.level && (
                            <SelectField label='Niveau requis' options={ref?.admissionLevels ?? ['Aucun', 'BAC', 'BAC+2', 'BAC+3']} value={s.level} onChange={(e) => set('level', e.target.value)} />
                        )}
                        <SelectField label='Sélection' options={ref?.admissionSelections ?? []} value={s.selection} onChange={(e) => set('selection', e.target.value)} />
                        <TextField label='Âge minimum (facultatif)' inputMode='decimal' value={s.minAge} onChange={(e) => set('minAge', e.target.value)} />
                    </Grid>
                    {fields.level && s.level !== 'Aucun' && (
                        <fieldset>
                            <legend className='mb-1 text-sm font-semibold text-secondary'>Séries du BAC acceptées (aucune cochée = toutes)</legend>
                            <div className='flex flex-wrap gap-x-6'>
                                {BAC_SERIES.map((serie) => <Checkbox key={serie} label={serie} checked={s.bacSeries.includes(serie)} onChange={() => toggle('bacSeries', serie)} />)}
                            </div>
                        </fieldset>
                    )}
                    <ListField label='Prérequis' value={s.prerequisites} onChange={(v) => set('prerequisites', v)} />
                    <TextArea label='Conditions particulières' rows={2} value={s.specialConditions} onChange={(e) => set('specialConditions', e.target.value)} />
                </div>
            </Panel>

            <Panel title='Frais et financement' description="« Non communiqué » vaut mieux qu'un montant approximatif : laissez vide si vous ne savez pas.">
                <div className='flex flex-col gap-4'>
                    <Grid>
                        <TextField label='Frais de scolarité (Ar)' inputMode='numeric' value={s.fees} onChange={(e) => set('fees', e.target.value)} error={err('fees')} />
                        <SelectField label='Par' options={[{ value: 'an', label: 'an' }, { value: 'mois', label: 'mois' }]} value={s.feesPeriod} onChange={(e) => set('feesPeriod', e.target.value)} />
                        <TextField label="Frais d'inscription (Ar)" inputMode='numeric' value={s.registrationFee} onChange={(e) => set('registrationFee', e.target.value)} error={err('registrationFee')} />
                        <TextField label='Frais de dossier (Ar)' inputMode='numeric' value={s.applicationFee} onChange={(e) => set('applicationFee', e.target.value)} />
                        <SelectField label='Ces montants sont' options={ref?.costsStatuses ?? ['Confirmés', 'Estimés', 'Non communiqués']} value={s.costsStatus} onChange={(e) => set('costsStatus', e.target.value)} />
                        <SelectField label='Bourses' options={ref?.scholarships ?? []} value={s.scholarship} onChange={(e) => set('scholarship', e.target.value)} />
                        <SelectField label='Hébergement' options={ref?.housing ?? []} value={s.housing} onChange={(e) => set('housing', e.target.value)} />
                    </Grid>
                    <div className='flex flex-col gap-2'>
                        <span className='text-sm font-semibold text-secondary'>Autres frais</span>
                        {s.otherFees.map((fee, i) => (
                            <div key={i} className='grid grid-cols-[1fr_8rem_auto] gap-2 items-end'>
                                <TextField label='Intitulé du frais' value={fee.label} onChange={(e) => set('otherFees', s.otherFees.map((f, j) => (j === i ? { ...f, label: e.target.value } : f)))} />
                                <TextField label='Montant (Ar)' inputMode='numeric' placeholder='?' value={fee.amount} onChange={(e) => set('otherFees', s.otherFees.map((f, j) => (j === i ? { ...f, amount: e.target.value } : f)))} />
                                <Button type='button' variant='ghost' aria-label='Retirer ce frais' onClick={() => set('otherFees', s.otherFees.filter((_, j) => j !== i))}><Icon icon='tabler:trash' /></Button>
                            </div>
                        ))}
                        <Button type='button' variant='secondary' className='w-fit' onClick={() => set('otherFees', [...s.otherFees, { label: '', amount: '' }])}>
                            <Icon icon='tabler:plus' /> Ajouter un frais
                        </Button>
                    </div>
                    <ListField label='Modalités de paiement' placeholder='Ex. : Mensuel, Trimestriel' value={s.paymentOptions} onChange={(v) => set('paymentOptions', v)} />
                    <TextArea label='Bourses : précisions' rows={2} value={s.scholarshipsInfo} onChange={(e) => set('scholarshipsInfo', e.target.value)} />
                    <TextArea label='Réductions' rows={2} value={s.discounts} onChange={(e) => set('discounts', e.target.value)} />
                </div>
            </Panel>

            <Panel title='Organisation et calendrier'>
                <div className='flex flex-col gap-4'>
                    <Grid>
                        <TextField label="Début des inscriptions" type='date' value={s.registrationStart} onChange={(e) => set('registrationStart', e.target.value)} error={err('registrationPeriod.start')} />
                        <TextField label='Fin des inscriptions' type='date' value={s.registrationEnd} onChange={(e) => set('registrationEnd', e.target.value)} error={err('registrationPeriod.end')} />
                        <TextField label='Date de rentrée' type='date' value={s.startDate} onChange={(e) => set('startDate', e.target.value)} error={err('startDate')} />
                        <TextField label='Horaires' placeholder='Ex. : du lundi au vendredi, 8 h – 12 h' value={s.schedule} onChange={(e) => set('schedule', e.target.value)} />
                        <TextField label='Lieu des cours' className='sm:col-span-2' value={s.campus} onChange={(e) => set('campus', e.target.value)} />
                    </Grid>
                    <ListField label='Rythme' placeholder='Ex. : Temps plein, Cours du soir' value={s.rhythm} onChange={(v) => set('rhythm', v)} />
                    <div className='flex flex-col gap-2'>
                        <span className='text-sm font-semibold text-secondary'>Calendrier</span>
                        {s.academicCalendar.map((item, i) => (
                            <div key={i} className='grid grid-cols-1 sm:grid-cols-[1fr_11rem_auto] gap-2 items-end'>
                                <TextField label='Étape' value={item.label} onChange={(e) => set('academicCalendar', s.academicCalendar.map((c, j) => (j === i ? { ...c, label: e.target.value } : c)))} />
                                <TextField label='Date' type='date' value={item.date} onChange={(e) => set('academicCalendar', s.academicCalendar.map((c, j) => (j === i ? { ...c, date: e.target.value } : c)))} />
                                <Button type='button' variant='ghost' aria-label='Retirer cette étape' onClick={() => set('academicCalendar', s.academicCalendar.filter((_, j) => j !== i))}><Icon icon='tabler:trash' /></Button>
                            </div>
                        ))}
                        <Button type='button' variant='secondary' className='w-fit' onClick={() => set('academicCalendar', [...s.academicCalendar, { label: '', date: '' }])}>
                            <Icon icon='tabler:plus' /> Ajouter une étape
                        </Button>
                    </div>
                </div>
            </Panel>

            {fields.careers && (
                <Panel title='Débouchés' description='Uniquement les partenariats confirmés.'>
                    <div className='flex flex-col gap-4'>
                        <ListField label='Métiers' value={s.jobs} onChange={(v) => set('jobs', v)} />
                        <ListField label="Secteurs d'activité" value={s.sectors} onChange={(v) => set('sectors', v)} />
                        <ListField label="Poursuite d'études" value={s.furtherStudies} onChange={(v) => set('furtherStudies', v)} />
                        <TextArea label='Stage' rows={2} value={s.internship} onChange={(e) => set('internship', e.target.value)} />
                        <ListField label='Partenariats' value={s.partnerships} onChange={(v) => set('partnerships', v)} />
                    </div>
                </Panel>
            )}

            <Panel title='Candidature'>
                <div className='flex flex-col gap-4'>
                    <Checkbox
                        label='Recevoir les candidatures en ligne'
                        hint='Les étudiants postulent depuis Edumada avec leurs documents ; vous suivez les dossiers dans « Demandes ».'
                        checked={s.onlineApplication}
                        onChange={(e) => set('onlineApplication', e.target.checked)}
                    />
                    <TextField label='Brochure (lien vers un PDF)' type='url' placeholder='https://' value={s.brochureUrl} onChange={(e) => set('brochureUrl', e.target.value)} error={err('details.brochureUrl')} />
                </div>
            </Panel>

            <div className='sticky bottom-0 z-20 -mx-4 flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-100 bg-white/95 px-4 py-3 backdrop-blur-sm sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0'>
                <Button type='button' variant='ghost' onClick={() => router.back()}>Annuler</Button>
                {offer ? (
                    <>
                        <Button type='submit' variant={offer.status === 'published' ? 'primary' : 'secondary'} loading={saving === 'save'}>
                            <Icon icon='tabler:device-floppy' /> Enregistrer
                        </Button>
                        {offer.status !== 'published' && (
                            <Button type='button' loading={saving === 'published'} onClick={() => save('published')}>Enregistrer et publier</Button>
                        )}
                    </>
                ) : (
                    <>
                        <Button type='submit' variant='secondary' loading={saving === 'draft'}>Enregistrer le brouillon</Button>
                        <Button type='button' loading={saving === 'published'} onClick={() => save('published')}>Publier</Button>
                    </>
                )}
            </div>
        </form>
    )
}

export default OfferForm
