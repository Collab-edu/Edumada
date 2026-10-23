'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, getToken, setToken } from '@/lib/api'
import type { User } from '@/lib/types'

/** Seuls les établissements et l'équipe Edumada utilisent le back-office. */
export const BACKOFFICE_ROLES = ['establishment', 'admin'] as const

/** Erreur de connexion d'un compte étudiant (son espace est sur le site). */
export class StudentAccountError extends Error {}

type AuthContextValue = {
    user: User | null
    loading: boolean
    login: (email: string, password: string) => Promise<User>
    /** Connexion avec le jeton « Se connecter avec Google ». */
    loginWithGoogle: (credential: string) => Promise<User>
    logout: () => Promise<void>
    refresh: () => Promise<void>
    setUser: (user: User) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    const refresh = useCallback(async () => {
        if (!getToken()) {
            setUser(null)
            setLoading(false)
            return
        }
        try {
            setUser((await api<{ data: User }>('/me')).data)
        } catch {
            setToken(null)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        refresh()
        const onLogout = () => setUser(null)
        window.addEventListener('edumada:logout', onLogout)
        return () => window.removeEventListener('edumada:logout', onLogout)
    }, [refresh])

    /** Session ouverte par l'API : refusée aux comptes étudiants. */
    const open = useCallback(async (res: { token: string; user: User }) => {
        if (!(BACKOFFICE_ROLES as readonly string[]).includes(res.user.role)) {
            // Un étudiant n'a rien à faire ici : on ne garde pas sa session.
            setToken(res.token)
            await api('/auth/logout', { method: 'POST' }).catch(() => undefined)
            setToken(null)
            throw new StudentAccountError("Le back-office est réservé aux établissements et à l'équipe Edumada. Les étudiants utilisent le site.")
        }
        setToken(res.token)
        setUser(res.user)
        return res.user
    }, [])

    const login = useCallback(
        async (email: string, password: string) =>
            open(await api<{ token: string; user: User }>('/auth/login', { method: 'POST', body: { email, password, deviceName: 'back-office' } })),
        [open]
    )

    const loginWithGoogle = useCallback(
        async (credential: string) => open(await api<{ token: string; user: User }>('/auth/google', { method: 'POST', body: { credential } })),
        [open]
    )

    const logout = useCallback(async () => {
        await api('/auth/logout', { method: 'POST' }).catch(() => undefined)
        setToken(null)
        setUser(null)
    }, [])

    const value = useMemo(() => ({ user, loading, login, loginWithGoogle, logout, refresh, setUser }), [user, loading, login, loginWithGoogle, logout, refresh])
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth doit être utilisé dans <AuthProvider>.')
    return context
}
