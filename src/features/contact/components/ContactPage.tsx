'use client'
import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import { Button, FormAlert, TextArea, TextField } from '@/components/ui/form'
import { api, ApiError, apiEnabled } from '@/lib/api'
import { useAuth } from '@/features/auth/AuthProvider'
import { CONTACT, SOCIAL_LINKS } from '@/components/layout/social-links'

const EMPTY = { first_name: '', last_name: '', email: '', phone: '', message: '' }

const tel = (phone: string) => phone.replace(/\s/g, '')

/** Moyens de contact affichés dans le panneau de droite. */
const CHANNELS = [
    { icon: 'tabler:phone', label: 'Téléphone', value: CONTACT.phone, href: `tel:${tel(CONTACT.phone)}` },
    { icon: 'tabler:brand-whatsapp', label: 'SMS / WhatsApp', value: CONTACT.whatsapp, href: `https://wa.me/${tel(CONTACT.whatsapp).replace('+', '')}` },
    { icon: 'tabler:mail', label: 'E-mail', value: CONTACT.email, href: `mailto:${CONTACT.email}` },
]

/** Page Contact : formulaire d'envoi à Edumada et coordonnées directes. */
export default function ContactPage() {
    const { user } = useAuth()
    const [form, setForm] = useState({ ...EMPTY, email: user?.email ?? '' })
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
        <section className='pt-28 pb-20 sm:pt-32'>
            <div className='container mx-auto max-w-7xl px-4'>
                <h1 className='mb-8 text-center text-3xl md:text-5xl font-bold text-secondary'>Contactez-nous</h1>

                <div className='grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start'>
                    {/* Formulaire */}
                    <div className='rounded-2xl border border-gray-200 bg-white p-5 sm:p-8'>
                        <h2 className='text-2xl font-bold text-secondary'>Envoyez-nous un message</h2>
                        <p className='mt-1 mb-6 text-ink/70'>
                            Une question, une remarque ou besoin d&apos;aide pour choisir votre formation ? Écrivez-nous, l&apos;équipe Edumada vous répond.
                        </p>

                        {sent ? (
                            <div className='flex flex-col items-start gap-4'>
                                <FormAlert tone='success'>Merci ! Votre message a bien été envoyé, nous vous répondrons rapidement.</FormAlert>
                                <Button variant='secondary' onClick={() => setSent(false)}>
                                    Envoyer un autre message
                                </Button>
                            </div>
                        ) : !apiEnabled ? (
                            <FormAlert tone='info'>
                                Le formulaire en ligne sera bientôt disponible. En attendant, écrivez-nous à{' '}
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
                                <TextField label='Prénom' required autoComplete='given-name' placeholder='Votre prénom' value={form.first_name} onChange={set('first_name')} error={error?.field('first_name')} />
                                <TextField label='Nom' required autoComplete='family-name' placeholder='Votre nom' value={form.last_name} onChange={set('last_name')} error={error?.field('last_name')} />
                                <TextField label='E-mail' type='email' required autoComplete='email' placeholder='Votre adresse e-mail' value={form.email} onChange={set('email')} error={error?.field('email')} />
                                <TextField label='Téléphone' type='tel' autoComplete='tel' placeholder='+261 34 00 000 00' value={form.phone} onChange={set('phone')} error={error?.field('phone')} />
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
                                <div className='sm:col-span-2 flex justify-end'>
                                    <Button type='submit' loading={loading} className='w-full sm:w-auto'>
                                        <Icon icon='tabler:send' className='text-lg' />
                                        Envoyer le message
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Coordonnées */}
                    <aside className='rounded-2xl bg-secondary p-6 text-white sm:p-8'>
                        <h2 className='text-xl font-bold text-white'>Nous sommes là pour vous aider.</h2>
                        <ul className='mt-6 flex flex-col gap-3'>
                            {CHANNELS.map((channel) => (
                                <li key={channel.label}>
                                    <a href={channel.href} className='flex items-center gap-4 rounded-xl bg-white/10 px-4 py-3 transition-colors duration-300 hover:bg-white/20'>
                                        <Icon icon={channel.icon} className='shrink-0 text-2xl text-primary' />
                                        <span className='flex min-w-0 flex-col'>
                                            <span className='text-sm font-semibold'>{channel.label}</span>
                                            <span className='truncate text-white/80'>{channel.value}</span>
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <div className='mt-6 border-t border-white/15 pt-6'>
                            <p className='text-sm font-semibold'>Suivez-nous</p>
                            <div className='mt-3 flex items-center gap-4'>
                                {SOCIAL_LINKS.map((social) => (
                                    <Link key={social.label} href={social.href} scroll={false} aria-label={social.label} className='text-white/90 hover:text-primary duration-300'>
                                        <Icon icon={social.icon} className='text-2xl' />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    )
}
