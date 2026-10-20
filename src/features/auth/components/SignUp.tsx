'use client'
import Link from 'next/link'
import { useEffect, useId, useState, type ComponentProps, type FormEvent, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Icon } from '@/components/ui/icon'
import { Button, FormAlert } from '@/components/ui/form'
import { ApiError, apiEnabled } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useAuth } from '../AuthProvider'
import { SPACE_HOME, backofficeUrl, goTo } from '../types'
import { nextUrl } from './SignIn'
import { ESTABLISHMENT_START } from '@/features/marketing/plans'

const ACCOUNT_TYPES = [
    { value: 'student', icon: 'tabler:school', title: 'Étudiant ou parent', text: 'Favoris, demandes et candidatures' },
    { value: 'establishment', icon: 'tabler:building-community', title: 'Établissement', text: 'Présenter vos offres, gratuitement' },
] as const

export const STUDY_LEVELS = ['Primaire', 'Collège', 'Lycée', 'BAC', 'BAC+2', 'BAC+3', 'BAC+5 et plus', 'Autre']

const inputClassName =
    'h-11 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-sm text-ink outline-hidden transition placeholder:text-ink/40 focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:bg-offwhite'

/** Libellé compact, aide et erreur autour d'un champ du formulaire d'inscription. */
function Row({ label, required, hint, error, className, children }: { label: string; required?: boolean; hint?: ReactNode; error?: string; className?: string; children: (id: string, describedBy?: string) => ReactNode }) {
    const id = useId()
    const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            <label htmlFor={id} className='text-xs font-semibold text-black'>
                {label}
                {required && <span className='text-primary'> *</span>}
            </label>
            {children(id, describedBy)}
            {error ? (
                <p id={`${id}-error`} className='text-xs text-primary'>{error}</p>
            ) : hint ? (
                <div id={`${id}-hint`} className='text-xs text-ink/60'>{hint}</div>
            ) : null}
        </div>
    )
}

function Input({ label, required, hint, error, className, ...props }: { label: string; hint?: ReactNode; error?: string } & ComponentProps<'input'>) {
    return (
        <Row label={label} required={required} hint={hint} error={error} className={className}>
            {(id, describedBy) => <input id={id} required={required} aria-invalid={!!error} aria-describedby={describedBy} className={cn(inputClassName, error && 'border-primary')} {...props} />}
        </Row>
    )
}

/** Force du mot de passe sur 4 : longueur, lettres + chiffres, majuscules, caractère spécial ou 12+. */
function strength(password: string) {
    if (!password) return 0
    let score = 0
    if (password.length >= 8) score++
    if (/[a-z]/i.test(password) && /\d/.test(password)) score++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
    if (/[^a-z0-9]/i.test(password) || password.length >= 12) score++
    return Math.max(1, score)
}
const STRENGTH = [
    { label: '', color: 'bg-gray-200' },
    { label: 'Trop faible', color: 'bg-primary' },
    { label: 'Moyen', color: 'bg-orange-400' },
    { label: 'Bon', color: 'bg-emerald-400' },
    { label: 'Excellent', color: 'bg-emerald-600' },
]

/**
 * Création de compte. `studentOnly` : compte étudiant uniquement, sans le choix du type de compte.
 * Le choix « Établissement » envoie vers les formules (/tarifs/), d'où part l'inscription établissement.
 */
const SignUp = ({ onSuccess, studentOnly = false }: { onSuccess?: () => void; studentOnly?: boolean }) => {
    const { register } = useAuth()
    const router = useRouter()
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', phone: '', city: '', studyLevel: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<ApiError | null>(null)
    const [ready, setReady] = useState(false)
    // Ancien lien /inscription/?type=etablissement : les établissements commencent par choisir leur formule.
    useEffect(() => {
        setReady(true)
        if (!studentOnly && new URLSearchParams(window.location.search).get('type') === 'etablissement') router.replace(ESTABLISHMENT_START)
    }, [studentOnly, router])
    const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value })
    const score = strength(form.password)
    const mismatch = form.password_confirmation !== '' && form.password_confirmation !== form.password

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const phone = form.phone.trim() ? `+261 ${form.phone.trim().replace(/^\+?261\s*/, '').replace(/^0/, '')}` : ''
            const user = await register({ ...form, phone, accountType: 'student' })
            toast.success('Votre compte est créé.')
            onSuccess?.()
            if (user.role === 'establishment') goTo(backofficeUrl(`/connexion?email=${encodeURIComponent(user.email)}`), router.push)
            else goTo(nextUrl() ?? SPACE_HOME.student, router.push)
        } catch (err) {
            setError(err as ApiError)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='text-left'>
            {!apiEnabled && <FormAlert tone='info'>L&apos;inscription sera disponible quand le service en ligne d&apos;Edumada sera activé.</FormAlert>}

            <form onSubmit={submit} className='flex flex-col gap-4' noValidate>
                {!studentOnly && (
                    <fieldset>
                        <legend className='mb-2 text-xs font-semibold text-black'>Je crée un compte</legend>
                        <div className='grid grid-cols-2 gap-1.5 rounded-xl bg-offwhite p-1.5'>
                            {ACCOUNT_TYPES.map((type) => {
                                const active = type.value === 'student'
                                return (
                                    <label
                                        key={type.value}
                                        className={cn(
                                            'flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-center transition hover:cursor-pointer',
                                            active ? 'border-primary bg-cream/50 shadow-sm' : 'border-transparent hover:bg-white'
                                        )}>
                                        <input
                                            type='radio'
                                            name='accountType'
                                            value={type.value}
                                            checked={active}
                                            onChange={() => {
                                                if (type.value === 'establishment') {
                                                    onSuccess?.()
                                                    router.push(ESTABLISHMENT_START)
                                                }
                                            }}
                                            className='sr-only'
                                        />
                                        <Icon icon={type.icon} className='text-xl text-primary' />
                                        <span className='text-sm font-semibold leading-tight text-secondary'>{type.title}</span>
                                        <span className='text-[11px] leading-snug text-ink/60'>{type.text}</span>
                                    </label>
                                )
                            })}
                        </div>
                    </fieldset>
                )}

                {error && Object.keys(error.errors).length === 0 && <FormAlert>{error.message}</FormAlert>}

                <Input label='Nom complet' autoComplete='name' required value={form.name} onChange={set('name')} error={error?.field('name')} />
                <Input label='Adresse e-mail' type='email' autoComplete='email' required value={form.email} onChange={set('email')} error={error?.field('email')} />

                <Row
                    label='Mot de passe'
                    required
                    error={error?.field('password')}
                    hint={
                        <>
                            <span className='mb-1.5 grid grid-cols-4 gap-1.5' aria-hidden='true'>
                                {[1, 2, 3, 4].map((n) => (
                                    <span key={n} className={cn('h-1 rounded-full transition-colors', n <= score ? STRENGTH[score].color : 'bg-gray-200')} />
                                ))}
                            </span>
                            8 caractères au moins, avec des lettres et des chiffres.
                            {score > 0 && <span className='sr-only'> Force : {STRENGTH[score].label}.</span>}
                        </>
                    }>
                    {(id, describedBy) => (
                        <div className='relative'>
                            <input
                                id={id}
                                type={showPassword ? 'text' : 'password'}
                                autoComplete='new-password'
                                required
                                aria-invalid={!!error?.field('password')}
                                aria-describedby={describedBy}
                                value={form.password}
                                onChange={set('password')}
                                className={cn(inputClassName, 'pr-20', error?.field('password') && 'border-primary')}
                            />
                            <button
                                type='button'
                                onClick={() => setShowPassword((v) => !v)}
                                aria-pressed={showPassword}
                                className='absolute inset-y-0 right-0 px-3.5 text-xs font-semibold text-black hover:text-primary hover:cursor-pointer'>
                                {showPassword ? 'Masquer' : 'Afficher'}
                            </button>
                        </div>
                    )}
                </Row>

                <Input
                    label='Confirmez le mot de passe'
                    type={showPassword ? 'text' : 'password'}
                    autoComplete='new-password'
                    required
                    value={form.password_confirmation}
                    onChange={set('password_confirmation')}
                    error={mismatch ? 'Les deux mots de passe ne correspondent pas.' : undefined}
                />

                <div className='flex items-center gap-3 pt-1 text-[11px] font-semibold tracking-wider text-ink/50 uppercase'>
                    <span className='h-px flex-1 bg-gray-200' />
                    Facultatif
                    <span className='h-px flex-1 bg-gray-200' />
                </div>

                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                    <Row label='Téléphone' error={error?.field('phone')}>
                        {(id, describedBy) => (
                            <div className='flex'>
                                <span className='inline-flex items-center rounded-l-lg border border-r-0 border-gray-200 bg-offwhite px-3 text-sm text-ink/70'>+261</span>
                                <input
                                    id={id}
                                    type='tel'
                                    autoComplete='tel-national'
                                    placeholder='034 00 000 00'
                                    aria-describedby={describedBy}
                                    value={form.phone}
                                    onChange={set('phone')}
                                    className={cn(inputClassName, 'rounded-l-none')}
                                />
                            </div>
                        )}
                    </Row>
                    <Input label='Ville' autoComplete='address-level2' value={form.city} onChange={set('city')} />
                </div>

                <Row label="Niveau d'études">
                    {(id) => (
                        <select id={id} value={form.studyLevel} onChange={set('studyLevel')} className={cn(inputClassName, 'hover:cursor-pointer')}>
                            <option value=''>Choisir…</option>
                            {STUDY_LEVELS.map((level) => (
                                <option key={level}>{level}</option>
                            ))}
                        </select>
                    )}
                </Row>

                <Button type='submit' loading={loading} disabled={!apiEnabled || !ready} className='mt-2 w-full py-3 text-base shadow-lg shadow-primary/25'>
                    Créer mon compte
                </Button>
            </form>

            <p className='mt-5 text-center text-xs text-ink/70'>
                En créant un compte, vous acceptez nos{' '}
                <Link href='/conditions/' className='text-primary hover:underline'>conditions d&apos;utilisation</Link> et notre{' '}
                <Link href='/confidentialite/' className='text-primary hover:underline'>politique de confidentialité</Link>.
            </p>
            <p className='mt-3 text-center text-sm text-black'>
                Vous avez déjà un compte ?
                <Link href='/signin/' onClick={onSuccess} className='pl-1 font-semibold text-primary hover:underline'>
                    Se connecter
                </Link>
            </p>
        </div>
    )
}

export default SignUp
