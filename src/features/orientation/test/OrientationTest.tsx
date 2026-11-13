'use client'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Icon } from '@/components/ui/icon'
import { Button, ButtonLink } from '@/components/ui/form'
import { useSiteData } from '@/data/site-data'
import { useAuth } from '@/features/auth/AuthProvider'
import FormationCard from '@/features/formations/components/FormationCard'
import type { FormationType } from '@/features/formations/types'
import { offerDiplomaNames, offerDuration } from '@/features/formations/format'
import { cn } from '@/lib/utils'
import { computeScores, PROFILE_ORDER, PROFILES, QUESTIONS, recommendDomains, type Answers, type ProfileCode } from './data'

const STORAGE_KEY = 'edumada.orientation.answers'
const emptyAnswers = (): Answers => QUESTIONS.map(() => null)

function readAnswers(): Answers | null {
    try {
        const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')
        return Array.isArray(saved) && saved.length === QUESTIONS.length ? saved : null
    } catch {
        return null
    }
}

function writeAnswers(answers: Answers | null) {
    try {
        if (answers) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(answers))
        else window.localStorage.removeItem(STORAGE_KEY)
    } catch {
        // sans importance : le test fonctionne sans sauvegarde
    }
}

function Intro({ onStart, resume }: { onStart: () => void; resume: boolean }) {
    return (
        <div className='mobile-center flex flex-col gap-8'>
            <div className='flex max-w-3xl flex-col gap-4'>
                <p className='font-semibold uppercase tracking-wide text-primary'>Test d’orientation</p>
                <h1 className='text-3xl font-bold text-secondary md:text-5xl'>Quel domaine d’études vous correspond ?</h1>
                <p className='text-black'>12 questions, environ 3 minutes, sans inscription. Vous découvrez votre profil, les domaines qui vous correspondent et les formations disponibles sur Edumada.</p>
                <Button onClick={onStart} className='w-full py-3 sm:w-fit'>
                    {resume ? 'Reprendre mon test' : 'Commencer mon test'}
                    <Icon icon='tabler:arrow-right' />
                </Button>
            </div>
            <ul className='grid grid-cols-2 gap-3 text-left lg:grid-cols-3'>
                {PROFILE_ORDER.map((code) => (
                    <li key={code} className='flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-4 sm:flex-row sm:gap-3'>
                        <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white'>
                            <Icon icon={PROFILES[code].icon} className='text-xl' />
                        </span>
                        <div>
                            <h2 className='text-base font-semibold text-secondary'>{PROFILES[code].name}</h2>
                            <p className='text-sm text-ink/70'>{PROFILES[code].strengths.join(', ')}</p>
                        </div>
                    </li>
                ))}
            </ul>
            <p className='text-sm text-ink/60'>Ce test s’inspire du modèle RIASEC de John Holland. C’est une aide à la réflexion, pas un diagnostic psychologique ni une garantie de réussite.</p>
        </div>
    )
}

function Quiz({ answers, onAnswer, onDone }: { answers: Answers; onAnswer: (index: number, profile: ProfileCode) => void; onDone: () => void }) {
    const [index, setIndex] = useState(() => {
        const next = answers.findIndex((a) => a === null)
        return next === -1 ? QUESTIONS.length - 1 : next
    })
    const question = QUESTIONS[index]
    const last = index === QUESTIONS.length - 1
    const done = answers.filter(Boolean).length
    const complete = done === QUESTIONS.length

    const choose = (profile: ProfileCode) => {
        onAnswer(index, profile)
        if (!last) window.setTimeout(() => setIndex((i) => Math.min(i + 1, QUESTIONS.length - 1)), 180)
    }

    return (
        <div className='mx-auto flex max-w-2xl flex-col gap-6'>
            <div>
                <p className='mb-2 text-sm font-semibold text-secondary'>
                    Question {index + 1} sur {QUESTIONS.length}
                </p>
                <div className='h-2 overflow-hidden rounded-full bg-secondary/10' role='progressbar' aria-label='Progression du test' aria-valuemin={0} aria-valuemax={QUESTIONS.length} aria-valuenow={done}>
                    <div className='h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none' style={{ width: `${(done / QUESTIONS.length) * 100}%` }} />
                </div>
            </div>
            <h1 className='text-2xl font-bold text-secondary sm:text-3xl'>{question.text}</h1>
            <ul className='flex flex-col gap-3'>
                {question.answers.map((answer) => {
                    const selected = answers[index] === answer.profile
                    return (
                        <li key={answer.profile}>
                            <button
                                type='button'
                                aria-pressed={selected}
                                onClick={() => choose(answer.profile)}
                                className={cn(
                                    'flex min-h-14 w-full items-center gap-3 rounded-xl border-2 bg-white px-4 py-3 text-left font-medium text-secondary transition-colors hover:cursor-pointer hover:border-primary',
                                    selected ? 'border-primary bg-cream' : 'border-gray-200'
                                )}>
                                <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2', selected ? 'border-primary bg-primary text-white' : 'border-gray-300')}>
                                    {selected && <Icon icon='tabler:check' className='text-sm' />}
                                </span>
                                {answer.text}
                            </button>
                        </li>
                    )
                })}
            </ul>
            <div className='flex items-center justify-between gap-3'>
                <Button variant='secondary' disabled={index === 0} onClick={() => setIndex(index - 1)}>
                    <Icon icon='tabler:arrow-left' />
                    Précédent
                </Button>
                {last ? (
                    <Button disabled={!complete} onClick={onDone}>
                        Voir mon résultat
                        <Icon icon='tabler:arrow-right' />
                    </Button>
                ) : (
                    <Button variant='secondary' disabled={!answers[index]} onClick={() => setIndex(index + 1)}>
                        Suivant
                        <Icon icon='tabler:arrow-right' />
                    </Button>
                )}
            </div>
        </div>
    )
}

/** Une filière : les offres d'un domaine qui portent le même intitulé (ex. « Génie logiciel », « Coupe et couture »). */
type Field = { key: string; name: string; level: string; duration: string; schools: number; offers: FormationType[] }

const fieldKey = (title: string) => title.trim().toLocaleLowerCase('fr').replace(/\s+/g, ' ')

/** Ordre des niveaux, du plus court au plus long ; les autres diplômes viennent ensuite. */
const LEVEL_ORDER = ['Attestation', 'Certificat', 'CAP', 'BT', 'BTS', 'Licence', 'Master', 'Master 1', 'Master 2', 'Doctorat']
const levelRank = (level: string) => {
    const i = LEVEL_ORDER.indexOf(level)
    return i === -1 ? LEVEL_ORDER.length : i
}

function fieldsOf(offers: FormationType[]): Field[] {
    const groups = new Map<string, FormationType[]>()
    for (const offer of offers) {
        const key = fieldKey(offer.title)
        groups.set(key, [...(groups.get(key) ?? []), offer])
    }
    return [...groups.entries()]
        .map(([key, list]) => ({
            key,
            name: list[0].title.trim(),
            level: offerDiplomaNames(list[0])[0] ?? 'Autre',
            duration: offerDuration(list[0]),
            schools: new Set(list.map((o) => o.schoolId)).size,
            offers: list,
        }))
        .sort((a, b) => levelRank(a.level) - levelRank(b.level) || a.name.localeCompare(b.name, 'fr'))
}

const plural = (n: number) => `${n} formation${n > 1 ? 's' : ''}`
const schoolsLabel = (n: number) => `${n} établissement${n > 1 ? 's' : ''}`

const stepLabel = 'text-sm font-bold uppercase tracking-[0.08em] text-primary'
const card = 'rounded-xl border border-gray-200 bg-white'

type StepState = 'done' | 'current' | 'todo'

/** Progression du parcours : Profil → Domaine → Filière → Établissement. */
function Stepper({ steps }: { steps: { label: string; state: StepState }[] }) {
    return (
        <ol aria-label='Progression' className='grid grid-cols-4 gap-2'>
            {steps.map((step, i) => (
                <li key={step.label} aria-current={step.state === 'current' ? 'step' : undefined} className='flex flex-col gap-2'>
                    <span className={cn('h-1 rounded-full', step.state === 'todo' ? 'bg-secondary/15' : step.state === 'current' ? 'bg-primary' : 'bg-secondary')} />
                    <span className={cn('flex flex-col items-start gap-1 text-xs font-semibold sm:flex-row sm:items-center sm:gap-2 sm:text-sm', step.state === 'todo' ? 'text-ink/60' : 'text-secondary')}>
                        <span
                            className={cn(
                                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs sm:h-6 sm:w-6',
                                step.state === 'todo' ? 'bg-secondary/15 text-ink/70' : step.state === 'current' ? 'bg-primary text-white' : 'bg-secondary text-white'
                            )}>
                            {step.state === 'done' ? <Icon icon='tabler:check' /> : i + 1}
                        </span>
                        {step.label}
                    </span>
                </li>
            ))}
        </ol>
    )
}

/** Résultat du test : profil, puis étape par étape domaine → filière → formations de la filière. */
function Results({ answers, onRestart }: { answers: Answers; onRestart: () => void }) {
    const { data: formations, loading } = useSiteData('FormationData')
    const { isFavorite, toggleFavorite } = useAuth()
    const scores = useMemo(() => computeScores(answers), [answers])
    const top = useMemo(() => scores.slice(0, 3).map((s) => s.code), [scores])
    const [main, ...others] = top
    const domains = useMemo(() => recommendDomains(top), [top])
    const profile = PROFILES[main]

    // Le premier domaine (le plus proche du profil) est ouvert d'emblée.
    const [domainName, setDomainName] = useState<string | null>(() => domains[0]?.name ?? null)
    const [fieldKeyValue, setFieldKeyValue] = useState<string | null>(null)
    const [level, setLevel] = useState('Tous')
    const fieldsRef = useRef<HTMLDivElement>(null)
    const offersRef = useRef<HTMLDivElement>(null)

    const offersByDomain = useMemo(() => {
        const map = new Map<string, FormationType[]>()
        for (const f of formations) if (f.kind === 'formation' && f.domain) map.set(f.domain, [...(map.get(f.domain) ?? []), f])
        return map
    }, [formations])
    const domain = domains.find((d) => d.name === domainName) ?? null
    const fields = useMemo(() => (domain ? fieldsOf(offersByDomain.get(domain.name) ?? []) : []), [domain, offersByDomain])
    const levels = useMemo(() => [...new Set(fields.map((f) => f.level))].sort((a, b) => levelRank(a) - levelRank(b)), [fields])
    const shownFields = level === 'Tous' ? fields : fields.filter((f) => f.level === level)
    const field = fields.find((f) => f.key === fieldKeyValue) ?? null

    const scrollTo = (ref: RefObject<HTMLDivElement | null>) => window.requestAnimationFrame(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    const chooseDomain = (name: string) => {
        setDomainName(name)
        setFieldKeyValue(null)
        setLevel('Tous')
        scrollTo(fieldsRef)
    }
    const chooseField = (key: string) => {
        setFieldKeyValue(key)
        scrollTo(offersRef)
    }

    const steps: { label: string; state: StepState }[] = [
        { label: 'Profil', state: 'done' },
        { label: 'Domaine', state: domain ? 'done' : 'current' },
        { label: 'Filière', state: field ? 'done' : domain ? 'current' : 'todo' },
        { label: 'Établissement', state: field ? 'current' : 'todo' },
    ]

    return (
        <div className='mx-auto flex w-full max-w-5xl flex-col gap-12 lg:gap-14'>
            {/* Titre et progression */}
            <div className='flex flex-col gap-5'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
                    <div>
                        <p className='mb-1 text-sm font-semibold text-ink/70'>Test d’orientation · Résultat</p>
                        <h1 className='text-2xl font-bold text-secondary md:text-4xl'>Votre parcours, étape par étape</h1>
                    </div>
                    <Button variant='secondary' className='w-full shrink-0 sm:w-fit' onClick={onRestart}>
                        <Icon icon='tabler:rotate' />
                        Recommencer le test
                    </Button>
                </div>
                <Stepper steps={steps} />
            </div>

            {/* Profil */}
            <section aria-labelledby='profil-title' className='grid gap-4 py-0 lg:grid-cols-2 lg:gap-6'>
                <div className={cn(card, 'flex flex-col gap-5 p-6 sm:p-8')}>
                    <div className='flex flex-wrap items-center justify-between gap-3'>
                        <span className={stepLabel}>Votre profil dominant</span>
                        <span aria-label={`Code Holland ${top.join('')}`} className='flex gap-1'>
                            {top.map((code, i) => (
                                <span key={code} aria-hidden='true' className={cn('flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold text-white', i === 0 ? 'bg-primary' : 'bg-secondary')}>
                                    {code}
                                </span>
                            ))}
                        </span>
                    </div>
                    <div className='flex items-center gap-4'>
                        <span className='flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary text-white'>
                            <Icon icon={profile.icon} className='text-3xl' />
                        </span>
                        <h2 id='profil-title' className='text-3xl font-bold text-secondary'>
                            {profile.name}
                        </h2>
                    </div>
                    <p className='text-lg text-black'>{profile.summary}</p>
                    <ul aria-label='Qualités' className='flex flex-wrap gap-2'>
                        {profile.strengths.map((strength) => (
                            <li key={strength} className='rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-secondary'>
                                {strength}
                            </li>
                        ))}
                    </ul>
                    <p className='border-t border-gray-200 pt-5 text-black'>
                        <strong>Vos autres tendances :</strong> {others.map((code) => PROFILES[code].name).join(' et ')}. {others.map((code) => PROFILES[code].summary).join(' ')}
                    </p>
                </div>

                <div className={cn(card, 'flex flex-col gap-5 p-6 sm:p-8')}>
                    <div className='flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1'>
                        <h2 className='text-xl font-bold text-secondary'>Vos six profils</h2>
                        <span className='text-sm text-ink/70'>Les 3 premiers forment votre code</span>
                    </div>
                    <ul className='flex flex-col gap-4'>
                        {scores.map((score, i) => {
                            const inCode = i < 3
                            return (
                                <li key={score.code} className='grid grid-cols-[1.75rem_minmax(0,1fr)_3.5rem] items-center gap-3'>
                                    <span
                                        aria-hidden='true'
                                        className={cn('flex h-7 w-7 items-center justify-center rounded-md text-sm font-semibold', i === 0 ? 'bg-primary text-white' : inCode ? 'bg-secondary text-white' : 'bg-gray-100 text-ink/70')}>
                                        {score.code}
                                    </span>
                                    <div className='flex flex-col gap-1.5'>
                                        <span className={cn('text-[15px] font-semibold', inCode ? 'text-black' : 'text-ink/70')}>{PROFILES[score.code].name}</span>
                                        <span role='progressbar' aria-label={PROFILES[score.code].name} aria-valuemin={0} aria-valuemax={100} aria-valuenow={score.percent} className='block h-2 overflow-hidden rounded-full bg-gray-100'>
                                            <span className={cn('block h-full rounded-full', i === 0 ? 'bg-primary' : inCode ? 'bg-secondary' : 'bg-secondary/40')} style={{ width: `${score.percent}%` }} />
                                        </span>
                                    </div>
                                    <span className={cn('whitespace-nowrap text-right font-semibold tabular-nums', inCode ? 'text-black' : 'text-ink/70')}>{score.percent} %</span>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </section>

            {/* 1. Domaines */}
            <section aria-labelledby='domaines-title' className='flex flex-col gap-4 py-0'>
                <div>
                    <p className={cn(stepLabel, 'mb-1')}>Étape 1 · Domaine</p>
                    <h2 id='domaines-title' className='text-2xl font-bold text-secondary'>
                        Les domaines qui vous correspondent
                    </h2>
                    <p className='text-black'>Choisissez un domaine pour découvrir ses filières.</p>
                </div>
                <ul className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6'>
                    {domains.map((d) => {
                        const selected = d.name === domainName
                        const count = offersByDomain.get(d.name)?.length ?? 0
                        return (
                            <li key={d.name}>
                                <button
                                    type='button'
                                    aria-pressed={selected}
                                    onClick={() => chooseDomain(d.name)}
                                    className={cn(
                                        'flex h-full w-full flex-col gap-3 rounded-xl border-2 bg-white p-5 text-left transition hover:cursor-pointer hover:border-primary sm:p-7',
                                        selected ? 'border-primary shadow-lg shadow-primary/20' : 'border-gray-200'
                                    )}>
                                    <span className='flex w-full items-center justify-between gap-3'>
                                        <Icon icon={d.icon} className='text-2xl text-primary' />
                                        <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2', selected ? 'border-primary bg-primary text-white' : 'border-gray-300')}>
                                            {selected && <Icon icon='tabler:check' className='text-sm' />}
                                        </span>
                                    </span>
                                    <span className='text-lg font-semibold leading-snug text-black'>{d.name}</span>
                                    <span className='flex-1 text-[15px] text-ink'>{d.description}</span>
                                    <span className='flex w-full flex-col items-start gap-2 border-t border-gray-200 pt-3'>
                                        <span className='text-sm text-ink/70'>Lié à votre profil {d.matched.map((code) => PROFILES[code].name).join(' et ')}</span>
                                        {!loading && <span className={cn('rounded-lg px-2.5 py-0.5 text-sm font-bold', selected ? 'bg-primary text-white' : 'bg-gray-100 text-ink')}>{plural(count)}</span>}
                                    </span>
                                </button>
                            </li>
                        )
                    })}
                </ul>
            </section>

            {/* 2. Filières du domaine choisi */}
            {domain && (
                <section ref={fieldsRef} aria-labelledby='filieres-title' className='flex scroll-mt-28 flex-col gap-4 py-0'>
                    <div className='flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
                        <div>
                            <p className={cn(stepLabel, 'mb-1')}>Étape 2 · Filière</p>
                            <h2 id='filieres-title' className='text-2xl font-bold text-secondary'>
                                Les filières en {domain.name}
                            </h2>
                            <p className='text-ink/70'>Métiers possibles : {domain.jobs.join(', ')}.</p>
                        </div>
                        {levels.length > 1 && (
                            <div role='group' aria-label='Niveau' className='flex flex-wrap gap-1.5'>
                                {['Tous', ...levels].map((l) => {
                                    const active = l === level
                                    const n = l === 'Tous' ? fields.length : fields.filter((f) => f.level === l).length
                                    return (
                                        <button
                                            key={l}
                                            type='button'
                                            aria-pressed={active}
                                            onClick={() => setLevel(l)}
                                            className={cn(
                                                'flex min-h-10 items-center gap-1.5 rounded-lg border px-3.5 text-sm font-semibold transition-colors hover:cursor-pointer',
                                                active ? 'border-secondary bg-secondary text-white' : 'border-gray-300 bg-white text-secondary hover:border-secondary'
                                            )}>
                                            {l} <span className='text-xs opacity-80'>{n}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                    {loading ? (
                        <p className='text-sm text-ink/60'>Chargement des filières…</p>
                    ) : fields.length === 0 ? (
                        <p className={cn(card, 'p-4 text-black')}>Aucune formation dans ce domaine sur Edumada pour le moment.</p>
                    ) : (
                        <ul className={cn(card, 'divide-y divide-gray-200 overflow-hidden')}>
                            {shownFields.map((f) => {
                                const selected = f.key === fieldKeyValue
                                return (
                                    <li key={f.key}>
                                        <button
                                            type='button'
                                            aria-pressed={selected}
                                            onClick={() => chooseField(f.key)}
                                            className={cn(
                                                'grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 text-left transition-colors hover:cursor-pointer hover:bg-offwhite sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:gap-5 sm:px-7 sm:py-5',
                                                selected && 'bg-cream hover:bg-cream'
                                            )}>
                                            <span className='hidden justify-self-start rounded-md border border-gray-300 bg-white px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-secondary sm:block'>{f.level}</span>
                                            <span className='flex min-w-0 flex-col gap-0.5'>
                                                <span className='w-fit rounded-md border border-gray-300 bg-white px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-secondary sm:hidden'>{f.level}</span>
                                                <span className='text-[17px] font-bold text-black'>{f.name}</span>
                                                <span className='text-sm text-ink/70'>
                                                    {f.duration} · {schoolsLabel(f.schools)}
                                                </span>
                                            </span>
                                            <span className='flex min-h-12 items-center gap-2 font-semibold text-primary sm:px-4 sm:text-lg'>
                                                <span className='hidden sm:inline'>Voir</span>
                                                <Icon icon='tabler:arrow-right' className='text-xl' />
                                            </span>
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </section>
            )}

            {/* 3. Formations de la filière choisie */}
            {domain && field && (
                <section ref={offersRef} aria-labelledby='formations-title' className='flex scroll-mt-28 flex-col gap-4 py-0'>
                    <div>
                        <p className={cn(stepLabel, 'mb-1')}>Étape 3 · Établissement</p>
                        <h2 id='formations-title' className='text-2xl font-bold text-secondary'>
                            {field.name}
                        </h2>
                        <p className='text-black'>
                            {plural(field.offers.length)} en {domain.name} sur Edumada.
                        </p>
                    </div>
                    <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
                        {field.offers.map((formation) => (
                            <FormationCard key={formation.id} formation={formation} isFavorite={isFavorite(formation.id)} onToggleFavorite={() => toggleFavorite(formation.id)} compact />
                        ))}
                    </div>
                    <ButtonLink href={`/recherche?domaine=${encodeURIComponent(domain.name)}`} variant='secondary' className='w-fit'>
                        Voir toutes les formations en {domain.name}
                    </ButtonLink>
                </section>
            )}

            <div role='note' className={cn(card, 'flex items-start gap-3 px-5 py-4 text-[15px] text-ink')}>
                <Icon icon='tabler:info-circle' className='mt-0.5 shrink-0 text-xl text-secondary' />
                <span>Ce résultat est une aide à la réflexion, pas un diagnostic ni une garantie de réussite. Il reste enregistré dans ce navigateur.</span>
            </div>
        </div>
    )
}

/** Test d'orientation : présentation, 12 questions, puis résultat relié au catalogue. */
export default function OrientationTest() {
    const [answers, setAnswers] = useState<Answers>(emptyAnswers)
    const [step, setStep] = useState<'intro' | 'quiz' | 'results'>('intro')

    useEffect(() => {
        const saved = readAnswers()
        if (!saved) return
        setAnswers(saved)
        if (saved.every(Boolean)) setStep('results')
    }, [])

    useEffect(() => {
        window.scrollTo({ top: 0 })
    }, [step])

    const answer = (index: number, profile: ProfileCode) => {
        const next = answers.map((a, i) => (i === index ? profile : a))
        setAnswers(next)
        writeAnswers(next)
    }
    const restart = () => {
        writeAnswers(null)
        setAnswers(emptyAnswers())
        setStep('intro')
    }

    return (
        <section className='pt-28 pb-20 sm:pt-32'>
            <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                {step === 'intro' && <Intro resume={answers.some(Boolean)} onStart={() => setStep('quiz')} />}
                {step === 'quiz' && <Quiz answers={answers} onAnswer={answer} onDone={() => setStep('results')} />}
                {step === 'results' && <Results answers={answers} onRestart={restart} />}
            </div>
        </section>
    )
}
