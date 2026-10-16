'use client'
import Link from 'next/link'
import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Icon } from '@iconify/react/dist/iconify.js'
import Logo from '@/components/layout/header/Logo'
import { Button, FormAlert, SelectField, TextField } from '@/components/ui/form'
import { ApiError, apiEnabled } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useAuth } from '../AuthProvider'
import { SPACE_HOME } from '../types'
import { nextUrl } from './SignIn'

const ACCOUNT_TYPES = [
    { value: 'student', icon: 'tabler:school', title: 'Étudiant ou parent', text: 'Favoris, demandes et candidatures' },
    { value: 'establishment', icon: 'tabler:building-community', title: 'Établissement', text: 'Présenter vos offres, gratuitement' },
] as const

export const STUDY_LEVELS = ['Primaire', 'Collège', 'Lycée', 'BAC', 'BAC+2', 'BAC+3', 'BAC+5 et plus', 'Autre']

const SignUp = ({ onSuccess }: { onSuccess?: () => void }) => {
    const { register } = useAuth()
    const router = useRouter()
    const [accountType, setAccountType] = useState<'student' | 'establishment'>('student')
    const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '', city: '', studyLevel: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<ApiError | null>(null)
    const [ready, setReady] = useState(false)
    // /signup/?type=etablissement : lien « Référencer mon établissement ».
    useEffect(() => {
        setReady(true)
        if (new URLSearchParams(window.location.search).get('type') === 'etablissement') setAccountType('establishment')
    }, [])
    const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value })

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const user = await register({ ...form, accountType })
            toast.success('Votre compte est créé.')
            onSuccess?.()
            router.push(nextUrl() ?? (user.role === 'establishment' ? '/espace/etablissement/nouveau/' : SPACE_HOME[user.role]))
        } catch (err) {
            setError(err as ApiError)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className='mb-6 text-center mx-auto inline-block max-w-[160px]'>
                <Logo />
            </div>

            {!apiEnabled && <FormAlert tone='info'>L&apos;inscription sera disponible quand le service en ligne d&apos;Edumada sera activé.</FormAlert>}

            <form onSubmit={submit} className='mt-2 flex flex-col gap-4 text-left' noValidate>
                <fieldset className='grid grid-cols-2 gap-3'>
                    <legend className='mb-2 text-sm font-semibold text-secondary'>Je crée un compte</legend>
                    {ACCOUNT_TYPES.map((type) => (
                        <label
                            key={type.value}
                            className={cn(
                                'flex flex-col gap-1 rounded-xl border-2 p-3 transition-colors hover:cursor-pointer',
                                accountType === type.value ? 'border-primary bg-cream/60' : 'border-gray-200 hover:border-primary/40'
                            )}>
                            <input
                                type='radio'
                                name='accountType'
                                value={type.value}
                                checked={accountType === type.value}
                                onChange={() => setAccountType(type.value)}
                                className='sr-only'
                            />
                            <Icon icon={type.icon} className='text-2xl text-primary' />
                            <span className='font-semibold text-secondary leading-tight'>{type.title}</span>
                            <span className='text-xs text-ink/60'>{type.text}</span>
                        </label>
                    ))}
                </fieldset>

                {error && Object.keys(error.errors).length === 0 && <FormAlert>{error.message}</FormAlert>}

                <TextField label={accountType === 'student' ? 'Nom complet' : 'Votre nom (responsable)'} autoComplete='name' required value={form.name} onChange={set('name')} error={error?.field('name')} />
                <TextField label='Adresse e-mail' type='email' autoComplete='email' required value={form.email} onChange={set('email')} error={error?.field('email')} />
                <TextField
                    label='Mot de passe'
                    type='password'
                    autoComplete='new-password'
                    required
                    hint='8 caractères au moins, avec des lettres et des chiffres.'
                    value={form.password}
                    onChange={set('password')}
                    error={error?.field('password')}
                />
                <TextField label='Confirmez le mot de passe' type='password' autoComplete='new-password' required value={form.password_confirmation} onChange={set('password_confirmation')} />

                {accountType === 'student' && (
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        <TextField label='Ville' autoComplete='address-level2' value={form.city} onChange={set('city')} />
                        <SelectField label="Niveau d'études" placeholder='Choisir…' options={STUDY_LEVELS} value={form.studyLevel} onChange={set('studyLevel')} />
                    </div>
                )}

                <Button type='submit' loading={loading} disabled={!apiEnabled || !ready} className='mt-2 w-full py-3 text-lg'>
                    Créer mon compte
                </Button>
            </form>

            <p className='mt-5 text-sm text-ink/70'>
                En créant un compte, vous acceptez nos{' '}
                <Link href='/conditions/' className='text-primary hover:underline'>conditions d&apos;utilisation</Link> et notre{' '}
                <Link href='/confidentialite/' className='text-primary hover:underline'>politique de confidentialité</Link>.
            </p>
            <p className='mt-3 text-base text-ink'>
                Vous avez déjà un compte ?
                <Link href='/signin/' onClick={onSuccess} className='pl-2 font-semibold text-primary hover:underline'>
                    Se connecter
                </Link>
            </p>
        </>
    )
}

export default SignUp
