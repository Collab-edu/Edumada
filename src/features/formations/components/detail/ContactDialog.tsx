'use client'
import { useState, type FormEvent } from 'react'
import { Icon } from '@/components/ui/icon'
import Dialog from '@/components/ui/dialog'
import { Button, ButtonLink, FormAlert, TextArea, TextField } from '@/components/ui/form'
import { api, ApiError, apiEnabled } from '@/lib/api'
import { track } from '@/lib/track'
import { useAuth } from '@/features/auth/AuthProvider'
import type { SchoolType } from '@/features/etablissements/types'
import type { FormationType } from '../../types'

interface ContactDialogProps {
    open: boolean
    onClose: () => void
    formation: FormationType
    school: SchoolType
}

/**
 * Contacter l'établissement : coordonnées directes, et demande d'information envoyée via Edumada
 * (compte étudiant), qui arrive dans la boîte de réception de l'établissement ou par e-mail.
 */
export function ContactDialog({ open, onClose, formation, school }: ContactDialogProps) {
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
            await api(`/offers/${formation.id}/inquiries`, { method: 'POST', body: { type: 'information', message, phone: phone || user?.phone } })
            setSent(true)
        } catch (err) {
            setError(err as ApiError)
        } finally {
            setLoading(false)
        }
    }

    const directLinks = [
        school.phone && { icon: 'tabler:phone', label: school.phone, href: `tel:${school.phone.replace(/\s/g, '')}` },
        school.email && { icon: 'tabler:mail', label: school.email, href: `mailto:${school.email}` },
    ].filter(Boolean) as { icon: string; label: string; href: string }[]

    return (
        <Dialog open={open} onClose={onClose} title={`Contacter ${school.name}`} description={formation.title}>
            {directLinks.length > 0 && (
                <div className='mb-6 flex flex-col gap-2'>
                    <p className='text-sm font-semibold text-secondary'>Directement</p>
                    {directLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            onClick={() => track({ type: 'contact_click', establishment: school.id, offer: formation.id })}
                            className='flex min-h-11 items-center gap-3 rounded-lg border border-gray-100 px-4 py-2 text-ink hover:border-primary hover:text-primary'>
                            <Icon icon={link.icon} className='text-lg text-secondary' /> {link.label}
                        </a>
                    ))}
                </div>
            )}

            <p className='mb-3 text-sm font-semibold text-secondary'>Par Edumada</p>
            {sent ? (
                <div className='flex flex-col gap-4'>
                    <FormAlert tone='success'>Votre demande a été envoyée. Vous serez prévenu par e-mail de la réponse.</FormAlert>
                    <ButtonLink href='/espace/etudiant/' variant='secondary'>Suivre mes demandes</ButtonLink>
                </div>
            ) : !apiEnabled ? (
                <FormAlert tone='info'>L&apos;envoi de demandes en ligne sera bientôt disponible. Utilisez les coordonnées ci-dessus.</FormAlert>
            ) : !user ? (
                <div className='flex flex-col gap-3'>
                    <p className='text-black'>Créez un compte gratuit pour envoyer votre question et suivre la réponse depuis votre espace.</p>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        <ButtonLink href={`/signin/?next=${encodeURIComponent(here)}`} variant='secondary'>Se connecter</ButtonLink>
                        <ButtonLink href={`/signup/?next=${encodeURIComponent(here)}`}>Créer un compte</ButtonLink>
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
                        L&apos;établissement recevra votre nom, votre e-mail ({user.email}), votre téléphone s&apos;il est indiqué, et ce message.
                    </p>
                    <Button type='submit' loading={loading}>
                        <Icon icon='tabler:send' /> Envoyer ma demande
                    </Button>
                </form>
            )}
        </Dialog>
    )
}

export default ContactDialog
