'use client'
import { useState } from 'react'
import { useRouter, useT } from '@/i18n/client'
import toast from 'react-hot-toast'
import { FormAlert } from '@/components/ui/form'
import { Icon } from '@/components/ui/icon'
import { ApiError, apiEnabled } from '@/lib/api'
import { useAuth } from '../AuthProvider'
import { SPACE_HOME, backofficeUrl, goTo } from '../types'
import GoogleButton, { GOOGLE_CLIENT_ID } from './GoogleButton'
import { nextUrl } from './SignIn'

/**
 * « Continuer avec Google » des pages Connexion et Inscription du site : connecte le compte qui
 * porte l'adresse Google, ou crée un compte étudiant. Suivi d'un séparateur « ou » avant le formulaire.
 * Rien n'est affiché tant que Google n'est pas configuré.
 */
export default function GoogleSignIn({ text = 'continue_with', onSuccess }: { text?: 'signup_with' | 'continue_with'; onSuccess?: () => void }) {
    const t = useT()
    const { loginWithGoogle } = useAuth()
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    if (!GOOGLE_CLIENT_ID || !apiEnabled) return null

    const choose = async (credential: string) => {
        setError(null)
        setLoading(true)
        try {
            const { user, created } = await loginWithGoogle(credential)
            toast.success(created ? t('Votre compte est créé.') : `${t('Bienvenue')}, ${user.name.split(' ')[0]} !`)
            onSuccess?.()
            if (user.role === 'student') goTo(nextUrl() ?? SPACE_HOME.student, router.push)
            else {
                toast(t('Votre espace de gestion est le back-office : connectez-vous-y avec le même compte.'), { icon: <Icon icon='tabler:arrow-right' className='shrink-0 text-xl text-secondary' /> })
                goTo(backofficeUrl(`/connexion?email=${encodeURIComponent(user.email)}&google=1`), router.push)
            }
        } catch (err) {
            const apiError = err as ApiError
            setError(apiError.field?.('credential') ?? apiError.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='flex flex-col gap-4'>
            {error && <FormAlert>{error}</FormAlert>}
            <div className={loading ? 'pointer-events-none opacity-60' : undefined} aria-busy={loading}>
                <GoogleButton text={text} onCredential={choose} />
            </div>
            <div className='flex items-center gap-3 text-xs font-semibold text-ink/50'>
                <span className='h-px flex-1 bg-gray-200' />
                {t('ou')}
                <span className='h-px flex-1 bg-gray-200' />
            </div>
        </div>
    )
}
