'use client'
import { useState, type FormEvent } from 'react'
import Dialog from '@/components/ui/dialog'
import { Button, FormAlert, SelectField, TextArea, TextField } from '@/components/ui/form'
import { api, ApiError, apiEnabled } from '@/lib/api'
import { useAuth } from '@/features/auth/AuthProvider'
import { useT } from '@/i18n/client'

const REASONS = [
    { value: 'wrong_information', label: 'Information erronée' },
    { value: 'fees', label: 'Frais incorrects' },
    { value: 'dates', label: 'Dates incorrectes' },
    { value: 'closed', label: 'Établissement fermé' },
    { value: 'other', label: 'Autre' },
]

interface ReportDialogProps {
    open: boolean
    onClose: () => void
    establishmentId: string
    offerId?: string
}

/** Signaler une information erronée : Edumada vérifie et corrige avec l'établissement. */
export function ReportDialog({ open, onClose, establishmentId, offerId }: ReportDialogProps) {
    const t = useT()
    const { user } = useAuth()
    const [form, setForm] = useState({ reason: 'wrong_information', message: '', email: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<ApiError | null>(null)
    const [sent, setSent] = useState(false)

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await api('/reports', {
                method: 'POST',
                body: { establishment: establishmentId, offer: offerId, reason: form.reason, message: form.message, email: form.email || undefined },
            })
            setSent(true)
        } catch (err) {
            setError(err as ApiError)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onClose={onClose} title='Signaler une information erronée' description='Merci : vos signalements aident à garder les fiches exactes.'>
            {sent ? (
                <FormAlert tone='success'>{t('Merci ! Edumada va vérifier cette information avec l’établissement.')}</FormAlert>
            ) : !apiEnabled ? (
                <FormAlert tone='info'>Le signalement en ligne sera bientôt disponible.</FormAlert>
            ) : (
                <form onSubmit={submit} className='flex flex-col gap-4'>
                    {error && Object.keys(error.errors).length === 0 && <FormAlert>{error.message}</FormAlert>}
                    <SelectField label='Motif' options={REASONS} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
                    <TextArea
                        label='Ce qui est inexact'
                        required
                        minLength={10}
                        placeholder='Ex. : les frais de scolarité ont augmenté cette année.'
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        error={error?.field('message')}
                    />
                    {!user && (
                        <TextField
                            label='Votre e-mail (facultatif)'
                            type='email'
                            hint='Pour vous tenir informé de la correction.'
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            error={error?.field('email')}
                        />
                    )}
                    <Button type='submit' loading={loading}>Envoyer le signalement</Button>
                </form>
            )}
        </Dialog>
    )
}

export default ReportDialog
