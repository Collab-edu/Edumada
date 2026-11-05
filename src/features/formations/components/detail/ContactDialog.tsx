'use client'
import { useState, type FormEvent } from 'react'
import { Icon } from '@/components/ui/icon'
import Dialog from '@/components/ui/dialog'
import { Button, ButtonLink, FormAlert, TextArea, TextField } from '@/components/ui/form'
import { api, ApiError, apiEnabled } from '@/lib/api'
import { useAuth } from '@/features/auth/AuthProvider'
import type { SchoolType } from '@/features/etablissements/types'
import type { FormationType } from '../../types'
import { useT } from '@/i18n/client'

interface ContactDialogProps {
    open: boolean
    onClose: () => void
    /** Absente : question à l'établissement depuis sa fiche, sans offre précise. */
    formation?: FormationType
    school: SchoolType
}

/**
 * Contacter l'établissement : demande d'information envoyée via Edumada (compte étudiant),
 * qui arrive dans la boîte de réception de l'établissement ou par e-mail.
 */
export function ContactDialog({ open, onClose, formation, school }: ContactDialogProps) {
    const t = useT()
    const { user } = useAuth()
    const [message, setMessage] = useState('')
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<ApiError | null>(null)
    const [sent, setSent] = useState(false)
    const here = typeof window !== 'undefined' ? window.location.pathname : '/'

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const path = formation ? `/offers/${formation.id}/inquiries` : `/establishments/${school.id}/inquiries`
            await api(path, { method: 'POST', body: { type: 'information', message, phone: phone || user?.phone } })
            setSent(true)
        } catch (err) {
            setError(err as ApiError)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onClose={onClose} title={t('Contacter {school}', { school: school.name })} description={formation?.title}>
            {sent ? (
                <div className='flex flex-col gap-4'>
                    <FormAlert tone='success'>{t('Votre demande a été envoyée. Vous serez prévenu par e-mail de la réponse.')}</FormAlert>
                    <ButtonLink href='/espace/etudiant/' variant='secondary'>Suivre mes demandes</ButtonLink>
                </div>
            ) : !apiEnabled ? (
                <FormAlert tone='info'>L&apos;envoi de demandes en ligne sera bientôt disponible.</FormAlert>
            ) : !user ? (
                <div className='flex flex-col gap-3'>
                    <p className='text-black'>{t('Créez un compte gratuit pour envoyer votre question et suivre la réponse depuis votre espace.')}</p>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        <ButtonLink href={`/signin/?next=${encodeURIComponent(here)}`} variant='secondary'>Se connecter</ButtonLink>
                        <ButtonLink href={`/inscription/?next=${encodeURIComponent(here)}`}>{t('Créer un compte')}</ButtonLink>
                    </div>
                </div>
            ) : user.role !== 'student' ? (
                <FormAlert tone='info'>Les demandes d&apos;information sont envoyées depuis un compte étudiant.</FormAlert>
            ) : (
                <form onSubmit={submit} className='flex flex-col gap-4'>
                    {error && Object.keys(error.errors).length === 0 && <FormAlert>{error.message}</FormAlert>}
                    <TextArea
                        label='Votre question'
                        required
                        rows={5}
                        maxLength={3000}
                        placeholder='Ex. : quelles sont les dates de la prochaine rentrée ? Peut-on payer en plusieurs fois ?'
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        error={error?.field('message')}
                    />
                    <TextField
                        label='Téléphone (facultatif)'
                        type='tel'
                        autoComplete='tel'
                        placeholder={user.phone ?? '034 00 000 00'}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        error={error?.field('phone')}
                    />
                    <p className='text-sm text-ink/60'>
                        {t('L’établissement recevra votre nom, votre e-mail ({email}), votre téléphone s’il est indiqué, et ce message.', { email: user.email })}
                    </p>
                    <Button type='submit' loading={loading}>
                        <Icon icon='tabler:send' /> {t('Envoyer ma demande')}
                    </Button>
                </form>
            )}
        </Dialog>
    )
}

export default ContactDialog
