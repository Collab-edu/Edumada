'use client'
import { useState, type FormEvent } from 'react'
import Link, { useT } from '@/i18n/client'
import { Icon } from '@/components/ui/icon'
import toast from 'react-hot-toast'
import Dialog from '@/components/ui/dialog'
import { Badge, Button, ButtonLink, EmptyState, Field, FormAlert, SelectField, TextField, inputClassName } from '@/components/ui/form'
import PlaceField from '@/features/recherche/components/PlaceField'
import { api, ApiError } from '@/lib/api'
import { useAuth } from '@/features/auth/AuthProvider'
import { STUDY_LEVELS } from '@/features/auth/components/SignUp'
import FormationCard from '@/features/formations/components/FormationCard'
import { offerHref } from '@/features/formations/href'
import type { FormationType } from '@/features/formations/types'
import { useApi } from '../useApi'
import { Panel, SpaceShell, StatCard, formatDateTime } from '../components/SpaceShell'
import { INQUIRY_STATUS_TONE, type Inquiry } from '../types'

/** Détail d'une démarche vue par l'étudiant : message, documents, historique des statuts. */
function InquiryDetail({ inquiry }: { inquiry: Inquiry }) {
    const t = useT()
    return (
        <div className='flex flex-col gap-5'>
            <div className='flex flex-wrap items-center gap-2'>
                <Badge tone={inquiry.type === 'application' ? 'info' : 'neutral'}>{inquiry.typeLabel}</Badge>
                <Badge tone={INQUIRY_STATUS_TONE[inquiry.status]}>{inquiry.statusLabel}</Badge>
                <span className='text-sm text-ink/60'>{t('Envoyée le {date}', { date: formatDateTime(inquiry.createdAt) })}</span>
            </div>
            {inquiry.message && <p className='whitespace-pre-line text-black'>{inquiry.message}</p>}
            {inquiry.attachments && inquiry.attachments.length > 0 && (
                <ul className='flex flex-col gap-1 text-sm text-ink/80'>
                    {inquiry.attachments.map((file) => (
                        <li key={file.id} className='flex items-center gap-2'>
                            <Icon icon='tabler:paperclip' className='text-secondary' /> {file.name}
                        </li>
                    ))}
                </ul>
            )}
            {inquiry.history && inquiry.history.length > 0 && (
                <ol className='flex flex-col gap-3 border-l-2 border-gray-100 pl-4'>
                    {inquiry.history.map((step, i) => (
                        <li key={i} className='relative'>
                            <span className='absolute -left-[23px] top-1.5 h-3 w-3 rounded-full bg-primary' aria-hidden='true' />
                            <p className='font-semibold text-secondary'>{step.toLabel}</p>
                            <p className='text-xs text-ink/50'>{formatDateTime(step.at)}</p>
                            {step.note && <p className='mt-1 rounded-lg bg-offwhite px-3 py-2 text-sm text-black'>{step.note}</p>}
                        </li>
                    ))}
                </ol>
            )}
        </div>
    )
}

const NAV = [
    { href: '/espace/etudiant/', label: 'Mes démarches', icon: 'tabler:list-check' },
    { href: '/espace/etudiant/favoris/', label: 'Favoris', icon: 'tabler:heart' },
    { href: '/espace/etudiant/profil/', label: 'Mon profil', icon: 'tabler:user' },
]

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
    const t = useT()
    const { user } = useAuth()
    return (
        <SpaceShell roles={['student']} title={title} subtitle={user ? t('Bonjour {name} !', { name: user.name.split(' ')[0] }) : undefined} nav={NAV} actions={<ButtonLink href='/recherche/' variant='secondary'><Icon icon='tabler:search' /> {t('Rechercher')}</ButtonLink>}>
            {children}
        </SpaceShell>
    )
}

/* ------------------------------------------------------------------ */
/* Mes démarches                                                       */
/* ------------------------------------------------------------------ */

function Inquiries() {
    const t = useT()
    const { favorites } = useAuth()
    const { data, loading } = useApi<{ data: Inquiry[] }>('/me/inquiries')
    const [selected, setSelected] = useState<Inquiry | null>(null)
    const inquiries = data?.data ?? []
    const active = inquiries.filter((i) => !['accepted', 'refused'].includes(i.status))

    return (
        <>
            <div className='grid grid-cols-2 lg:grid-cols-3 gap-3'>
                <StatCard icon='tabler:send' label='Démarches en cours' value={loading ? '…' : active.length} />
                <StatCard icon='tabler:circle-check' label='Réponses reçues' value={loading ? '…' : inquiries.filter((i) => i.status !== 'new').length} />
                <StatCard icon='tabler:heart' label='Favoris' value={favorites.length} href='/espace/etudiant/favoris/' />
            </div>

            <Panel title='Mes demandes et candidatures' description="Chaque changement de statut vous est aussi envoyé par e-mail.">
                {loading ? (
                    <div className='h-32 rounded-xl bg-offwhite animate-pulse' />
                ) : inquiries.length === 0 ? (
                    <EmptyState icon='tabler:send' title='Aucune démarche pour le moment' action={<ButtonLink href='/recherche/'>{t('Trouver une formation')}</ButtonLink>}>
                        {t('Contactez un établissement ou postulez depuis la fiche d’une offre : vous suivrez la réponse ici.')}
                    </EmptyState>
                ) : (
                    <ul className='flex flex-col gap-3'>
                        {inquiries.map((inquiry) => (
                            <li key={inquiry.id}>
                                <button type='button' onClick={() => setSelected(inquiry)} className='flex w-full flex-col gap-2 rounded-xl border border-gray-100 p-4 text-left hover:border-primary/40 hover:cursor-pointer'>
                                    <span className='flex flex-wrap items-center gap-2'>
                                        <Badge tone={inquiry.type === 'application' ? 'info' : 'neutral'}>{inquiry.typeLabel}</Badge>
                                        <Badge tone={INQUIRY_STATUS_TONE[inquiry.status]}>{inquiry.statusLabel}</Badge>
                                    </span>
                                    <span className='font-semibold text-secondary'>{inquiry.offer?.title ?? inquiry.establishment.name}</span>
                                    <span className='text-sm text-ink/60'>{inquiry.establishment.name} · {t('envoyée le {date}', { date: formatDateTime(inquiry.createdAt) })}</span>
                                    {inquiry.history && inquiry.history.length > 1 && inquiry.history[inquiry.history.length - 1].note && (
                                        <span className='rounded-lg bg-cream/60 px-3 py-2 text-sm text-ink/80'>
                                            <Icon icon='tabler:message' className='mr-1 inline text-primary' />
                                            {inquiry.history[inquiry.history.length - 1].note}
                                        </span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </Panel>

            <Dialog open={!!selected} onClose={() => setSelected(null)} title={selected?.offer?.title ?? selected?.establishment.name ?? ''} className='sm:max-w-2xl'>
                {selected && (
                    <div className='flex flex-col gap-4'>
                        <InquiryDetail inquiry={selected} />
                        {selected.offer && <ButtonLink href={offerHref({ schoolId: selected.establishment.id, urlSlug: selected.offer.urlSlug })} variant='secondary'>Voir l&apos;offre</ButtonLink>}
                    </div>
                )}
            </Dialog>
        </>
    )
}

export function StudentDashboardPage() {
    return (
        <Shell title='Mon espace'>
            <Inquiries />
        </Shell>
    )
}

/* ------------------------------------------------------------------ */
/* Favoris                                                             */
/* ------------------------------------------------------------------ */

function Favorites() {
    const t = useT()
    const { isFavorite, toggleFavorite, favorites } = useAuth()
    const { data, loading } = useApi<{ data: FormationType[] }>('/me/favorites')
    // On garde la carte affichée après un retrait pour permettre de l'annuler.
    const offers = data?.data ?? []

    return (
        <Panel title='Mes favoris' description={t('{n} offre(s) enregistrée(s).', { n: favorites.length })}>
            {loading ? (
                <div className='h-64 rounded-xl bg-offwhite animate-pulse' />
            ) : offers.length === 0 ? (
                <EmptyState icon='tabler:heart' title='Aucun favori' action={<ButtonLink href='/recherche/'>{t('Explorer les formations')}</ButtonLink>}>
                    {t('Touchez le cœur d’une offre pour la retrouver ici et la comparer.')}
                </EmptyState>
            ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'>
                    {offers.map((offer) => (
                        <FormationCard key={offer.id} formation={offer} isFavorite={isFavorite(offer.id)} onToggleFavorite={() => toggleFavorite(offer.id)} />
                    ))}
                </div>
            )}
        </Panel>
    )
}

export function StudentFavoritesPage() {
    return (
        <Shell title='Mes favoris'>
            <Favorites />
        </Shell>
    )
}

/* ------------------------------------------------------------------ */
/* Profil                                                              */
/* ------------------------------------------------------------------ */

export function ProfileForms() {
    const t = useT()
    const { user, setUser, logout } = useAuth()
    const [profile, setProfile] = useState({ name: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '', city: user?.city ?? '', studyLevel: user?.studyLevel ?? '' })
    const [passwords, setPasswords] = useState({ currentPassword: '', password: '', password_confirmation: '' })
    const [saving, setSaving] = useState<string | null>(null)
    const [error, setError] = useState<ApiError | null>(null)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deletePassword, setDeletePassword] = useState('')

    const saveProfile = async (e: FormEvent) => {
        e.preventDefault()
        setSaving('profile')
        setError(null)
        try {
            const res = await api<{ data: NonNullable<typeof user> }>('/me', { method: 'PATCH', body: profile })
            setUser(res.data)
            toast.success(t('Profil enregistré'))
        } catch (err) {
            setError(err as ApiError)
        } finally {
            setSaving(null)
        }
    }

    const savePassword = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget
        setSaving('password')
        setError(null)
        try {
            await api('/me/password', { method: 'PUT', body: passwords })
            setPasswords({ currentPassword: '', password: '', password_confirmation: '' })
            // Champs non contrôlés : on vide le formulaire lui-même.
            form.reset()
            toast.success(t('Mot de passe modifié'))
        } catch (err) {
            setError(err as ApiError)
        } finally {
            setSaving(null)
        }
    }

    const deleteAccount = async () => {
        setSaving('delete')
        try {
            await api('/me', { method: 'DELETE', body: { password: deletePassword } })
            toast.success(t('Votre compte et vos données ont été supprimés.'))
            await logout()
        } catch (err) {
            toast.error((err as ApiError).field('password') ?? (err as Error).message)
        } finally {
            setSaving(null)
        }
    }

    if (!user) return null

    return (
        <>
            <Panel title='Mes informations'>
                <form onSubmit={saveProfile} className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <TextField label='Nom complet' required value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} error={error?.field('name')} />
                    <TextField label='E-mail' type='email' required value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} error={error?.field('email')} />
                    <TextField label='Téléphone (facultatif)' type='tel' value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} error={error?.field('phone')} />
                    {user.role === 'student' && (
                        <>
                            <Field label='Ville'>
                                {(id) => <PlaceField id={id} value={profile.city} onChange={(city) => setProfile((p) => ({ ...p, city }))} className={inputClassName} />}
                            </Field>
                            <SelectField label="Niveau d'études" placeholder='Choisir…' options={STUDY_LEVELS} value={profile.studyLevel} onChange={(e) => setProfile({ ...profile, studyLevel: e.target.value })} />
                        </>
                    )}
                    <div className='sm:col-span-2'>
                        <Button type='submit' loading={saving === 'profile'}>{t('Enregistrer')}</Button>
                    </div>
                </form>
            </Panel>

            <Panel title='Mot de passe'>
                <form onSubmit={savePassword} className='grid grid-cols-1 sm:grid-cols-3 gap-4 items-start'>
                    <TextField label='Mot de passe actuel' type='password' autoComplete='current-password' onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} error={error?.field('currentPassword')} />
                    <TextField label='Nouveau mot de passe' type='password' autoComplete='new-password' onChange={(e) => setPasswords({ ...passwords, password: e.target.value })} error={error?.field('password')} />
                    <TextField label='Confirmation' type='password' autoComplete='new-password' onChange={(e) => setPasswords({ ...passwords, password_confirmation: e.target.value })} />
                    <div className='sm:col-span-3'>
                        <Button type='submit' variant='secondary' loading={saving === 'password'}>{t('Changer le mot de passe')}</Button>
                    </div>
                </form>
            </Panel>

            <Panel title='Mes données' description='Vos demandes et documents ne sont visibles que par vous et par les établissements à qui vous les avez envoyés.'>
                <div className='flex flex-col gap-3'>
                    <p className='text-black'>
                        {t('Supprimer votre compte efface vos informations, vos favoris, vos demandes et vos documents. Cette action est définitive.')}{' '}
                        <Link href='/confidentialite/' className='text-primary underline'>{t('Politique de confidentialité')}</Link>
                    </p>
                    <Button variant='danger' className='w-fit' onClick={() => setDeleteOpen(true)}>{t('Supprimer mon compte')}</Button>
                </div>
            </Panel>

            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} title='Supprimer mon compte ?' description='Toutes vos données seront effacées définitivement.'>
                <div className='flex flex-col gap-4'>
                    <FormAlert>Cette action ne peut pas être annulée.</FormAlert>
                    <TextField label='Votre mot de passe' type='password' autoComplete='current-password' onChange={(e) => setDeletePassword(e.target.value)} />
                    <Button variant='danger' onClick={deleteAccount} loading={saving === 'delete'} disabled={!deletePassword}>{t('Supprimer définitivement')}</Button>
                </div>
            </Dialog>
        </>
    )
}

export function StudentProfilePage() {
    return (
        <Shell title='Mon profil'>
            <ProfileForms />
        </Shell>
    )
}
