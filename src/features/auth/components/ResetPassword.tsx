'use client'
import Link from 'next/link'
import { useEffect, useState, type FormEvent } from 'react'
import { Icon } from '@/components/ui/icon'
import { Button, FormAlert, TextField } from '@/components/ui/form'
import { ApiError, api, apiEnabled } from '@/lib/api'

/**
 * Nouveau mot de passe, depuis le lien reçu par e-mail (?token=…&email=…).
 * Le lien ne sert qu'une fois et expire au bout de 60 minutes.
 */
export default function ResetPassword() {
    const [link, setLink] = useState<{ token: string; email: string } | null>(null)
    const [password, setPassword] = useState('')
    const [confirmation, setConfirmation] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<ApiError | null>(null)
    const [done, setDone] = useState('')

    // Lu côté navigateur : la page est générée en statique, sans paramètres.
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        setLink({ token: params.get('token') ?? '', email: params.get('email') ?? '' })
    }, [])

    const mismatch = confirmation !== '' && confirmation !== password

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        if (!link) return
        setLoading(true)
        setError(null)
        try {
            const res = await api<{ message: string }>('/auth/reset-password', {
                method: 'POST',
                body: { token: link.token, email: link.email, password, password_confirmation: confirmation },
            })
            setDone(res.message)
        } catch (err) {
            setError(err as ApiError)
        } finally {
            setLoading(false)
        }
    }

    if (done) {
        return (
            <div className='flex flex-col items-center gap-4 text-center'>
                <span className='flex h-14 w-14 items-center justify-center rounded-full bg-success/30 text-secondary'>
                    <Icon icon='tabler:lock-check' className='text-3xl' />
                </span>
                <h2 className='text-xl font-bold text-secondary'>Mot de passe modifié</h2>
                <p className='text-black'>{done}</p>
                <Link href='/signin/' className='mt-2 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-white hover:bg-primary/90'>
                    Se connecter
                </Link>
            </div>
        )
    }

    if (link && (!link.token || !link.email)) {
        return (
            <div className='flex flex-col items-center gap-4 text-center'>
                <FormAlert>Ce lien est incomplet. Ouvrez le lien reçu par e-mail en entier, ou demandez-en un nouveau.</FormAlert>
                <Link href='/mot-de-passe-oublie/' className='font-semibold text-primary hover:underline'>
                    Demander un nouveau lien
                </Link>
            </div>
        )
    }

    const tokenError = error?.field('token')

    return (
        <>
            {link?.email && (
                <p className='mb-5 text-center text-black'>
                    Choisissez un nouveau mot de passe pour <strong>{link.email}</strong>.
                </p>
            )}
            {!apiEnabled && <FormAlert tone='info'>Ce service sera disponible quand le service en ligne d&apos;Edumada sera activé.</FormAlert>}
            <form onSubmit={submit} className='flex flex-col gap-4 text-left' noValidate>
                {tokenError && (
                    <FormAlert>
                        {tokenError}{' '}
                        <Link href='/mot-de-passe-oublie/' className='font-semibold underline'>
                            Demander un nouveau lien
                        </Link>
                    </FormAlert>
                )}
                {error && !tokenError && !error.field('password') && <FormAlert>{error.message}</FormAlert>}
                <TextField
                    label='Nouveau mot de passe'
                    type='password'
                    autoComplete='new-password'
                    required
                    hint='8 caractères au moins, avec des lettres et des chiffres.'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={error?.field('password')}
                />
                <TextField
                    label='Confirmez le mot de passe'
                    type='password'
                    autoComplete='new-password'
                    required
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    error={mismatch ? 'Les deux mots de passe ne correspondent pas.' : undefined}
                />
                <Button type='submit' loading={loading} disabled={!apiEnabled || !link || !password || mismatch} className='mt-2 w-full py-3 text-lg'>
                    Enregistrer le mot de passe
                </Button>
            </form>
        </>
    )
}
