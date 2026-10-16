'use client'
import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Icon } from '@/components/ui/icon'
import { Button, ButtonLink, FormAlert, TextArea, TextField } from '@/components/ui/form'
import { PageSkeleton, PageUnavailable } from '@/components/ui/page-state'
import { api, ApiError, apiEnabled, getToken } from '@/lib/api'
import { fetchOfferPage, type OfferPage } from '@/data/catalog'
import { useAuth } from '@/features/auth/AuthProvider'
import { formatDate } from '@/features/formations/format'

const MAX_FILES = 5
const MAX_SIZE = 5 * 1024 * 1024

/**
 * Candidature en ligne à une offre (quand l'établissement l'a activée).
 * On ne demande que le nécessaire ; les documents restent privés (étudiant et établissement destinataire).
 */
export default function ApplicationPage() {
    const id = useSearchParams().get('offre') ?? ''
    const { user, loading: authLoading } = useAuth()
    const [offer, setOffer] = useState<OfferPage | null>(null)
    const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')
    const [message, setMessage] = useState('')
    const [phone, setPhone] = useState('')
    const [files, setFiles] = useState<File[]>([])
    const [fileError, setFileError] = useState('')
    const [sending, setSending] = useState(false)
    const [error, setError] = useState<ApiError | null>(null)
    const [sent, setSent] = useState(false)

    useEffect(() => {
        if (!apiEnabled || !id) {
            setState('missing')
            return
        }
        fetchOfferPage(id, getToken())
            .then((page) => {
                setOffer(page)
                setState('ready')
            })
            .catch(() => setState('missing'))
    }, [id])

    const addFiles = (list: FileList | null) => {
        if (!list) return
        const next = [...files, ...Array.from(list)]
        if (next.length > MAX_FILES) return setFileError(`${MAX_FILES} documents au maximum.`)
        const tooBig = next.find((f) => f.size > MAX_SIZE)
        if (tooBig) return setFileError(`« ${tooBig.name} » dépasse 5 Mo.`)
        setFileError('')
        setFiles(next)
    }

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        setSending(true)
        setError(null)
        const body = new FormData()
        body.append('type', 'application')
        if (message) body.append('message', message)
        if (phone || user?.phone) body.append('phone', phone || user?.phone || '')
        files.forEach((file) => body.append('attachments[]', file))
        try {
            await api(`/offers/${id}/inquiries`, { method: 'POST', body })
            setSent(true)
        } catch (err) {
            setError(err as ApiError)
        } finally {
            setSending(false)
        }
    }

    if (state === 'loading' || authLoading) return <PageSkeleton />
    if (state === 'missing' || !offer) {
        return <PageUnavailable title='Candidature indisponible' message="Cette offre n'existe pas, n'est plus publiée ou le service en ligne est indisponible." />
    }

    const offerUrl = `/formations/${offer.id}/`
    const here = `/candidature/?offre=${offer.id}`

    return (
        <section className='pt-28 pb-20'>
            <div className='container mx-auto max-w-2xl px-4 flex flex-col gap-6'>
                <nav aria-label="Fil d'Ariane" className='text-sm text-ink/60'>
                    <Link href={offerUrl} className='inline-flex items-center gap-1 py-2 hover:text-primary'>
                        <Icon icon='tabler:arrow-left' /> Retour à l&apos;offre
                    </Link>
                </nav>

                <div className='rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 sm:p-8'>
                    <p className='text-sm font-semibold uppercase tracking-wide text-primary'>Candidature en ligne</p>
                    <h1 className='mt-1 text-2xl sm:text-3xl font-bold text-secondary'>{offer.title}</h1>
                    <p className='mt-1 text-ink/70'>{offer.school} · {offer.city}</p>
                    {offer.registrationPeriod && offer.registration !== 'Fermées' && (
                        <p className='mt-3 inline-flex items-center gap-2 rounded-full bg-success/30 px-3 py-1 text-sm font-semibold text-secondary'>
                            <Icon icon='tabler:calendar' /> Date limite : {formatDate(offer.registrationPeriod.end)}
                        </p>
                    )}

                    <div className='mt-6'>
                        {sent ? (
                            <div className='flex flex-col gap-4'>
                                <FormAlert tone='success'>
                                    Votre candidature est envoyée à {offer.school}. Vous serez prévenu par e-mail à chaque étape.
                                </FormAlert>
                                <ButtonLink href='/espace/etudiant/'>Suivre ma candidature</ButtonLink>
                            </div>
                        ) : !offer.details.onlineApplication ? (
                            <FormAlert tone='info'>
                                Cet établissement ne reçoit pas encore de candidatures en ligne. <Link href={offerUrl} className='underline'>Contactez-le depuis la fiche de l&apos;offre</Link>.
                            </FormAlert>
                        ) : !user ? (
                            <div className='flex flex-col gap-3'>
                                <p className='text-ink/80'>Pour postuler et suivre votre dossier, connectez-vous ou créez un compte gratuit.</p>
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                    <ButtonLink href={`/signin/?next=${encodeURIComponent(here)}`} variant='secondary'>Se connecter</ButtonLink>
                                    <ButtonLink href={`/signup/?next=${encodeURIComponent(here)}`}>Créer un compte</ButtonLink>
                                </div>
                            </div>
                        ) : user.role !== 'student' ? (
                            <FormAlert tone='info'>Les candidatures sont envoyées depuis un compte étudiant.</FormAlert>
                        ) : (
                            <form onSubmit={submit} className='flex flex-col gap-5'>
                                {error && <FormAlert>{error.field('type') ?? error.field('attachments') ?? error.message}</FormAlert>}

                                <div className='rounded-xl bg-offwhite p-4 text-sm text-ink/80'>
                                    <p className='font-semibold text-secondary'>Envoyé avec votre candidature</p>
                                    <p>{user.name} · {user.email}</p>
                                </div>

                                <TextField label='Téléphone' type='tel' autoComplete='tel' placeholder={user.phone ?? '034 00 000 00'} value={phone} onChange={(e) => setPhone(e.target.value)} />
                                <TextArea
                                    label='Lettre de motivation ou message'
                                    rows={6}
                                    maxLength={3000}
                                    hint="Facultatif. Présentez votre projet en quelques lignes."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    error={error?.field('message')}
                                />

                                {offer.establishment.admissionDocuments.length > 0 && (
                                    <div>
                                        <p className='text-sm font-semibold text-secondary'>Pièces demandées par l&apos;établissement</p>
                                        <ul className='mt-2 flex flex-col gap-1 text-sm text-ink/80'>
                                            {offer.establishment.admissionDocuments.map((doc) => (
                                                <li key={doc} className='flex items-start gap-2'>
                                                    <Icon icon='tabler:file-check' className='mt-0.5 shrink-0 text-secondary' /> {doc}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className='flex flex-col gap-2'>
                                    <label className='flex min-h-24 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-secondary/20 bg-white p-4 text-center hover:border-primary hover:cursor-pointer'>
                                        <Icon icon='tabler:upload' className='text-2xl text-primary' />
                                        <span className='font-semibold text-secondary'>Ajouter des documents</span>
                                        <span className='text-sm text-ink/60'>PDF, JPG ou PNG · 5 Mo maximum · {MAX_FILES} fichiers</span>
                                        <input type='file' multiple accept='.pdf,.jpg,.jpeg,.png' className='sr-only' onChange={(e) => addFiles(e.target.files)} />
                                    </label>
                                    {fileError && <p className='text-sm text-primary'>{fileError}</p>}
                                    {files.length > 0 && (
                                        <ul className='flex flex-col gap-2'>
                                            {files.map((file, i) => (
                                                <li key={`${file.name}-${i}`} className='flex items-center gap-2 rounded-lg bg-offwhite px-3 py-2 text-sm'>
                                                    <Icon icon='tabler:file' className='text-secondary' />
                                                    <span className='flex-1 truncate'>{file.name}</span>
                                                    <button
                                                        type='button'
                                                        aria-label={`Retirer ${file.name}`}
                                                        onClick={() => setFiles(files.filter((_, j) => j !== i))}
                                                        className='flex h-9 w-9 items-center justify-center rounded-full hover:bg-cream hover:text-primary hover:cursor-pointer'>
                                                        <Icon icon='tabler:x' />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <p className='text-sm text-ink/60'>
                                    Vos documents ne sont visibles que par vous et par {offer.school}. Vous pouvez supprimer votre compte et vos données à tout moment.
                                </p>
                                <Button type='submit' loading={sending} className='py-3 text-lg'>
                                    <Icon icon='tabler:send' /> Envoyer ma candidature
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
