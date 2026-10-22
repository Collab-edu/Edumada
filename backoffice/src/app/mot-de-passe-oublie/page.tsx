'use client'
import { Suspense, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CAlert, CButton, CCard, CCardBody, CCol, CContainer, CForm, CFormInput, CInputGroup, CInputGroupText, CRow, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilEnvelopeClosed, cilEnvelopeLetter } from '@coreui/icons'
import { api, errorMessage, fieldError } from '@/lib/api'
import { Loading } from '@/components/ui'

/** Mot de passe oublié : l'API envoie un lien par e-mail pour en choisir un nouveau. */
function ForgotForm() {
    const [email, setEmail] = useState(useSearchParams().get('email') ?? '')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)
    const [sent, setSent] = useState('')

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            setSent((await api<{ message: string }>('/auth/forgot-password', { method: 'POST', body: { email } })).message)
        } catch (err) {
            setError(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='bo-login d-flex flex-row align-items-center py-4'>
            <CContainer>
                <CRow className='justify-content-center'>
                    <CCol md={7} lg={5}>
                        <CCard className='p-2 p-sm-4'>
                            <CCardBody>
                                <span className='bo-eyebrow mb-3'>Back-office</span>
                                <h1 className='h2 fw-bold' style={{ color: 'var(--edu-teal)' }}>
                                    Mot de passe oublié
                                </h1>
                                {sent ? (
                                    <>
                                        <CAlert color='success' className='d-flex gap-2 mt-3'>
                                            <CIcon icon={cilEnvelopeLetter} className='flex-shrink-0 mt-1' />
                                            <span>{sent}</span>
                                        </CAlert>
                                        <p className='small text-body-secondary'>Pensez à regarder dans les courriers indésirables. Le lien est valable 60 minutes.</p>
                                    </>
                                ) : (
                                    <CForm onSubmit={submit} noValidate>
                                        <p className='text-body-secondary'>Indiquez l&apos;adresse e-mail de votre compte : nous vous enverrons un lien pour choisir un nouveau mot de passe.</p>
                                        {!!error && !fieldError(error, 'email') && <CAlert color='danger'>{errorMessage(error)}</CAlert>}
                                        <CInputGroup className='mb-1'>
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
                                                invalid={!!fieldError(error, 'email')}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </CInputGroup>
                                        {fieldError(error, 'email') && <div className='invalid-feedback d-block mb-2'>{fieldError(error, 'email')}</div>}
                                        <CButton color='danger' className='px-4 w-100 text-white fw-semibold mt-3' type='submit' disabled={loading || !email}>
                                            {loading && <CSpinner size='sm' className='me-2' />}
                                            Envoyer le lien
                                        </CButton>
                                    </CForm>
                                )}
                                <div className='text-center mt-4'>
                                    <Link href='/connexion/' className='fw-semibold text-decoration-none'>
                                        Retour à la connexion
                                    </Link>
                                </div>
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
            </CContainer>
        </div>
    )
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={<Loading />}>
            <ForgotForm />
        </Suspense>
    )
}
