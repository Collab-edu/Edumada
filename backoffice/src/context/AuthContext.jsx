import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'
import { api, getToken, setToken } from '../lib/api'

const AuthContext = createContext(null)

/** Seuls les établissements et les administrateurs utilisent le back-office. */
export const BACKOFFICE_ROLES = ['establishment', 'admin']

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const res = await api('/me')
      setUser(res.data)
    } catch {
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement de données au montage
    refresh()
    const onLogout = () => setUser(null)
    window.addEventListener('edumada:logout', onLogout)
    return () => window.removeEventListener('edumada:logout', onLogout)
  }, [refresh])

  const login = useCallback(async (email, password) => {
    const res = await api('/auth/login', {
      method: 'POST',
      body: { email, password, deviceName: 'back-office' },
    })
    if (!BACKOFFICE_ROLES.includes(res.user.role)) {
      // Un étudiant n'a rien à faire ici : on ne garde pas sa session.
      setToken(res.token)
      await api('/auth/logout', { method: 'POST' }).catch(() => undefined)
      setToken(null)
      const error = new Error(
        "Le back-office est réservé aux établissements et à l'équipe Edumada. Les étudiants utilisent le site.",
      )
      error.student = true
      throw error
    }
    setToken(res.token)
    setUser(res.user)
    return res.user
  }, [])

  const logout = useCallback(async () => {
    await api('/auth/logout', { method: 'POST' }).catch(() => undefined)
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, logout, refresh, setUser }),
    [user, loading, login, logout, refresh],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = { children: PropTypes.node }

export const useAuth = () => useContext(AuthContext)
