'use client'
import { useState, type FormEvent } from 'react'
import { CAlert, CButton, CCol, CForm, CFormInput, CFormSelect, CInputGroup, CRow, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCopy, cilPeople, cilReload, cilTrash, cilUserPlus } from '@coreui/icons'
import { useCurrentEstablishment } from '@/context/EstablishmentContext'
import { useToast } from '@/context/ToastContext'
import { api, errorMessage, fieldError, isGeneralError } from '@/lib/api'
import { useApi } from '@/lib/useApi'
import { formatDate } from '@/lib/format'
import { ErrorAlert, Loading, PageCard } from '@/components/ui'
import PageBanner from '@/components/PageBanner'

type Member = {
    id: number
    name: string
    email: string
    phone?: string | null
    jobTitle?: string | null
    role: 'owner' | 'editor'
    roleLabel: string
    addedAt?: string | null
    isYou: boolean
}

const ROLES = [
    { value: 'editor', label: 'Éditeur', text: 'Gère la fiche, les offres et les demandes.' },
    { value: 'owner', label: 'Propriétaire', text: 'Tout, plus l’équipe, la formule et les factures.' },
] as const

const initials = (name: string) =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join('')

/** Mot de passe provisoire lisible : lettres et chiffres, sans caractères ambigus. */
function generatePassword() {
    const letters = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ'
    const digits = '23456789'
    const pick = (set: string, n: number) => Array.from(crypto.getRandomValues(new Uint32Array(n)), (v) => set[v % set.length]).join('')
    return `${pick(letters, 6)}${pick(digits, 4)}`
}

const empty = { name: '', email: '', jobTitle: '', role: 'editor', password: '' }

/**
 * Équipe de l'établissement : les comptes qui gèrent la fiche. Un compte ne gère qu'un seul
 * établissement ; seuls les propriétaires ajoutent, modifient ou retirent un membre.
 */
export default function Team() {
    const { current: e } = useCurrentEstablishment()
    const toast = useToast()
    const { data, loading, error: loadError, reload } = useApi<{ data: Member[] }>(`/establishments/${e.id}/members`)
    const [form, setForm] = useState(empty)
    const [showPassword, setShowPassword] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<unknown>(null)
    // Identifiants du compte créé, à transmettre à la personne (affichés jusqu'à fermeture).
    const [created, setCreated] = useState<{ name: string; email: string; password: string } | null>(null)
    const members = data?.data ?? []
    const isOwner = members.find((m) => m.isYou)?.role === 'owner'
    const set = (key: keyof typeof empty) => (ev: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: ev.target.value }))
    const err = (field: string) => fieldError(error, field)

    const add = async (ev: FormEvent) => {
        ev.preventDefault()
        setSaving(true)
        setError(null)
        try {
            const res = await api<{ message: string }>(`/establishments/${e.id}/members`, {
                method: 'POST',
                body: { ...form, jobTitle: form.jobTitle || null, password: form.password || null, name: form.name || null },
            })
            toast.success(res.message)
            setCreated(form.password ? { name: form.name || form.email, email: form.email, password: form.password } : null)
            setForm(empty)
            setShowPassword(false)
            reload()
        } catch (ex) {
            setError(ex)
        } finally {
            setSaving(false)
        }
    }

    const changeRole = async (member: Member, role: string) => {
        try {
            await api(`/establishments/${e.id}/members/${member.id}`, { method: 'PUT', body: { role } })
            toast.success(`${member.name} est maintenant ${role === 'owner' ? 'propriétaire' : 'éditeur'}.`)
            reload()
        } catch (ex) {
            toast.error(errorMessage(ex))
            reload()
        }
    }

    const remove = async (member: Member) => {
        if (!window.confirm(`Retirer ${member.name} de l'équipe ? Cette personne n'aura plus accès au back-office de ${e.name}.`)) return
        try {
            await api(`/establishments/${e.id}/members/${member.id}`, { method: 'DELETE' })
            toast.success(`${member.name} a été retiré(e) de l'équipe.`)
            reload()
        } catch (ex) {
            toast.error(errorMessage(ex))
        }
    }

    return (
        <>
            <PageBanner />

            <div className='card bo-list-card mb-4'>
                <div className='bo-list-tools d-flex flex-wrap align-items-center gap-2'>
                    <span className='bo-card-icon' aria-hidden='true'>
                        <CIcon icon={cilPeople} />
                    </span>
                    <div className='me-auto'>
                        <h2 className='h5 mb-0'>Membres de l&apos;équipe</h2>
                        <p className='small text-body-secondary mb-0'>Les personnes qui gèrent {e.name} sur Edumada.</p>
                    </div>
                </div>
                {loadError ? (
                    <div className='p-4'>
                        <ErrorAlert error={loadError} />
                    </div>
                ) : loading && !data ? (
                    <div className='p-4'>
                        <Loading />
                    </div>
                ) : (
                    <div className='table-responsive'>
                        <table className='bo-list-table'>
                            <thead>
                                <tr>
                                    <th>Membre</th>
                                    <th>Fonction</th>
                                    <th>Rôle</th>
                                    <th>Ajouté le</th>
                                    {isOwner && <th aria-label='Actions' />}
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((m) => (
                                    <tr key={m.id} style={{ cursor: 'default' }}>
                                        <td>
                                            <div className='d-flex align-items-center gap-3'>
                                                <span className='bo-list-avatar'>{initials(m.name)}</span>
                                                <div style={{ minWidth: 0 }}>
                                                    <div className='bo-list-name'>
                                                        {m.name}
                                                        {m.isYou && <span className='bo-tag ms-2 py-0 small'>Vous</span>}
                                                    </div>
                                                    <div className='bo-list-sub'>{m.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{m.jobTitle || <span className='text-body-tertiary'>—</span>}</td>
                                        <td>
                                            {isOwner && !m.isYou ? (
                                                <CFormSelect
                                                    size='sm'
                                                    value={m.role}
                                                    onChange={(ev) => changeRole(m, ev.target.value)}
                                                    aria-label={`Rôle de ${m.name}`}
                                                    style={{ width: 'auto' }}
                                                >
                                                    {ROLES.map((r) => (
                                                        <option key={r.value} value={r.value}>
                                                            {r.label}
                                                        </option>
                                                    ))}
                                                </CFormSelect>
                                            ) : (
                                                <span className={`bo-pill ${m.role === 'owner' ? 'bo-pill-info' : 'bo-pill-secondary'}`}>{m.roleLabel}</span>
                                            )}
                                        </td>
                                        <td className='text-nowrap'>{m.addedAt ? formatDate(m.addedAt) : '—'}</td>
                                        {isOwner && (
                                            <td className='text-end'>
                                                {!m.isYou && (
                                                    <CButton color='danger' variant='ghost' size='sm' onClick={() => remove(m)} aria-label={`Retirer ${m.name}`} title='Retirer de l’équipe'>
                                                        <CIcon icon={cilTrash} />
                                                    </CButton>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className='bo-list-foot'>
                    <span>
                        {members.length} membre{members.length > 1 ? 's' : ''}
                    </span>
                    <span className='small'>Un compte ne peut gérer qu&apos;un seul établissement.</span>
                </div>
            </div>

            {isOwner ? (
                <PageCard icon={cilUserPlus} title='Ajouter un membre' subtitle='Donnez accès au back-office à une personne de votre établissement'>
                    {created && (
                        <CAlert color='success' dismissible onClose={() => setCreated(null)}>
                            <strong>Compte créé pour {created.name}.</strong> Transmettez-lui ses identifiants : ils ne seront plus affichés ensuite.
                            <div className='d-flex flex-wrap align-items-center gap-2 mt-2'>
                                <code className='px-2 py-1 bg-body rounded'>{created.email}</code>
                                <code className='px-2 py-1 bg-body rounded'>{created.password}</code>
                                <CButton
                                    size='sm'
                                    color='success'
                                    variant='outline'
                                    onClick={() =>
                                        navigator.clipboard
                                            .writeText(`Back-office Edumada
E-mail : ${created.email}
Mot de passe provisoire : ${created.password}`)
                                            .then(() => toast.success('Identifiants copiés.'))
                                    }
                                >
                                    <CIcon icon={cilCopy} className='me-1' />
                                    Copier
                                </CButton>
                            </div>
                        </CAlert>
                    )}
                    <CForm onSubmit={add} noValidate>
                        {isGeneralError(error) && <ErrorAlert error={error} />}
                        <CRow className='g-3'>
                            <CCol md={6}>
                                <CFormInput label='Nom complet' value={form.name} onChange={set('name')} invalid={!!err('name')} feedbackInvalid={err('name')} autoComplete='off' />
                            </CCol>
                            <CCol md={6}>
                                <CFormInput
                                    label='Adresse e-mail'
                                    type='email'
                                    required
                                    value={form.email}
                                    onChange={set('email')}
                                    invalid={!!err('email')}
                                    feedbackInvalid={err('email')}
                                    autoComplete='off'
                                />
                            </CCol>
                            <CCol md={6}>
                                <CFormInput label='Fonction (facultatif)' placeholder='Ex. : Responsable des admissions' value={form.jobTitle} onChange={set('jobTitle')} />
                            </CCol>
                            <CCol md={6}>
                                <CFormSelect label='Rôle' value={form.role} onChange={set('role')} text={ROLES.find((r) => r.value === form.role)?.text}>
                                    {ROLES.map((r) => (
                                        <option key={r.value} value={r.value}>
                                            {r.label}
                                        </option>
                                    ))}
                                </CFormSelect>
                            </CCol>
                            <CCol md={6}>
                                <label htmlFor='bo-team-password' className='form-label'>
                                    Mot de passe provisoire
                                </label>
                                <CInputGroup>
                                    <CFormInput
                                        id='bo-team-password'
                                        type={showPassword ? 'text' : 'password'}
                                        value={form.password}
                                        onChange={set('password')}
                                        invalid={!!err('password')}
                                        autoComplete='new-password'
                                    />
                                    <CButton type='button' color='secondary' variant='outline' onClick={() => setShowPassword((v) => !v)}>
                                        {showPassword ? 'Masquer' : 'Afficher'}
                                    </CButton>
                                    <CButton
                                        type='button'
                                        color='secondary'
                                        variant='outline'
                                        onClick={() => {
                                            setForm((f) => ({ ...f, password: generatePassword() }))
                                            setShowPassword(true)
                                        }}
                                        title='Générer un mot de passe'
                                    >
                                        <CIcon icon={cilReload} className='me-1' />
                                        Générer
                                    </CButton>
                                </CInputGroup>
                                {err('password') ? (
                                    <div className='invalid-feedback d-block'>{err('password')}</div>
                                ) : (
                                    <div className='form-text'>8 caractères au moins, lettres et chiffres. La personne pourra le changer dans « Mon compte ».</div>
                                )}
                            </CCol>
                        </CRow>
                        <CAlert color='light' className='mt-3 mb-3 small'>
                            Si l&apos;adresse correspond déjà à un compte établissement sans fiche, il est simplement rattaché à votre équipe : le nom et le mot de passe ne sont
                            pas nécessaires. La personne reçoit un e-mail pour se connecter.
                        </CAlert>
                        <CButton type='submit' color='danger' className='text-white' disabled={saving || !form.email}>
                            {saving ? <CSpinner size='sm' className='me-2' /> : <CIcon icon={cilUserPlus} className='me-2' />}
                            Ajouter à l&apos;équipe
                        </CButton>
                    </CForm>
                </PageCard>
            ) : (
                data && (
                    <CAlert color='info'>
                        Seuls les propriétaires de la fiche peuvent ajouter ou retirer des membres. Demandez-le à l&apos;un d&apos;eux si besoin.
                    </CAlert>
                )
            )}
        </>
    )
}
