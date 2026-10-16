import React, { Suspense, useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'

import { AuthProvider, useAuth } from './context/AuthContext'
import { EstablishmentProvider } from './context/EstablishmentContext'
import { ToastProvider } from './context/ToastContext'

const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))
const Login = React.lazy(() => import('./views/auth/Login'))

const Spinner = () => (
  <div className="pt-5 text-center">
    <CSpinner color="primary" variant="grow" />
  </div>
)

/** Les pages du back-office exigent une session établissement ou administrateur. */
function Protected() {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/connexion" replace />
  return (
    <EstablishmentProvider>
      <DefaultLayout />
    </EstablishmentProvider>
  )
}

function LoginRoute() {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  return user ? <Navigate to="/dashboard" replace /> : <Login />
}

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('edumada-backoffice-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    if (!isColorModeSet()) setColorMode(storedTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <HashRouter>
      <ToastProvider>
        <AuthProvider>
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path="/connexion" element={<LoginRoute />} />
              <Route path="*" element={<Protected />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </ToastProvider>
    </HashRouter>
  )
}

export default App
