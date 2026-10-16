import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { useLocation, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from './AuthContext'

const EstablishmentContext = createContext(null)
const STORAGE_KEY = 'edumada_backoffice_establishment'

// Mémorisé par utilisateur : deux comptes sur le même navigateur ne partagent pas leur choix.
const storageKey = (user) => `${STORAGE_KEY}_${user.id}`

const remembered = (user) => {
  try {
    return localStorage.getItem(storageKey(user))
  } catch {
    return null
  }
}

/**
 * Établissement géré dans le back-office.
 * - Compte établissement : ses fiches (/me/establishments), la première par défaut.
 * - Administrateur : aucune par défaut ; « Gérer » depuis la liste des établissements en choisit une.
 * Un lien `?e=slug` (e-mails) sélectionne directement la fiche.
 */
export function EstablishmentProvider({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [establishments, setEstablishments] = useState([])
  const [current, setCurrent] = useState(null)
  const [loading, setLoading] = useState(true)
  const fromUrl = new URLSearchParams(location.search).get('e')

  const load = useCallback(
    async (slug) => {
      if (!user) return
      setLoading(true)
      try {
        const list = user.role === 'establishment' ? (await api('/me/establishments')).data : []
        setEstablishments(list)
        const target = slug ?? (list.length ? list[0].id : null)
        if (!target) {
          setCurrent(null)
          return
        }
        const res = await api(`/establishments/${target}/manage`)
        setCurrent(res.data)
        try {
          localStorage.setItem(storageKey(user), target)
        } catch {
          // sans importance
        }
      } catch {
        setCurrent(null)
      } finally {
        setLoading(false)
      }
    },
    [user],
  )

  useEffect(() => {
    if (!user) return
    const stored = remembered(user)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement de données au montage
    load(fromUrl ?? stored ?? undefined)
    // Le paramètre ?e= ne sert qu'à l'arrivée.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, fromUrl])

  const select = useCallback(
    async (slug, path = '/dashboard') => {
      await load(slug)
      navigate(path)
    },
    [load, navigate],
  )

  const leave = useCallback(() => {
    try {
      localStorage.removeItem(storageKey(user))
    } catch {
      // sans importance
    }
    setCurrent(null)
    navigate('/dashboard')
  }, [navigate, user])

  const value = useMemo(
    () => ({ establishments, current, loading, reload: () => load(current?.id), select, leave }),
    [establishments, current, loading, load, select, leave],
  )
  return <EstablishmentContext.Provider value={value}>{children}</EstablishmentContext.Provider>
}

EstablishmentProvider.propTypes = { children: PropTypes.node }

export const useEstablishment = () => useContext(EstablishmentContext)
