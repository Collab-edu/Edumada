'use client'
import { useState, type FormEvent } from 'react'
import { Icon } from '@/components/ui/icon'
import Dialog from '@/components/ui/dialog'
import { Button, ButtonLink, FormAlert, SelectField, TextArea, TextField } from '@/components/ui/form'
import { api, ApiError } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/AuthProvider'
import type { FormationType } from '@/features/formations/types'

interface ReviewDialogProps {
    open: boolean
    onClose: () => void
    establishmentId: string
    formations: FormationType[]
}

/** Avis d'un étudiant ou d'un parent ; publié seulement après vérification par Edumada. */
export function ReviewDialog({ open, onClose, establishmentId, formations }: ReviewDialogProps) {
    const { user } = useAuth()
    const [form, setForm] = useState({ rating: 0, quote: '', status: '', formationId: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<ApiError | null>(null)
    const [sent, setSent] = useState(false)
    const here = typeof window !== 'undefined' ? window.location.pathname : '/'

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await api(`/establishments/${establishmentId}/reviews`, {
                method: 'POST',
                body: { rating: form.rating, quote: form.quote, status: form.status || undefined, formationId: form.formationId || undefined },
            })
            setSent(true)
        } catch (err) {
            setError(err as ApiError)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onClose={onClose} title='Donner mon avis' description='Votre prénom et l’initiale de votre nom seront affichés.'>
            {sent ? (
                <FormAlert tone='success'>Merci ! Votre avis sera publié après vérification par Edumada.</FormAlert>
            ) : !user ? (
                <div className='flex flex-col gap-3'>
                    <p className='text-black'>Connectez-vous avec un compte étudiant pour partager votre expérience.</p>
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        <ButtonLink href={`/signin/?next=${encodeURIComponent(here)}`} variant='secondary'>Se connecter</ButtonLink>
                        <ButtonLink href={`/signup/?next=${encodeURIComponent(here)}`}>Créer un compte</ButtonLink>
                    </div>
                </div>
            ) : user.role !== 'student' ? (
                <FormAlert tone='info'>Les avis sont réservés aux comptes étudiants.</FormAlert>
            ) : (
                <form onSubmit={submit} className='flex flex-col gap-4'>
                    {error && Object.keys(error.errors).length === 0 && <FormAlert>{error.message}</FormAlert>}
                    <fieldset>
                        <legend className='mb-1.5 text-sm font-semibold text-secondary'>Votre note <span className='text-primary'>*</span></legend>
                        <div className='flex gap-1'>
                            {[1, 2, 3, 4, 5].map((n) => (
                                <label key={n} className='hover:cursor-pointer'>
                                    <input type='radio' name='rating' value={n} checked={form.rating === n} onChange={() => setForm({ ...form, rating: n })} className='sr-only' />
                                    <span className='sr-only'>{n} sur 5</span>
                                    <Icon icon='tabler:star-filled' aria-hidden='true' className={cn('h-10 w-10 p-1 text-3xl', n <= form.rating ? 'text-amber-400' : 'text-gray-200')} />
                                </label>
                            ))}
                        </div>
                        {error?.field('rating') && <p className='text-sm text-primary'>Choisissez une note de 1 à 5.</p>}
                    </fieldset>
                    {formations.length > 0 && (
                        <SelectField
                            label='Formation concernée'
                            placeholder="L'établissement en général"
                            options={formations.map((f) => ({ value: f.id, label: f.title }))}
                            value={form.formationId}
                            onChange={(e) => setForm({ ...form, formationId: e.target.value })}
                        />
                    )}
                    <TextField label='Vous êtes' placeholder='Ex. : Promotion 2025, parent d’élève…' value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
                    <TextArea
                        label='Votre avis'
                        required
                        minLength={20}
                        maxLength={1500}
                        hint='20 caractères au moins. Restez factuel et respectueux.'
                        value={form.quote}
                        onChange={(e) => setForm({ ...form, quote: e.target.value })}
                        error={error?.field('quote')}
                    />
                    <Button type='submit' loading={loading} disabled={form.rating === 0}>Envoyer mon avis</Button>
                </form>
            )}
        </Dialog>
    )
}

export default ReviewDialog
