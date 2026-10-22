'use client'
import Link from 'next/link'
import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Logo from '@/components/layout/header/Logo'
import { Button, FormAlert, TextField } from '@/components/ui/form'
import { ApiError, apiEnabled } from '@/lib/api'
import { useAuth } from '../AuthProvider'
import { SPACE_HOME, backofficeUrl, goTo } from '../types'
import { Icon } from '@/components/ui/icon'

/** Adresse de retour demandée (?next=/formations/…), limitée au site lui-même. */
export function nextUrl(): string | null {
    if (typeof window === 'undefined') return null
    const next = new URLSearchParams(window.location.search).get('next')
    return next && next.startsWith('/') && !next.startsWith('//') ? next : null
}

const Signin = ({ onSuccess }: { onSuccess?: () => void }) => {
    const { login } = useAuth()
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<ApiError | null>(null)
    // Sur une connexion lente, on attend que la page soit interactive : sinon l'envoi recharge la page et perd la saisie.
    const [ready, setReady] = useState(false)
    useEffect(() => setReady(true), [])

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const user = await login(email, password)
            toast.success(`Bienvenue, ${user.name.split(' ')[0]} !`)
            onSuccess?.()
            if (user.role === 'student') goTo(nextUrl() ?? SPACE_HOME.student, router.push)
            else {
                toast('Votre espace de gestion est le back-office : connectez-vous-y avec le même compte.', { icon: <Icon icon='tabler:arrow-right' className='shrink-0 text-xl text-secondary' /> })
                goTo(backofficeUrl(`/connexion?email=${encodeURIComponent(user.email)}`), router.push)
            }
        } catch (err) {
            setError(err as ApiError)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className='mb-8 text-center mx-auto inline-block max-w-[160px]'>
                <Logo />
            </div>

            {!apiEnabled && <FormAlert tone='info'>La connexion sera disponible quand le service en ligne d&apos;Edumada sera activé.</FormAlert>}

            <form onSubmit={submit} className='mt-4 flex flex-col gap-4 text-left' noValidate>
                {error && !error.field('email') && <FormAlert>{error.message}</FormAlert>}
                <TextField
                    label='Adresse e-mail'
                    type='email'
                    autoComplete='email'
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={error?.field('email')}
                />
                <TextField
                    label='Mot de passe'
                    type='password'
                    autoComplete='current-password'
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={error?.field('password')}
                />
                <Link href='/mot-de-passe-oublie/' onClick={onSuccess} className='-mt-2 self-end text-sm font-semibold text-secondary hover:text-primary hover:underline'>
                    Mot de passe oublié ?
                </Link>
                <Button type='submit' loading={loading} disabled={!apiEnabled || !ready} className='mt-2 w-full py-3 text-lg'>
                    Se connecter
                </Button>
            </form>

            <p className='mt-6 text-center text-base text-black'>
                Pas encore de compte ?{' '}
                <Link href='/inscription/' onClick={onSuccess} className='font-semibold text-primary hover:underline'>
                    Créer un compte
                </Link>
            </p>
        </>
    )
}

export default Signin
