'use client'
import { useState, type FormEvent } from 'react'
import { CButton, CCol, CForm, CFormInput, CRow } from '@coreui/react'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { api, ApiError } from '@/lib/api'
import type { User } from '@/lib/types'
import { ErrorAlert, PageCard } from '@/components/ui'
import { cilLockLocked, cilUser } from '@coreui/icons'
import PageBanner from '@/components/PageBanner'

export default function Account() {
    const { user, setUser } = useAuth()
    const toast = useToast()
    const [profile, setProfile] = useState({ name: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '' })
    const [passwords, setPasswords] = useState({ currentPassword: '', password: '', password_confirmation: '' })
    const [error, setError] = useState<unknown>(null)
    const err = (f: string) => (error instanceof ApiError ? error.field(f) : undefined)

    const saveProfile = async (e: FormEvent) => {
        e.preventDefault()
        setError(null)
        try {
            setUser((await api<{ data: User }>('/me', { method: 'PATCH', body: profile })).data)
            toast.success('Profil enregistré')
        } catch (ex) {
            setError(ex)
        }
    }

    const savePassword = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget
        setError(null)
        try {
            await api('/me/password', { method: 'PUT', body: passwords })
            setPasswords({ currentPassword: '', password: '', password_confirmation: '' })
            // Champs non contrôlés (le mot de passe n'est pas recopié dans le HTML) : on vide le formulaire.
            form.reset()
            toast.success('Mot de passe modifié')
        } catch (ex) {
            setError(ex)
        }
    }

    return (
        <>
            <PageBanner title={user?.name} />
            {error instanceof ApiError && Object.keys(error.errors).length === 0 && <ErrorAlert error={error} />}
            <CRow>
                <CCol lg={6}>
                    <PageCard icon={cilUser} title='Mes informations'>
                        <CForm onSubmit={saveProfile}>
                            <CFormInput
                                className='mb-3'
                                label='Nom'
                                value={profile.name}
                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                invalid={!!err('name')}
                                feedbackInvalid={err('name')}
                            />
                            <CFormInput
                                className='mb-3'
                                label='E-mail'
                                type='email'
                                value={profile.email}
                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                invalid={!!err('email')}
                                feedbackInvalid={err('email')}
                            />
                            <CFormInput
                                className='mb-3'
                                label='Téléphone'
                                type='tel'
                                value={profile.phone}
                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                            />
                            <CButton type='submit' color='primary'>
                                Enregistrer
                            </CButton>
                        </CForm>
                    </PageCard>
                </CCol>
                <CCol lg={6}>
                    <PageCard icon={cilLockLocked} title='Mot de passe'>
                        <CForm onSubmit={savePassword}>
                            <CFormInput
                                className='mb-3'
                                label='Mot de passe actuel'
                                type='password'
                                autoComplete='current-password'
                                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                invalid={!!err('currentPassword')}
                                feedbackInvalid={err('currentPassword')}
                            />
                            <CFormInput
                                className='mb-3'
                                label='Nouveau mot de passe'
                                text='8 caractères au moins, avec des lettres et des chiffres.'
                                type='password'
                                autoComplete='new-password'
                                onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                                invalid={!!err('password')}
                                feedbackInvalid={err('password')}
                            />
                            <CFormInput
                                className='mb-3'
                                label='Confirmation'
                                type='password'
                                autoComplete='new-password'
                                onChange={(e) => setPasswords({ ...passwords, password_confirmation: e.target.value })}
                            />
                            <CButton type='submit' color='secondary'>
                                Changer le mot de passe
                            </CButton>
                        </CForm>
                    </PageCard>
                </CCol>
            </CRow>
        </>
    )
}
