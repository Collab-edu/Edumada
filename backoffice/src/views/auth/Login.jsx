import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilEnvelopeClosed, cilLockLocked } from '@coreui/icons'
import { useAuth } from '../../context/AuthContext'
import { SITE_URL } from '../../lib/api'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState(
    new URLSearchParams(window.location.hash.split('?')[1]).get('email') ?? '',
  )
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={10} lg={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={submit}>
                    <h1>Connexion</h1>
                    <p className="text-body-secondary">
                      Back-office Edumada : établissements et administration
                    </p>
                    {error && (
                      <CAlert color={error.student ? 'info' : 'danger'}>
                        {error.summary ?? error.message}
                        {error.student && (
                          <>
                            {' '}
                            <a href={`${SITE_URL}/espace/etudiant/`}>Aller sur le site</a>
                          </>
                        )}
                      </CAlert>
                    )}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilEnvelopeClosed} />
                      </CInputGroupText>
                      <CFormInput
                        type="email"
                        placeholder="Adresse e-mail"
                        aria-label="Adresse e-mail"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Mot de passe"
                        aria-label="Mot de passe"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton color="primary" className="px-4" type="submit" disabled={loading}>
                          {loading && <CSpinner size="sm" className="me-2" />}
                          Se connecter
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-primary py-5">
                <CCardBody className="text-center d-flex flex-column justify-content-center">
                  <img src="./edumada-logo-white.svg" alt="Edumada" height={56} className="mb-4" />
                  <h2>Vous êtes un établissement ?</h2>
                  <p>
                    Créez gratuitement votre compte sur le site Edumada, puis gérez ici votre fiche,
                    vos offres et les demandes des futurs étudiants.
                  </p>
                  <div>
                    <CButton
                      color="light"
                      variant="outline"
                      className="mt-2"
                      href={`${SITE_URL}/signup/?type=etablissement`}
                    >
                      Créer un compte établissement
                    </CButton>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
