import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CButton, CCard, CCardBody, CContainer, CSpinner } from '@coreui/react'

import { routes } from '../routes'
import { useAuth } from '../context/AuthContext'
import { useEstablishment } from '../context/EstablishmentContext'

/** Page qui porte sur un établissement alors qu'aucun n'est choisi. */
function NoEstablishment() {
  const { user } = useAuth()
  return (
    <CCard className="mb-4">
      <CCardBody className="text-center py-5">
        <h4>Aucun établissement sélectionné</h4>
        {user.role === 'admin' ? (
          <>
            <p className="text-body-secondary">
              Choisissez une fiche dans la liste des établissements, puis « Gérer ».
            </p>
            <CButton color="primary" href="#/admin/etablissements">
              Voir les établissements
            </CButton>
          </>
        ) : (
          <>
            <p className="text-body-secondary">
              Créez la fiche de votre établissement, ou revendiquez-la si elle existe déjà sur
              Edumada.
            </p>
            <CButton color="primary" href="#/nouvel-etablissement">
              Créer ma fiche
            </CButton>
          </>
        )}
      </CCardBody>
    </CCard>
  )
}

function Forbidden() {
  return (
    <CCard className="mb-4">
      <CCardBody className="text-center py-5">
        <h4>Accès réservé</h4>
        <p className="text-body-secondary mb-0">Cette page est réservée à l&apos;équipe Edumada.</p>
      </CCardBody>
    </CCard>
  )
}

const AppContent = () => {
  const { user } = useAuth()
  const { current, loading } = useEstablishment()

  const guard = (route) => {
    const roles = route.roles ?? ['establishment', 'admin']
    if (!roles.includes(user.role)) return <Forbidden />
    if (route.establishment && !current)
      return loading ? <CSpinner color="primary" /> : <NoEstablishment />
    return <route.element />
  }

  return (
    <CContainer className="px-4" lg>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={guard(route)} />
          ))}
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Suspense>
    </CContainer>
  )
}

export default AppContent
