'use client'
import { useEffect, useState, type FormEvent } from 'react'
import { ButtonLink, Button, FormAlert, TextField } from '@/components/ui/form'
import { Icon } from '@/components/ui/icon'
import { api, ApiError } from '@/lib/api'
import { useAuth } from '@/features/auth/AuthProvider'
import { internshipHref, type Internship, type InternshipApplication } from '../types'

const MAX_SIZE = 5 * 1024 * 1024
const ACCEPT = '.pdf,.doc,.docx'

function FileField({ label, file, onChange, error }: { label: string; file: File | null; onChange: (file: File | null) => void; error?: string }) {
    return (
        <div>
            <label className='flex min-h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-secondary/25 p-4 text-center transition-colors focus-within:border-primary hover:border-primary'>
                <Icon icon='tabler:upload' className='text-2xl text-primary' />
                <span className='font-semibold text-secondary'>
                    {label} <span className='text-primary' aria-hidden='true'>*</span>
                </span>
                <span className='break-all text-sm text-ink/60'>{file ? file.name : 'PDF ou Word · 5 Mo maximum'}</span>
                <input type='file' accept={ACCEPT} required aria-required='true' className='sr-only' onChange={(e) => onChange(e.target.files?.[0] ?? null)} />
            </label>
            {error && <p className='mt-1 text-sm text-primary'>{error}</p>}
        </div>
    )
}

/** Candidature à un stage : compte étudiant obligatoire, CV et lettre de motivation. */
export default function ApplyPanel({ internship }: { internship: Internship }) {
    const { user, loading } = useAuth()
    const [existing, setExisting] = useState<InternshipApplication | null>(null)
    const [checked, setChecked] = useState(false)
    const [cv, setCv] = useState<File | null>(null)
    const [letter, setLetter] = useState<File | null>(null)
    const [phone, setPhone] = useState('')
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState<ApiError | null>(null)
    const [fileError, setFileError] = useState<{ cv?: string; letter?: string; phone?: string }>({})
    const student = user?.role === 'student'

    // Le numéro du profil pré-remplit le champ.
    useEffect(() => {
        if (user?.phone) setPhone((current) => current || user.phone || '')
    }, [user?.phone])

    useEffect(() => {
        if (!student) return
        let active = true
        api<{ data: InternshipApplication[] }>('/me/internship-applications')
            .then((res) => active && setExisting(res.data.find((a) => a.internship.id === internship.id) ?? null))
            .finally(() => active && setChecked(true))
        return () => {
            active = false
        }
    }, [student, internship.id])

    const pick = (key: 'cv' | 'letter', set: (file: File | null) => void) => (file: File | null) => {
        const tooBig = !!file && file.size > MAX_SIZE
        setFileError((prev) => ({ ...prev, [key]: tooBig ? 'Ce fichier dépasse 5 Mo.' : undefined }))
        set(tooBig ? null : file)
    }

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        if (!phone.trim() || !cv || !letter) {
            setFileError({
                phone: phone.trim() ? undefined : 'Indiquez votre téléphone.',
                cv: cv ? undefined : 'Ajoutez votre CV.',
                letter: letter ? undefined : 'Ajoutez votre lettre de motivation.',
            })
            return
        }
        setFileError({})
        setSending(true)
        setError(null)
        const body = new FormData()
        body.append('cv', cv)
        body.append('letter', letter)
        body.append('phone', phone.trim())
        try {
            await api(`/internships/${internship.id}/applications`, { method: 'POST', body })
            setSent(true)
        } catch (err) {
            setError(err as ApiError)
        } finally {
            setSending(false)
        }
    }

    const here = internshipHref(internship.id)
    let content
    if (sent) {
        content = <FormAlert tone='success'>Votre candidature est bien envoyée à l’équipe Edumada.</FormAlert>
    } else if (existing) {
        content = <FormAlert tone='info'>Vous avez déjà postulé à ce stage.</FormAlert>
    } else if (!internship.acceptsApplications) {
        content = <FormAlert tone='info'>Les candidatures à ce stage ne sont pas ouvertes.</FormAlert>
    } else if (loading || (student && !checked)) {
        content = <p className='text-sm text-ink/60'>Chargement…</p>
    } else if (!user) {
        content = (
            <div className='flex flex-col gap-3'>
                <p className='text-black'>Pour postuler, connectez-vous ou créez un compte étudiant.</p>
                <ButtonLink href={`/signin/?next=${encodeURIComponent(here)}`} variant='secondary'>
                    Se connecter
                </ButtonLink>
                <ButtonLink href={`/inscription/?next=${encodeURIComponent(here)}`}>Créer un compte</ButtonLink>
            </div>
        )
    } else if (!student) {
        content = <FormAlert tone='info'>Les candidatures sont envoyées depuis un compte étudiant.</FormAlert>
    } else {
        content = (
            <form onSubmit={submit} noValidate className='flex flex-col gap-4'>
                {error && <FormAlert>{error.field('internship') ?? error.field('cv') ?? error.field('letter') ?? error.field('phone') ?? error.message}</FormAlert>}
                <p className='rounded-xl bg-offwhite p-3 text-sm text-ink/80'>
                    {user.name} · {user.email}
                </p>
                <TextField label='Téléphone' type='tel' autoComplete='tel' placeholder='034 00 000 00' required value={phone} onChange={(e) => setPhone(e.target.value)} error={fileError.phone ?? error?.field('phone')} />
                <FileField label='Votre CV' file={cv} onChange={pick('cv', setCv)} error={fileError.cv} />
                <FileField label='Votre lettre de motivation' file={letter} onChange={pick('letter', setLetter)} error={fileError.letter} />
                <p className='text-sm text-ink/60'>Vos documents sont transmis à l’équipe Edumada, qui étudie votre candidature.</p>
                <Button type='submit' loading={sending} className='py-3'>
                    <Icon icon='tabler:send' /> Postuler
                </Button>
            </form>
        )
    }

    return (
        <div id='postuler' className='scroll-mt-28 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100'>
            <h2 className='mb-4 text-xl font-bold text-secondary'>Postuler à ce stage</h2>
            {content}
        </div>
    )
}
