'use client'
import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Icon } from '@iconify/react/dist/iconify.js'
import toast from 'react-hot-toast'
import Dialog from '@/components/ui/dialog'
import { Badge, Button, ButtonLink, Checkbox, EmptyState, FormAlert, ListField, SelectField, TextField } from '@/components/ui/form'
import { api, ApiError, type Paginated } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { CategoryType } from '@/features/categories/types'
import { useApi } from '../useApi'
import { Pager, Panel, StatCard, formatAriary, formatDateTime } from '../components/SpaceShell'
import { STATUS_TONE } from '../etablissement/EstablishmentSpace'
import type { Campaign, Invoice, ManagedEstablishment, Plan, Report, Subscription } from '../types'
import { AdminShell, type Overview } from './AdminShell'

/** Exécute une action de l'API, affiche le résultat et recharge la liste. */
async function run(action: () => Promise<unknown>, success: string, reload?: () => unknown) {
    try {
        await action()
        toast.success(success)
        await reload?.()
    } catch (err) {
        const e = err as ApiError
        toast.error(Object.values(e.errors ?? {})[0]?.[0] ?? e.message)
    }
}

/* ------------------------------------------------------------------ */
/* Tableau de bord : indicateurs du pilote                             */
/* ------------------------------------------------------------------ */

export function AdminDashboardPage() {
    const { data } = useApi<{ data: Overview }>('/admin/overview')
    const o = data?.data
    const processed = o && o.inquiries.total > 0 ? Math.round((o.inquiries.processed / o.inquiries.total) * 100) : null

    return (
        <AdminShell title='Administration'>
            {!o ? (
                <div className='h-64 rounded-2xl bg-white animate-pulse' />
            ) : (
                <>
                    <Panel title='À traiter'>
                        <div className='grid grid-cols-2 lg:grid-cols-3 gap-3'>
                            <StatCard icon='tabler:building-community' label='Fiches à valider' value={o.queues.establishmentsPending} href='/espace/admin/etablissements/?status=pending_review' />
                            <StatCard icon='tabler:shield-check' label='Vérifications demandées' value={o.queues.verificationsPending} href='/espace/admin/etablissements/?verification=pending' />
                            <StatCard icon='tabler:user-check' label='Revendications' value={o.queues.claimsPending} href='/espace/admin/moderation/?tab=claims' />
                            <StatCard icon='tabler:message-star' label='Avis à modérer' value={o.queues.reviewsPending} href='/espace/admin/moderation/?tab=reviews' />
                            <StatCard icon='tabler:flag' label='Signalements ouverts' value={o.queues.reportsOpen} href='/espace/admin/moderation/?tab=reports' />
                            <StatCard icon='tabler:credit-card' label='Paiements à confirmer' value={o.queues.invoicesPending} href='/espace/admin/facturation/' />
                        </div>
                    </Panel>
                    <Panel title='Indicateurs du pilote' description="L'indicateur central : les demandes utiles transmises aux établissements et effectivement traitées.">
                        <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
                            <StatCard icon='tabler:inbox' label='Demandes (30 jours)' value={o.inquiries.last30Days} hint={`${o.inquiries.total} au total`} />
                            <StatCard icon='tabler:checks' label='Demandes traitées' value={processed === null ? '—' : `${processed} %`} />
                            <StatCard icon='tabler:send' label='Candidatures' value={o.inquiries.applications} />
                            <StatCard icon='tabler:users' label='Étudiants' value={o.users.students} hint={`+${o.users.newLast30Days} comptes en 30 jours`} />
                            <StatCard icon='tabler:building' label='Fiches publiées' value={`${o.catalog.published} / ${o.catalog.establishments}`} hint={`${o.catalog.verified} vérifiées`} />
                            <StatCard icon='tabler:school' label='Offres publiées' value={o.catalog.offersPublished} hint={`${o.catalog.offersUpdatedLast90Days} mises à jour en 90 jours`} />
                            <StatCard icon='tabler:star' label='Abonnements Pro / Premium' value={`${o.subscriptions.pro ?? 0} / ${o.subscriptions.premium ?? 0}`} />
                            <StatCard icon='tabler:coin' label='Encaissé ce mois' value={formatAriary(o.revenue.thisMonth)} hint={`${formatAriary(o.revenue.last12Months)} sur 12 mois`} />
                        </div>
                    </Panel>
                </>
            )}
        </AdminShell>
    )
}

/* ------------------------------------------------------------------ */
/* Établissements                                                      */
/* ------------------------------------------------------------------ */

function MemberDialog({ establishment, onClose }: { establishment: ManagedEstablishment; onClose: () => void }) {
    const [email, setEmail] = useState('')
    const [role, setRole] = useState('owner')
    const [error, setError] = useState<ApiError | null>(null)
    const submit = async (e: FormEvent) => {
        e.preventDefault()
        try {
            await api(`/admin/establishments/${establishment.id}/members`, { method: 'POST', body: { email, role } })
            toast.success('Accès donné')
            onClose()
        } catch (err) {
            setError(err as ApiError)
        }
    }
    return (
        <form onSubmit={submit} className='flex flex-col gap-4'>
            {establishment.members && establishment.members.length > 0 && (
                <ul className='flex flex-col gap-2'>
                    {establishment.members.map((m) => (
                        <li key={m.id} className='flex items-center justify-between gap-2 rounded-lg bg-offwhite px-3 py-2'>
                            <span className='text-sm'>{m.name} · {m.email}</span>
                            <Button type='button' size='sm' variant='ghost' onClick={() => run(() => api(`/admin/establishments/${establishment.id}/members/${m.id}`, { method: 'DELETE' }), 'Accès retiré', onClose)}>Retirer</Button>
                        </li>
                    ))}
                </ul>
            )}
            <TextField label="E-mail d'un compte établissement" type='email' required value={email} onChange={(e) => setEmail(e.target.value)} error={error?.field('email')} />
            <SelectField label='Rôle' options={[{ value: 'owner', label: 'Propriétaire' }, { value: 'editor', label: 'Éditeur' }]} value={role} onChange={(e) => setRole(e.target.value)} />
            <Button type='submit'>Donner l&apos;accès</Button>
        </form>
    )
}

function Establishments() {
    const params = useSearchParams()
    const [filters, setFilters] = useState({ status: params.get('status') ?? '', verification: params.get('verification') ?? '', q: '', page: 1 })
    const { data, reload } = useApi<Paginated<ManagedEstablishment>>('/admin/establishments', filters)
    const [members, setMembers] = useState<ManagedEstablishment | null>(null)
    const moderate = (e: ManagedEstablishment, body: Record<string, unknown>, message: string) =>
        run(() => api(`/establishments/${e.id}/moderation`, { method: 'PUT', body }), message, reload)

    return (
        <Panel title='Fiches établissement'>
            <div className='mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3'>
                <TextField label='Rechercher' placeholder='Nom ou ville' value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value, page: 1 })} />
                <SelectField label='Publication' placeholder='Toutes' options={[{ value: 'pending_review', label: 'En attente de validation' }, { value: 'published', label: 'Publiées' }, { value: 'draft', label: 'Brouillons' }, { value: 'suspended', label: 'Suspendues' }]} value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })} />
                <SelectField label='Vérification' placeholder='Toutes' options={[{ value: 'pending', label: 'En cours' }, { value: 'verified', label: 'Vérifiées' }, { value: 'unverified', label: 'Non vérifiées' }]} value={filters.verification} onChange={(e) => setFilters({ ...filters, verification: e.target.value, page: 1 })} />
            </div>
            {!data ? (
                <div className='h-40 rounded-xl bg-offwhite animate-pulse' />
            ) : data.data.length === 0 ? (
                <EmptyState icon='tabler:building' title='Aucune fiche' />
            ) : (
                <>
                    <ul className='flex flex-col gap-3'>
                        {data.data.map((e) => (
                            <li key={e.id} className='flex flex-col gap-3 rounded-xl border border-gray-100 p-4'>
                                <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-2'>
                                    <div className='flex flex-col gap-1'>
                                        <p className='font-semibold text-secondary'>{e.name}</p>
                                        <p className='text-sm text-ink/60'>{e.subCategory || e.category} · {e.city} · {e.members?.length ?? 0} gestionnaire(s) · formule {e.plan.name}</p>
                                        <div className='flex flex-wrap gap-2'>
                                            <Badge tone={STATUS_TONE[e.status]}>{e.statusLabel}</Badge>
                                            <Badge tone={e.verification.status === 'Vérifié' ? 'success' : e.verification.status === 'En cours' ? 'warning' : 'neutral'}>{e.verification.status}</Badge>
                                            {e.accreditation && <Badge tone={e.accreditationVerified ? 'success' : 'neutral'}>Accréditation {e.accreditationVerified ? 'vérifiée' : 'à vérifier'}</Badge>}
                                        </div>
                                    </div>
                                    <ButtonLink href={`/espace/etablissement/?e=${e.id}`} variant='secondary' size='sm'><Icon icon='tabler:edit' /> Gérer la fiche</ButtonLink>
                                </div>
                                {e.accreditation && <p className='text-sm text-ink/70'>Accréditation déclarée : {e.accreditation}</p>}
                                <div className='flex flex-wrap gap-2'>
                                    {e.status !== 'published' && <Button size='sm' onClick={() => moderate(e, { status: 'published' }, 'Fiche publiée')}>Publier</Button>}
                                    {e.status === 'published' && <Button size='sm' variant='danger' onClick={() => moderate(e, { status: 'suspended' }, 'Fiche suspendue')}>Suspendre</Button>}
                                    {e.verification.status !== 'Vérifié' ? (
                                        <Button size='sm' variant='dark' onClick={() => moderate(e, { verification: 'verified' }, 'Badge « vérifié » accordé')}>Accorder le badge vérifié</Button>
                                    ) : (
                                        <Button size='sm' variant='ghost' onClick={() => moderate(e, { verification: 'unverified' }, 'Badge retiré')}>Retirer le badge</Button>
                                    )}
                                    {e.accreditation && (
                                        <Button size='sm' variant='ghost' onClick={() => moderate(e, { accreditationVerified: !e.accreditationVerified }, 'Accréditation mise à jour')}>
                                            {e.accreditationVerified ? "Annuler l'accréditation vérifiée" : 'Accréditation vérifiée'}
                                        </Button>
                                    )}
                                    <Button size='sm' variant='ghost' onClick={() => setMembers(e)}><Icon icon='tabler:users' /> Équipe</Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <Pager page={data.meta.current_page} lastPage={data.meta.last_page} onChange={(page) => setFilters({ ...filters, page })} />
                </>
            )}
            <Dialog open={!!members} onClose={() => setMembers(null)} title={`Équipe — ${members?.name ?? ''}`}>
                {members && <MemberDialog establishment={members} onClose={() => { setMembers(null); reload() }} />}
            </Dialog>
        </Panel>
    )
}

export function AdminEstablishmentsPage() {
    return (
        <AdminShell title='Établissements'>
            <FormAlert tone='info'>Le badge « vérifié » s&apos;accorde après un contrôle réel (identité, autorisation d&apos;ouverture…), jamais du seul fait d&apos;un paiement.</FormAlert>
            <Establishments />
        </AdminShell>
    )
}

/* ------------------------------------------------------------------ */
/* Modération                                                          */
/* ------------------------------------------------------------------ */

type Claim = { id: number; establishment: { id: string; name: string; email: string | null }; user: { name: string; email: string; phone: string | null }; message: string; status: string; statusLabel: string; createdAt: string }
type AdminReview = { id: string; schoolId: string; schoolName: string; formationTitle: string | null; name: string; status: string; rating: number; quote: string; moderation: string; moderationLabel: string; createdAt: string }

function Moderation() {
    const params = useSearchParams()
    const [tab, setTab] = useState(params.get('tab') ?? 'claims')
    const [status, setStatus] = useState<string>('pending')
    const path = tab === 'claims' ? '/admin/claims' : tab === 'reviews' ? '/admin/reviews' : '/admin/reports'
    const effectiveStatus = tab === 'reports' ? (status === 'pending' ? 'open' : status) : status
    const { data, reload } = useApi<Paginated<Claim | AdminReview | Report>>(path, { status: effectiveStatus })

    const tabs = [['claims', 'Revendications'], ['reviews', 'Avis'], ['reports', 'Signalements']]

    return (
        <Panel title='Files de modération'>
            <div className='mb-4 flex flex-wrap gap-2'>
                {tabs.map(([value, label]) => (
                    <button key={value} type='button' aria-pressed={tab === value} onClick={() => { setTab(value); setStatus('pending') }} className={cn('min-h-10 rounded-full px-4 text-sm font-semibold hover:cursor-pointer', tab === value ? 'bg-secondary text-white' : 'bg-offwhite text-secondary')}>
                        {label}
                    </button>
                ))}
                <label className='ml-auto flex items-center gap-2 text-sm text-ink/70'>
                    Afficher
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className='min-h-10 rounded-lg border border-gray-200 px-2'>
                        <option value='pending'>À traiter</option>
                        <option value=''>Tout</option>
                    </select>
                </label>
            </div>

            {!data ? (
                <div className='h-40 rounded-xl bg-offwhite animate-pulse' />
            ) : data.data.length === 0 ? (
                <EmptyState icon='tabler:mood-happy' title='Rien à traiter' />
            ) : (
                <ul className='flex flex-col gap-3'>
                    {tab === 'claims' &&
                        (data.data as Claim[]).map((c) => (
                            <li key={c.id} className='flex flex-col gap-2 rounded-xl border border-gray-100 p-4'>
                                <div className='flex flex-wrap items-center gap-2'>
                                    <Badge tone={c.status === 'pending' ? 'warning' : c.status === 'approved' ? 'success' : 'neutral'}>{c.statusLabel}</Badge>
                                    <span className='text-xs text-ink/50'>{formatDateTime(c.createdAt)}</span>
                                </div>
                                <p className='font-semibold text-secondary'>{c.user.name} demande à gérer « {c.establishment.name} »</p>
                                <p className='text-sm text-ink/70'>{c.user.email}{c.user.phone ? ` · ${c.user.phone}` : ''} — e-mail officiel de la fiche : {c.establishment.email ?? 'non renseigné'}</p>
                                <p className='rounded-lg bg-offwhite px-3 py-2 text-ink/80'>{c.message}</p>
                                {c.status === 'pending' && (
                                    <div className='flex gap-2'>
                                        <Button size='sm' onClick={() => run(() => api(`/admin/claims/${c.id}`, { method: 'PUT', body: { status: 'approved' } }), 'Accès accordé', reload)}>Accepter</Button>
                                        <Button size='sm' variant='ghost' onClick={() => run(() => api(`/admin/claims/${c.id}`, { method: 'PUT', body: { status: 'rejected' } }), 'Demande refusée', reload)}>Refuser</Button>
                                    </div>
                                )}
                            </li>
                        ))}
                    {tab === 'reviews' &&
                        (data.data as AdminReview[]).map((r) => (
                            <li key={r.id} className='flex flex-col gap-2 rounded-xl border border-gray-100 p-4'>
                                <div className='flex flex-wrap items-center gap-2'>
                                    <Badge tone={r.moderation === 'pending' ? 'warning' : r.moderation === 'published' ? 'success' : 'neutral'}>{r.moderationLabel}</Badge>
                                    <span className='text-amber-500' aria-label={`${r.rating} sur 5`}>{'★'.repeat(r.rating)}<span className='text-gray-200'>{'★'.repeat(5 - r.rating)}</span></span>
                                </div>
                                <p className='font-semibold text-secondary'>{r.schoolName}{r.formationTitle ? ` — ${r.formationTitle}` : ''}</p>
                                <p className='text-ink/80'>« {r.quote} »</p>
                                <p className='text-sm text-ink/60'>{r.name}{r.status ? ` · ${r.status}` : ''}</p>
                                <div className='flex gap-2'>
                                    {r.moderation !== 'published' && <Button size='sm' onClick={() => run(() => api(`/admin/reviews/${r.id}`, { method: 'PUT', body: { status: 'published' } }), 'Avis publié', reload)}>Publier</Button>}
                                    {r.moderation !== 'rejected' && <Button size='sm' variant='ghost' onClick={() => run(() => api(`/admin/reviews/${r.id}`, { method: 'PUT', body: { status: 'rejected' } }), 'Avis refusé', reload)}>Refuser</Button>}
                                </div>
                            </li>
                        ))}
                    {tab === 'reports' &&
                        (data.data as Report[]).map((r) => (
                            <li key={r.id} className='flex flex-col gap-2 rounded-xl border border-gray-100 p-4'>
                                <div className='flex flex-wrap items-center gap-2'>
                                    <Badge tone={r.status === 'open' ? 'danger' : 'neutral'}>{r.statusLabel}</Badge>
                                    <Badge tone='info'>{r.reasonLabel}</Badge>
                                    <span className='text-xs text-ink/50'>{formatDateTime(r.createdAt)}</span>
                                </div>
                                <Link href={r.offer ? `/formations/${r.offer.id}/` : `/etablissements/${r.establishment.id}/`} className='font-semibold text-secondary hover:text-primary'>
                                    {r.establishment.name}{r.offer ? ` — ${r.offer.title}` : ''}
                                </Link>
                                <p className='text-ink/80'>{r.message}</p>
                                {r.email && <p className='text-sm text-ink/60'>Contact : {r.email}</p>}
                                {r.status === 'open' && (
                                    <div className='flex gap-2'>
                                        <ButtonLink href={`/espace/etablissement/fiche/?e=${r.establishment.id}`} size='sm' variant='secondary'>Corriger la fiche</ButtonLink>
                                        <Button size='sm' onClick={() => run(() => api(`/admin/reports/${r.id}`, { method: 'PUT', body: { status: 'resolved' } }), 'Signalement clôturé', reload)}>Corrigé</Button>
                                        <Button size='sm' variant='ghost' onClick={() => run(() => api(`/admin/reports/${r.id}`, { method: 'PUT', body: { status: 'dismissed' } }), 'Signalement classé', reload)}>Sans suite</Button>
                                    </div>
                                )}
                            </li>
                        ))}
                </ul>
            )}
        </Panel>
    )
}

export function AdminModerationPage() {
    return (
        <AdminShell title='Modération'>
            <Moderation />
        </AdminShell>
    )
}

/* ------------------------------------------------------------------ */
/* Utilisateurs                                                        */
/* ------------------------------------------------------------------ */

type AdminUser = { id: number; name: string; email: string; role: string; roleLabel: string; phone: string | null; city: string | null; createdAt: string; establishments: { id: string; name: string }[]; inquiriesCount: number }

export function AdminUsersPage() {
    const [filters, setFilters] = useState({ role: '', q: '', page: 1 })
    const { data, reload } = useApi<Paginated<AdminUser>>('/admin/users', filters)

    return (
        <AdminShell title='Utilisateurs'>
            <Panel title='Comptes'>
                <div className='mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3'>
                    <TextField label='Rechercher' placeholder='Nom ou e-mail' value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value, page: 1 })} />
                    <SelectField label='Type de compte' placeholder='Tous' options={[{ value: 'student', label: 'Étudiants' }, { value: 'establishment', label: 'Établissements' }, { value: 'admin', label: 'Administrateurs' }]} value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })} />
                </div>
                {!data ? (
                    <div className='h-40 rounded-xl bg-offwhite animate-pulse' />
                ) : (
                    <>
                        <ul className='flex flex-col divide-y divide-gray-100'>
                            {data.data.map((u) => (
                                <li key={u.id} className='flex flex-col sm:flex-row sm:items-center gap-3 py-3'>
                                    <span className='flex min-w-0 flex-1 flex-col'>
                                        <span className='font-semibold text-secondary'>{u.name}</span>
                                        <span className='truncate text-sm text-ink/60'>{u.email} · inscrit le {formatDateTime(u.createdAt)}</span>
                                        {u.establishments.length > 0 && <span className='text-sm text-ink/60'>{u.establishments.map((e) => e.name).join(', ')}</span>}
                                    </span>
                                    <select
                                        aria-label={`Type de compte de ${u.name}`}
                                        value={u.role}
                                        onChange={(e) => run(() => api(`/admin/users/${u.id}`, { method: 'PATCH', body: { role: e.target.value } }), 'Type de compte modifié', reload)}
                                        className='min-h-11 rounded-lg border border-gray-200 px-3'>
                                        <option value='student'>Étudiant</option>
                                        <option value='establishment'>Établissement</option>
                                        <option value='admin'>Administrateur</option>
                                    </select>
                                    <Button
                                        size='sm'
                                        variant='ghost'
                                        aria-label={`Supprimer le compte de ${u.name}`}
                                        onClick={() => window.confirm(`Supprimer le compte de ${u.name} ?`) && run(() => api(`/admin/users/${u.id}`, { method: 'DELETE' }), 'Compte supprimé', reload)}>
                                        <Icon icon='tabler:trash' />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                        <Pager page={data.meta.current_page} lastPage={data.meta.last_page} onChange={(page) => setFilters({ ...filters, page })} />
                    </>
                )}
            </Panel>
        </AdminShell>
    )
}

/* ------------------------------------------------------------------ */
/* Catalogue : catégories et domaines                                  */
/* ------------------------------------------------------------------ */

const FIELD_LABELS: Record<keyof CategoryType['fields'], string> = {
    diplomas: 'Diplômes',
    programme: 'Programme',
    level: "Niveau d'admission",
    childAge: 'Âge des enfants',
    duration: 'Durée',
    careers: 'Débouchés',
}

function CategoryEditor({ category, onDone }: { category?: CategoryType; onDone: () => void }) {
    const [form, setForm] = useState({
        label: category?.label ?? '',
        shortLabel: category?.shortLabel ?? '',
        icon: category?.icon ?? 'tabler:school',
        offersLabel: category?.offersLabel ?? 'Formations proposées',
        fields: category?.fields ?? { diplomas: true, programme: true, level: true, childAge: false, duration: true, careers: true },
        subCategories: category?.subCategories ?? [],
    })
    const [error, setError] = useState<ApiError | null>(null)
    const submit = async (e: FormEvent) => {
        e.preventDefault()
        try {
            await api(category ? `/categories/${category.id}` : '/categories', { method: category ? 'PATCH' : 'POST', body: form })
            toast.success('Catégorie enregistrée')
            onDone()
        } catch (err) {
            setError(err as ApiError)
        }
    }
    return (
        <form onSubmit={submit} className='flex flex-col gap-4'>
            <TextField label='Libellé' required value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} error={error?.field('label')} />
            <TextField label='Libellé court (filtres)' required value={form.shortLabel} onChange={(e) => setForm({ ...form, shortLabel: e.target.value })} error={error?.field('shortLabel')} />
            <TextField label='Icône (Iconify)' hint='Ex. : tabler:baby-carriage' value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
            <TextField label='Titre de la liste des offres' value={form.offersLabel} onChange={(e) => setForm({ ...form, offersLabel: e.target.value })} />
            <fieldset>
                <legend className='mb-1 text-sm font-semibold text-secondary'>Sections affichées sur les fiches</legend>
                <div className='grid grid-cols-2 gap-x-4'>
                    {(Object.keys(FIELD_LABELS) as (keyof CategoryType['fields'])[]).map((key) => (
                        <Checkbox key={key} label={FIELD_LABELS[key]} checked={form.fields[key]} onChange={(e) => setForm({ ...form, fields: { ...form.fields, [key]: e.target.checked } })} />
                    ))}
                </div>
            </fieldset>
            <ListField label='Sous-catégories' value={form.subCategories} onChange={(v) => setForm({ ...form, subCategories: v })} />
            <Button type='submit'>Enregistrer</Button>
        </form>
    )
}

export function AdminCatalogPage() {
    const { data: categories, reload } = useApi<{ data: CategoryType[] }>('/categories')
    const { data: domains, reload: reloadDomains } = useApi<{ data: { id: string; name: string; icon: string | null; count: number }[] }>('/domains')
    const [editing, setEditing] = useState<CategoryType | 'new' | null>(null)
    const [domainName, setDomainName] = useState('')

    return (
        <AdminShell title='Catalogue'>
            <Panel title="Catégories d'établissement" description="Les sections affichées sur les fiches dépendent de la catégorie." actions={<Button size='sm' onClick={() => setEditing('new')}><Icon icon='tabler:plus' /> Catégorie</Button>}>
                <ul className='flex flex-col gap-3'>
                    {categories?.data.map((c) => (
                        <li key={c.id} className='flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-gray-100 p-4'>
                            <Icon icon={c.icon} className='text-2xl text-primary' />
                            <div className='flex min-w-0 flex-1 flex-col'>
                                <span className='font-semibold text-secondary'>{c.label}</span>
                                <span className='text-sm text-ink/60'>{c.subCategories.join(' · ')}</span>
                            </div>
                            <div className='flex gap-2'>
                                <Button size='sm' variant='secondary' onClick={() => setEditing(c)}>Modifier</Button>
                                <Button size='sm' variant='ghost' aria-label={`Supprimer ${c.label}`} onClick={() => window.confirm(`Supprimer « ${c.label} » ?`) && run(() => api(`/categories/${c.id}`, { method: 'DELETE' }), 'Catégorie supprimée', reload)}>
                                    <Icon icon='tabler:trash' />
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            </Panel>

            <Panel title="Domaines d'études" description='Valeurs du filtre « Domaine d’études » et du domaine des offres.'>
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        run(() => api('/domains', { method: 'POST', body: { name: domainName } }), 'Domaine ajouté', () => { setDomainName(''); return reloadDomains() })
                    }}
                    className='mb-4 flex gap-2 items-end'>
                    <TextField label='Nouveau domaine' className='flex-1' value={domainName} onChange={(e) => setDomainName(e.target.value)} />
                    <Button type='submit' disabled={!domainName.trim()}>Ajouter</Button>
                </form>
                <ul className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                    {domains?.data.map((d) => (
                        <li key={d.id} className='flex items-center gap-2 rounded-lg bg-offwhite px-3 py-2'>
                            <span className='flex-1'>{d.name} <span className='text-sm text-ink/50'>({d.count} offres)</span></span>
                            <Button size='sm' variant='ghost' aria-label={`Renommer ${d.name}`} onClick={() => {
                                const name = window.prompt('Nouveau nom', d.name)
                                if (name && name !== d.name) run(() => api(`/domains/${d.id}`, { method: 'PATCH', body: { name } }), 'Domaine renommé', reloadDomains)
                            }}><Icon icon='tabler:pencil' /></Button>
                            <Button size='sm' variant='ghost' aria-label={`Supprimer ${d.name}`} onClick={() => window.confirm(`Supprimer « ${d.name} » ? Les offres resteront en ligne, sans domaine.`) && run(() => api(`/domains/${d.id}`, { method: 'DELETE' }), 'Domaine supprimé', reloadDomains)}>
                                <Icon icon='tabler:trash' />
                            </Button>
                        </li>
                    ))}
                </ul>
            </Panel>

            <Dialog open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Nouvelle catégorie' : 'Modifier la catégorie'}>
                {editing !== null && <CategoryEditor category={editing === 'new' ? undefined : editing} onDone={() => { setEditing(null); reload() }} />}
            </Dialog>
        </AdminShell>
    )
}

/* ------------------------------------------------------------------ */
/* Facturation                                                         */
/* ------------------------------------------------------------------ */

function PlanEditor({ plan, onDone }: { plan: Plan; onDone: () => void }) {
    const [form, setForm] = useState({ monthlyPrice: String(plan.monthlyPrice ?? ''), yearlyPrice: String(plan.yearlyPrice ?? ''), maxPublishedOffers: String(plan.maxPublishedOffers ?? '') })
    const toNumber = (v: string) => (v.trim() === '' ? null : Number(v))
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                run(
                    () => api(`/admin/plans/${plan.code}`, { method: 'PATCH', body: { monthlyPrice: toNumber(form.monthlyPrice), yearlyPrice: toNumber(form.yearlyPrice), maxPublishedOffers: toNumber(form.maxPublishedOffers) } }),
                    `Formule ${plan.name} mise à jour`,
                    onDone
                )
            }}
            className='grid grid-cols-1 sm:grid-cols-4 gap-3 items-end rounded-xl border border-gray-100 p-4'>
            <p className='font-semibold text-secondary sm:col-span-4'>{plan.name}</p>
            <TextField label='Prix mensuel (Ar)' inputMode='numeric' value={form.monthlyPrice} onChange={(e) => setForm({ ...form, monthlyPrice: e.target.value })} />
            <TextField label='Prix annuel (Ar)' inputMode='numeric' hint='Vide = non proposé' value={form.yearlyPrice} onChange={(e) => setForm({ ...form, yearlyPrice: e.target.value })} />
            <TextField label='Offres publiées max.' inputMode='numeric' hint='Vide = illimité' value={form.maxPublishedOffers} onChange={(e) => setForm({ ...form, maxPublishedOffers: e.target.value })} />
            <Button type='submit' variant='secondary'>Enregistrer</Button>
        </form>
    )
}

export function AdminBillingPage() {
    const [status, setStatus] = useState('pending')
    const { data: invoices, reload } = useApi<Paginated<Invoice>>('/admin/invoices', { status })
    const { data: subscriptions, reload: reloadSubscriptions } = useApi<Paginated<Subscription>>('/admin/subscriptions')
    const { data: plans, reload: reloadPlans } = useApi<{ data: Plan[] }>('/plans')
    const { data: campaigns } = useApi<Paginated<Campaign>>('/admin/campaigns')

    return (
        <AdminShell title='Facturation'>
            <Panel
                title='Factures'
                description="Confirmez une facture quand le paiement est reçu : la formule s'active aussitôt et l'établissement est prévenu."
                actions={
                    <select aria-label='Statut des factures' value={status} onChange={(e) => setStatus(e.target.value)} className='min-h-10 rounded-lg border border-gray-200 px-2'>
                        <option value='pending'>En attente</option>
                        <option value='paid'>Payées</option>
                        <option value='cancelled'>Annulées</option>
                        <option value=''>Toutes</option>
                    </select>
                }>
                {!invoices ? (
                    <div className='h-32 rounded-xl bg-offwhite animate-pulse' />
                ) : invoices.data.length === 0 ? (
                    <EmptyState icon='tabler:receipt' title='Aucune facture' />
                ) : (
                    <ul className='flex flex-col gap-3'>
                        {invoices.data.map((i) => (
                            <li key={i.id} className='flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-gray-100 p-4'>
                                <div className='flex min-w-0 flex-1 flex-col gap-1'>
                                    <p className='font-semibold text-secondary'>{i.number} · {i.establishment.name}</p>
                                    <p className='text-sm text-ink/60'>
                                        {i.plan.name} {i.billingCycleLabel.toLowerCase()} · {formatAriary(i.amount)} · {i.paymentMethodLabel} · {formatDateTime(i.createdAt)}
                                    </p>
                                    <p className='text-sm'>{i.paymentReference ? <>Référence : <strong>{i.paymentReference}</strong></> : <span className='text-ink/50'>Référence de paiement non encore indiquée</span>}</p>
                                </div>
                                {i.status === 'pending' ? (
                                    <div className='flex gap-2'>
                                        <Button size='sm' onClick={() => window.confirm(`Confirmer le paiement de ${formatAriary(i.amount)} ?`) && run(() => api(`/admin/invoices/${i.id}/confirm`, { method: 'PUT' }), 'Paiement confirmé, formule activée', () => { reload(); reloadSubscriptions() })}>Paiement reçu</Button>
                                        <Button size='sm' variant='ghost' onClick={() => run(() => api(`/admin/invoices/${i.id}/cancel`, { method: 'PUT' }), 'Facture annulée', reload)}>Annuler</Button>
                                    </div>
                                ) : (
                                    <Badge tone={i.status === 'paid' ? 'success' : 'neutral'}>{i.statusLabel}</Badge>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </Panel>

            <Panel title='Abonnements en cours'>
                {subscriptions?.data.length === 0 ? (
                    <p className='text-ink/60'>Aucun abonnement payant.</p>
                ) : (
                    <ul className='flex flex-col divide-y divide-gray-100'>
                        {subscriptions?.data.map((s) => (
                            <li key={s.id} className='flex flex-wrap items-center justify-between gap-3 py-3'>
                                <span className='flex flex-col'>
                                    <span className='font-semibold text-secondary'>{s.establishment?.name} · {s.plan.name}</span>
                                    <span className='text-sm text-ink/60'>{s.statusLabel}{s.endsAt ? ` jusqu'au ${formatDateTime(s.endsAt)}` : ''}</span>
                                </span>
                                <Button size='sm' variant='ghost' onClick={() => window.confirm('Résilier cet abonnement maintenant ?') && run(() => api(`/admin/subscriptions/${s.id}/cancel`, { method: 'PUT' }), 'Abonnement résilié', reloadSubscriptions)}>Résilier</Button>
                            </li>
                        ))}
                    </ul>
                )}
            </Panel>

            <Panel title='Prix et limites des formules' description='Hypothèses de lancement, à ajuster après les entretiens avec les établissements. Chaque changement est journalisé.'>
                <div className='flex flex-col gap-3'>
                    {plans?.data.map((plan) => <PlanEditor key={`${plan.code}-${plan.monthlyPrice}-${plan.yearlyPrice}-${plan.maxPublishedOffers}`} plan={plan} onDone={reloadPlans} />)}
                </div>
            </Panel>

            <Panel title='Campagnes Premium'>
                {campaigns?.data.length === 0 ? (
                    <p className='text-ink/60'>Aucune campagne.</p>
                ) : (
                    <ul className='flex flex-col divide-y divide-gray-100'>
                        {campaigns?.data.map((c) => (
                            <li key={c.id} className='flex flex-wrap items-center justify-between gap-2 py-3'>
                                <span className='flex flex-col'>
                                    <span className='font-semibold text-secondary'>{c.title}</span>
                                    <span className='text-sm text-ink/60'>{c.establishment.name} · {c.offer.title} · {c.startsOn} → {c.endsOn}</span>
                                </span>
                                <Badge tone={c.isRunning ? 'success' : 'neutral'}>{c.isRunning ? 'En diffusion' : c.statusLabel}</Badge>
                            </li>
                        ))}
                    </ul>
                )}
            </Panel>
        </AdminShell>
    )
}

/* ------------------------------------------------------------------ */
/* Journal d'audit                                                     */
/* ------------------------------------------------------------------ */

type AuditLog = { id: number; action: string; user: { name: string; email: string } | null; subjectType: string | null; subjectId: number | null; meta: Record<string, unknown>; createdAt: string }

const ACTION_LABELS: Record<string, string> = {
    'establishment.moderated': 'Fiche modérée',
    'establishment.deleted': 'Fiche supprimée',
    'establishment.verification_requested': 'Vérification demandée',
    'establishment.claim_approved': 'Revendication acceptée',
    'establishment.claim_rejected': 'Revendication refusée',
    'establishment.member_added': 'Accès donné',
    'establishment.member_removed': 'Accès retiré',
    'offer.status_changed': "Statut d'offre modifié",
    'offer.deleted': 'Offre supprimée',
    'inquiries.exported': 'Export des demandes',
    'subscription.requested': 'Formule demandée',
    'subscription.activated': 'Formule activée',
    'subscription.cancelled': 'Abonnement résilié',
    'subscription.expired': 'Abonnement expiré',
    'invoice.cancelled': 'Facture annulée',
    'plan.updated': 'Formule modifiée',
    'review.moderated': 'Avis modéré',
    'user.role_changed': 'Type de compte modifié',
    'user.deleted': 'Compte supprimé',
    'campaign.created': 'Campagne créée',
}

export function AdminAuditPage() {
    const [page, setPage] = useState(1)
    const { data } = useApi<Paginated<AuditLog>>('/admin/audit-logs', { page })

    return (
        <AdminShell title="Journal d'audit">
            <Panel title='Actions importantes' description='Validations, changements de formule, suppressions et exports.'>
                {!data ? (
                    <div className='h-40 rounded-xl bg-offwhite animate-pulse' />
                ) : (
                    <>
                        <ul className='flex flex-col divide-y divide-gray-100'>
                            {data.data.map((log) => (
                                <li key={log.id} className='flex flex-col gap-1 py-3'>
                                    <span className='flex flex-wrap items-center gap-2'>
                                        <span className='font-semibold text-secondary'>{ACTION_LABELS[log.action] ?? log.action}</span>
                                        {log.subjectType && <Badge>{log.subjectType} #{log.subjectId}</Badge>}
                                    </span>
                                    <span className='text-sm text-ink/60'>{formatDateTime(log.createdAt)} · {log.user ? `${log.user.name} (${log.user.email})` : 'Système'}</span>
                                    {Object.keys(log.meta).length > 0 && (
                                        <code className='block overflow-x-auto rounded bg-offwhite px-2 py-1 text-xs text-ink/70'>{JSON.stringify(log.meta)}</code>
                                    )}
                                </li>
                            ))}
                        </ul>
                        <Pager page={data.meta.current_page} lastPage={data.meta.last_page} onChange={setPage} />
                    </>
                )}
            </Panel>
        </AdminShell>
    )
}
