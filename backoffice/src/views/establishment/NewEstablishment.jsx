import React from 'react'
import { CAlert } from '@coreui/react'
import { useEstablishment } from '../../context/EstablishmentContext'
import { useAuth } from '../../context/AuthContext'
import EstablishmentForm from './EstablishmentForm'

/** Nouvelle fiche : créée « en attente de validation », publiée après contrôle par Edumada. */
const NewEstablishment = () => {
  const { select } = useEstablishment()
  const { refresh } = useAuth()

  return (
    <>
      <CAlert color="info">
        Votre établissement est peut-être déjà sur Edumada : retrouvez-le sur le site et cliquez sur
        « Vous représentez cet établissement ? » plutôt que de créer un doublon.
      </CAlert>
      <EstablishmentForm
        onSaved={async (saved) => {
          await refresh()
          await select(saved.id, '/fiche')
        }}
      />
    </>
  )
}

export default NewEstablishment
