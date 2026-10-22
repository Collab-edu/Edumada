'use client'
import { Suspense, useEffect, useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CAlert, CButton, CCard, CCardBody, CCol, CContainer, CForm, CFormInput, CInputGroup, CInputGroupText, CRow, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilBullhorn, cilChartLine, cilEnvelopeClosed, cilInbox, cilLockLocked } from '@coreui/icons'
import { StudentAccountError, useAuth } from '@/context/AuthContext'
import { SITE_URL, errorMessage } from '@/lib/api'
import { Loading } from '@/components/ui'

const PERKS = [
    { icon: cilInbox, text: 'Recevez et suivez les demandes des futurs étudiants' },
    { icon: cilChartLine, text: 'Mesurez les vues et les clics sur vos offres' },
    { icon: cilBullhorn, text: 'Mettez vos formations en avant' },
]

function LoginForm() {
    const { user, loading: sessionLoading, login } = useAuth()
    const router = useRouter()
    const params = useSearchParams()
    const [email, setEmail] = useState(params.get('email') ?? '')
    // Page à ouvrir après connexion (ex. : /formule/?plan=pro depuis l'inscription) ; adresses internes uniquement.
    const requested = params.get('next')
    const next = requested && requested.startsWith('/') && !requested.startsWith('//') ? requested : '/dashboard/'
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)
    // Le bouton reste inactif tant que React n'a pas pris la main (sinon envoi natif du formulaire).
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])

    useEffect(() => {
        if (!sessionLoading && user) router.replace(next)
    }, [sessionLoading, user, router, next])

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await login(email, password)
            router.replace(next)
        } catch (err) {
            setError(err)
        } finally {
            setLoading(false)
        }
    }

    const student = error instanceof StudentAccountError

    return (
        <div className='bo-login d-flex flex-row align-items-center py-4'>
            <CContainer>
                <CRow className='justify-content-center g-4 align-items-stretch'>
                    <CCol md={7} lg={5}>
                        <CCard className='p-2 p-sm-4 h-100'>
                            <CCardBody>
                                <CForm onSubmit={submit} method='post'>
                                    <span className='bo-eyebrow mb-3'>Back-office</span>
                                    <h1 className='h2 fw-bold' style={{ color: 'var(--edu-teal)' }}>
                                        Connexion
                                    </h1>
                                    <p className='text-body-secondary'>Établissements et équipe Edumada</p>
                                    {!!error && (
                                        <CAlert color={student ? 'info' : 'danger'}>
                                            {errorMessage(error)}
                                            {student && (
                                                <>
                                                    {' '}
                                                    <a href={`${SITE_URL}/espace/etudiant/`}>Aller sur le site</a>
                                                </>
                                            )}
                                        </CAlert>
                                    )}
                                    <CInputGroup className='mb-3'>
                                        <CInputGroupText>
                                            <CIcon icon={cilEnvelopeClosed} />
                                        </CInputGroupText>
                                        <CFormInput
                                            type='email'
                                            placeholder='Adresse e-mail'
                                            aria-label='Adresse e-mail'
                                            autoComplete='email'
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </CInputGroup>
                                    <CInputGroup className='mb-4'>
                                        <CInputGroupText>
                                            <CIcon icon={cilLockLocked} />
                                        </CInputGroupText>
                                        <CFormInput
                                            type='password'
                                            placeholder='Mot de passe'
                                            aria-label='Mot de passe'
                                            autoComplete='current-password'
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </CInputGroup>
                                    <CButton color='danger' className='px-4 w-100 text-white fw-semibold' type='submit' disabled={loading || !mounted}>
                                        {loading && <CSpinner size='sm' className='me-2' />}
                                        Se connecter
                                    </CButton>
                                </CForm>
                            </CCardBody>
                        </CCard>
                    </CCol>
                    <CCol md={7} lg={5}>
                        <div className='bo-login-aside rounded-4 p-4 p-sm-5 h-100 d-flex flex-column justify-content-center'>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src='/edumada-logo-white.svg' alt='Edumada' height={48} className='mb-4 align-self-start' />
                            <h2 className='h4 fw-bold'>Vous êtes un établissement ?</h2>
                            <p className='text-white-50'>Créez gratuitement votre compte sur le site Edumada, puis gérez ici votre fiche et vos offres.</p>
                            <ul className='list-unstyled my-3 d-grid gap-3'>
                                {PERKS.map((perk) => (
                                    <li key={perk.text} className='d-flex align-items-center gap-3'>
                                        <span className='bo-icon-chip chip-red'>
                                            <CIcon icon={perk.icon} />
                                        </span>
                                        <span>{perk.text}</span>
                                    </li>
                                ))}
                            </ul>
                            <div>
                                <CButton color='light' variant='outline' className='mt-2' href={`${SITE_URL}/tarifs/`}>
                                    Créer un compte établissement
                                </CButton>
                            </div>
                        </div>
                    </CCol>
                </CRow>
            </CContainer>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<Loading />}>
            <LoginForm />
        </Suspense>
    )
}
