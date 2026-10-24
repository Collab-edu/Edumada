'use client'
import Link from '@/i18n/client'
import { useState, type FormEvent } from 'react'
import { Icon } from '@/components/ui/icon'
import { Button, FormAlert, TextField } from '@/components/ui/form'
import { ApiError, api, apiEnabled } from '@/lib/api'

/** Mot de passe oublié : l'API envoie un lien par e-mail pour en choisir un nouveau. */
export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<ApiError | null>(null)
    const [sent, setSent] = useState('')

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            setSent((await api<{ message: string }>('/auth/forgot-password', { method: 'POST', body: { email } })).message)
        } catch (err) {
            setError(err as ApiError)
        } finally {
            setLoading(false)
        }
    }

    if (sent) {
        return (
            <div className='flex flex-col items-center gap-4 text-center'>
                <span className='flex h-14 w-14 items-center justify-center rounded-full bg-success/30 text-secondary'>
                    <Icon icon='tabler:mail-check' className='text-3xl' />
                </span>
                <h2 className='text-xl font-bold text-secondary'>Vérifiez votre boîte mail</h2>
                <p className='text-black'>{sent}</p>
                <p className='text-sm text-ink/60'>Pensez à regarder dans les courriers indésirables. Le lien est valable 60 minutes.</p>
                <Link href='/signin/' className='font-semibold text-primary hover:underline'>
                    Retour à la connexion
                </Link>
            </div>
        )
    }

    return (
        <>
            <p className='mb-5 text-center text-black'>Indiquez l&apos;adresse e-mail de votre compte : nous vous enverrons un lien pour choisir un nouveau mot de passe.</p>
            {!apiEnabled && <FormAlert tone='info'>Ce service sera disponible quand le service en ligne d&apos;Edumada sera activé.</FormAlert>}
            <form onSubmit={submit} className='flex flex-col gap-4 text-left' noValidate>
                {error && !error.field('email') && <FormAlert>{error.message}</FormAlert>}
                <TextField label='Adresse e-mail' type='email' autoComplete='email' required value={email} onChange={(e) => setEmail(e.target.value)} error={error?.field('email')} />
                <Button type='submit' loading={loading} disabled={!apiEnabled || !email} className='mt-2 w-full py-3 text-lg'>
                    Envoyer le lien
                </Button>
            </form>
            <p className='mt-6 text-center text-base text-black'>
                <Link href='/signin/' className='font-semibold text-primary hover:underline'>
                    Retour à la connexion
                </Link>
            </p>
        </>
    )
}
