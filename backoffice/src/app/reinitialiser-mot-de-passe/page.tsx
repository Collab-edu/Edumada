'use client'
import { Suspense, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CAlert, CButton, CCard, CCardBody, CCol, CContainer, CForm, CFormInput, CRow, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle } from '@coreui/icons'
import { api, errorMessage, fieldError } from '@/lib/api'
import { Loading } from '@/components/ui'

/** Nouveau mot de passe depuis le lien reçu par e-mail (?token=…&email=…), valable une fois, 60 minutes. */
function ResetForm() {
    const params = useSearchParams()
    const token = params.get('token') ?? ''
    const email = params.get('email') ?? ''
    const [password, setPassword] = useState('')
    const [confirmation, setConfirmation] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<unknown>(null)
    const [done, setDone] = useState('')
    const mismatch = confirmation !== '' && confirmation !== password
    const tokenError = fieldError(error, 'token')

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const res = await api<{ message: string }>('/auth/reset-password', {
                method: 'POST',
                body: { token, email, password, password_confirmation: confirmation },
            })
            setDone(res.message)
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
                                    Nouveau mot de passe
                                </h1>
                                {done ? (
                                    <>
                                        <CAlert color='success' className='d-flex gap-2 mt-3'>
                                            <CIcon icon={cilCheckCircle} className='flex-shrink-0 mt-1' />
                                            <span>{done}</span>
                                        </CAlert>
                                        <CButton color='danger' className='w-100 text-white fw-semibold' href={`/connexion/?email=${encodeURIComponent(email)}`}>
                                            Se connecter
                                        </CButton>
                                    </>
                                ) : !token || !email ? (
                                    <CAlert color='warning' className='mt-3'>
                                        Ce lien est incomplet. Ouvrez le lien reçu par e-mail en entier, ou <Link href='/mot-de-passe-oublie/'>demandez-en un nouveau</Link>.
                                    </CAlert>
                                ) : (
                                    <CForm onSubmit={submit} noValidate>
                                        <p className='text-body-secondary'>
                                            Pour le compte <strong>{email}</strong>.
                                        </p>
                                        {tokenError && (
                                            <CAlert color='danger'>
                                                {tokenError} <Link href={`/mot-de-passe-oublie/?email=${encodeURIComponent(email)}`}>Demander un nouveau lien</Link>
                                            </CAlert>
                                        )}
                                        {!!error && !tokenError && !fieldError(error, 'password') && <CAlert color='danger'>{errorMessage(error)}</CAlert>}
                                        <CFormInput
                                            className='mb-3'
                                            type='password'
                                            label='Nouveau mot de passe'
                                            autoComplete='new-password'
                                            text='8 caractères au moins, avec des lettres et des chiffres.'
                                            invalid={!!fieldError(error, 'password')}
                                            feedbackInvalid={fieldError(error, 'password')}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <CFormInput
                                            className='mb-4'
                                            type='password'
                                            label='Confirmez le mot de passe'
                                            autoComplete='new-password'
                                            invalid={mismatch}
                                            feedbackInvalid='Les deux mots de passe ne correspondent pas.'
                                            onChange={(e) => setConfirmation(e.target.value)}
                                        />
                                        <CButton color='danger' className='px-4 w-100 text-white fw-semibold' type='submit' disabled={loading || !password || mismatch}>
                                            {loading && <CSpinner size='sm' className='me-2' />}
                                            Enregistrer le mot de passe
                                        </CButton>
                                    </CForm>
                                )}
                                {!done && (
                                    <div className='text-center mt-4'>
                                        <Link href='/connexion/' className='fw-semibold text-decoration-none'>
                                            Retour à la connexion
                                        </Link>
                                    </div>
                                )}
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
            </CContainer>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<Loading />}>
            <ResetForm />
        </Suspense>
    )
}
