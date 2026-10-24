'use client'
import { useState, type FormEvent } from 'react'
import { Icon } from '@/components/ui/icon'
import { FormAlert, SelectField, TextArea, TextField } from '@/components/ui/form'
import { api, ApiError, apiEnabled } from '@/lib/api'
import { useAuth } from '@/features/auth/AuthProvider'
import { CONTACT } from '@/components/layout/social-links'
import { useT } from '@/i18n/client'

/** Mêmes valeurs que ContactController::SUBJECTS côté API. */
const SUBJECTS = [
    { value: 'orientation', label: 'Choisir une formation ou une école' },
    { value: 'establishment', label: 'Référencer mon établissement' },
    { value: 'account', label: 'Mon compte Edumada' },
    { value: 'partnership', label: 'Partenariat' },
    { value: 'other', label: 'Autre demande' },
]

const EMPTY = { name: '', email: '', phone: '', subject: '', message: '' }

/** Coordonnées affichées en pastilles sous le titre. */
const CHANNELS = [
    { icon: 'tabler:phone', label: CONTACT.phone, href: `tel:${CONTACT.phone.replace(/\s/g, '')}` },
    { icon: 'tabler:map-pin', label: 'Partout à Madagascar', href: null },
    { icon: 'tabler:mail', label: CONTACT.email, href: `mailto:${CONTACT.email}` },
]

/** Page Contact : titre centré, coordonnées et formulaire. */
export default function ContactPage() {
    const t = useT()
    const { user } = useAuth()
    const [form, setForm] = useState({ ...EMPTY, name: user?.name ?? '', email: user?.email ?? '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<ApiError | null>(null)
    const [sent, setSent] = useState(false)

    const set = (key: keyof typeof EMPTY) => (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value })

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await api('/contact', { method: 'POST', body: { ...form, phone: form.phone || undefined } })
            setSent(true)
            setForm(EMPTY)
        } catch (err) {
            setError(err as ApiError)
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className='pt-32 pb-20 sm:pt-40'>
            <div className='container mx-auto max-w-7xl px-4'>
                <div className='mx-auto flex max-w-3xl flex-col items-center gap-5 text-center'>
                    <h1 className='text-4xl md:text-6xl font-bold text-secondary'>
                        {t('Contactez-nous')} <span className='text-primary'>{t('dès aujourd’hui')}</span>
                    </h1>
                    <p className='max-w-2xl text-black'>
                        {t('Une question sur une formation, un établissement à référencer ou un souci avec votre compte ? Écrivez-nous, l’équipe Edumada vous répond rapidement.')}
                    </p>
                    <ul className='mt-2 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-secondary'>
                        {CHANNELS.map((channel) => {
                            const content = (
                                <>
                                    <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
                                        <Icon icon={channel.icon} className='text-lg' />
                                    </span>
                                    {t(channel.label)}
                                </>
                            )
                            return (
                                <li key={channel.icon}>
                                    {channel.href ? (
                                        <a href={channel.href} className='flex items-center gap-3 hover:text-primary duration-300'>
                                            {content}
                                        </a>
                                    ) : (
                                        <span className='flex items-center gap-3'>{content}</span>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                </div>

                {/* Formulaire */}
                <div className='mx-auto mt-12 max-w-2xl rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_24px_60px_-30px_rgba(15,76,92,0.45)] sm:p-8'>
                    {sent ? (
                        <div className='flex flex-col items-start gap-4'>
                            <FormAlert tone='success'>{t('Merci ! Votre message a bien été envoyé, nous vous répondrons rapidement.')}</FormAlert>
                            <button type='button' onClick={() => setSent(false)} className='font-semibold text-secondary underline hover:text-primary hover:cursor-pointer'>
                                {t('Envoyer un autre message')}
                            </button>
                        </div>
                    ) : !apiEnabled ? (
                        <FormAlert tone='info'>
                            {t('Le formulaire en ligne sera bientôt disponible. En attendant, écrivez-nous à')}{' '}
                            <a href={`mailto:${CONTACT.email}`} className='underline'>
                                {CONTACT.email}
                            </a>
                            .
                        </FormAlert>
                    ) : (
                        <form onSubmit={submit} className='grid gap-4 sm:grid-cols-2'>
                            {error && Object.keys(error.errors).length === 0 && (
                                <div className='sm:col-span-2'>
                                    <FormAlert>{error.message}</FormAlert>
                                </div>
                            )}
                            <TextField label='Votre nom' required autoComplete='name' placeholder='Nom et prénom' value={form.name} onChange={set('name')} error={error?.field('name')} />
                            <TextField label='Votre téléphone' type='tel' autoComplete='tel' placeholder='+261 34 00 000 00' value={form.phone} onChange={set('phone')} error={error?.field('phone')} />
                            <TextField
                                label='Votre e-mail'
                                type='email'
                                required
                                autoComplete='email'
                                placeholder='Pour vous répondre'
                                value={form.email}
                                onChange={set('email')}
                                error={error?.field('email')}
                                className='sm:col-span-2'
                            />
                            <SelectField
                                label='Objet de votre message'
                                required
                                placeholder='Choisissez un objet'
                                options={SUBJECTS}
                                value={form.subject}
                                onChange={set('subject')}
                                error={error?.field('subject')}
                                className='sm:col-span-2'
                            />
                            <TextArea
                                label='Message'
                                required
                                minLength={10}
                                rows={5}
                                placeholder='Votre message'
                                value={form.message}
                                onChange={set('message')}
                                error={error?.field('message')}
                                className='sm:col-span-2'
                            />
                            <div className='sm:col-span-2'>
                                <button
                                    type='submit'
                                    disabled={loading}
                                    className='inline-flex items-center gap-3 rounded-full bg-primary py-1.5 pr-6 pl-1.5 font-semibold text-white transition-colors duration-300 hover:bg-primary/90 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-60'>
                                    <span className='flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-white'>
                                        {loading ? (
                                            <span className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' aria-hidden='true' />
                                        ) : (
                                            <Icon icon='tabler:send' className='text-lg' />
                                        )}
                                    </span>
                                    {t('Envoyer')}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </section>
    )
}
