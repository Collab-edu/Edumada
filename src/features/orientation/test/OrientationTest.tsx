'use client'
import { useEffect, useMemo, useState } from 'react'
import { Icon } from '@/components/ui/icon'
import { Button, ButtonLink } from '@/components/ui/form'
import { useSiteData } from '@/data/site-data'
import { useAuth } from '@/features/auth/AuthProvider'
import FormationCard from '@/features/formations/components/FormationCard'
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

function Results({ answers, onRestart }: { answers: Answers; onRestart: () => void }) {
    const { data: formations, loading } = useSiteData('FormationData')
    const { isFavorite, toggleFavorite } = useAuth()
    const scores = useMemo(() => computeScores(answers), [answers])
    const top = scores.slice(0, 3).map((s) => s.code)
    const [main, ...others] = top
    const domains = useMemo(() => recommendDomains(top), [top])
    const profile = PROFILES[main]

    return (
        <div className='flex flex-col gap-10'>
            <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]'>
                <div className='flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8'>
                    <p className='font-semibold uppercase tracking-wide text-primary'>Votre profil · {top.join('')}</p>
                    <div className='flex items-center gap-3'>
                        <span className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-white'>
                            <Icon icon={profile.icon} className='text-3xl' />
                        </span>
                        <h1 className='text-3xl font-bold text-secondary'>{profile.name}</h1>
                    </div>
                    <p className='text-black'>{profile.summary}</p>
                    <ul className='flex flex-wrap gap-2'>
                        {profile.strengths.map((strength) => (
                            <li key={strength} className='rounded-full bg-secondary/[0.08] px-3 py-1 text-sm font-medium text-secondary'>
                                {strength}
                            </li>
                        ))}
                    </ul>
                    <p className='text-black'>
                        <strong className='text-secondary'>Vos autres tendances :</strong> {others.map((code) => PROFILES[code].name).join(' et ')}. {others.map((code) => PROFILES[code].summary).join(' ')}
                    </p>
                </div>
                <div className='rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8'>
                    <h2 className='mb-4 text-xl font-bold text-secondary'>Vos six profils</h2>
                    <ul className='flex flex-col gap-3'>
                        {scores.map((score) => (
                            <li key={score.code}>
                                <div className='mb-1 flex justify-between gap-3 text-sm'>
                                    <span className='font-medium text-secondary'>{PROFILES[score.code].name}</span>
                                    <span className='text-ink'>{score.percent} %</span>
                                </div>
                                <div className='h-2 overflow-hidden rounded-full bg-secondary/10'>
                                    <div className='h-full rounded-full bg-secondary' style={{ width: `${score.percent}%` }} />
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className='flex flex-col gap-8'>
                <h2 className='text-2xl font-bold text-secondary'>Les domaines qui vous correspondent</h2>
                {domains.map((domain) => {
                    const offers = formations.filter((f) => f.domain === domain.name && f.kind === 'formation')
                    return (
                        <section key={domain.name} className='!p-0 flex flex-col gap-4'>
                            <div>
                                <h3 className='text-xl font-semibold text-secondary'>{domain.name}</h3>
                                <p className='text-black'>{domain.description}</p>
                                <p className='text-sm text-ink/70'>
                                    Lié à votre profil {domain.matched.map((code) => PROFILES[code].name).join(' et ')}. Métiers possibles : {domain.jobs.join(', ')}.
                                </p>
                            </div>
                            {loading ? (
                                <p className='text-sm text-ink/60'>Chargement des formations…</p>
                            ) : offers.length === 0 ? (
                                <p className='rounded-xl bg-white p-4 text-sm text-black'>Aucune formation dans ce domaine sur Edumada pour le moment.</p>
                            ) : (
                                <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'>
                                    {offers.slice(0, 4).map((formation) => (
                                        <FormationCard key={formation.id} formation={formation} isFavorite={isFavorite(formation.id)} onToggleFavorite={() => toggleFavorite(formation.id)} compact />
                                    ))}
                                </div>
                            )}
                            {offers.length > 4 && (
                                <ButtonLink href={`/recherche?domaine=${encodeURIComponent(domain.name)}`} variant='secondary' className='w-fit'>
                                    Voir les {offers.length} formations
                                </ButtonLink>
                            )}
                        </section>
                    )
                })}
            </div>

            <div className='flex flex-col gap-3 rounded-2xl bg-white p-6 ring-1 ring-gray-100 sm:flex-row sm:items-center sm:justify-between'>
                <p className='text-sm text-ink/70'>Ce résultat est une aide à la réflexion, pas un diagnostic ni une garantie de réussite. Il reste enregistré dans ce navigateur.</p>
                <Button variant='secondary' className='shrink-0' onClick={onRestart}>
                    <Icon icon='tabler:rotate-clockwise' />
                    Recommencer
                </Button>
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
