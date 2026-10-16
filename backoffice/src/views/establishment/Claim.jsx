import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { CAlert, CButton, CForm, CFormTextarea } from '@coreui/react'
import { api } from '../../lib/api'
import { useApi } from '../../lib/useApi'
import { ErrorAlert, Loading, PageCard } from '../../components/ui'

/** Revendiquer une fiche existante : Edumada vérifie le lien avec l'établissement. */
const Claim = () => {
  const { slug } = useParams()
  const { data, error: loadError } = useApi(`/establishments/${slug}`)
  const [message, setMessage] = useState('')
  const [error, setError] = useState(null)
  const [done, setDone] = useState('')

  if (loadError) return <ErrorAlert error={loadError} />
  if (!data) return <Loading />

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      setDone(
        (await api(`/establishments/${slug}/claims`, { method: 'POST', body: { message } }))
          .message,
      )
    } catch (err) {
      setError(err)
    }
  }

  return (
    <PageCard title={data.data.name} subtitle={`${data.data.subCategory} · ${data.data.city}`}>
      {done ? (
        <CAlert color="success">{done}</CAlert>
      ) : (
        <CForm onSubmit={submit}>
          <p>
            Pour protéger les établissements, Edumada vérifie que vous êtes autorisé à gérer cette
            fiche (appel au numéro officiel, e-mail du domaine, document…).
          </p>
          <ErrorAlert error={error} />
          <CFormTextarea
            label="Votre fonction et comment vous joindre"
            rows={5}
            placeholder="Ex. : Je suis la directrice des études, joignable au 034 00 000 00."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mb-3"
          />
          <CButton color="primary" type="submit">
            Demander la gestion de la fiche
          </CButton>
        </CForm>
      )}
    </PageCard>
  )
}

export default Claim
