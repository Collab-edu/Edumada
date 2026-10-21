'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { api, apiEnabled, getToken, setToken } from '@/lib/api'
import type { User } from './types'
import { Icon } from '@/components/ui/icon'

type RegisterData = {
    name: string
    email: string
    password: string
    password_confirmation: string
    accountType: 'student' | 'establishment'
    phone?: string
    city?: string
    studyLevel?: string
    /** Responsable d'un établissement (page « Référencer mon établissement »). */
    firstName?: string
    lastName?: string
    jobTitle?: string
    establishment?: { name: string; category: string; city: string; email: string | null; website: string | null }
    /** Formule choisie sur la page Tarifs, enregistrée sur la fiche. */
    plan?: 'free' | 'pro' | 'premium'
    billingCycle?: 'monthly' | 'yearly'
}

type AuthContextValue = {
    user: User | null
    /** true tant que la session enregistrée n'a pas été vérifiée. */
    loading: boolean
    login: (email: string, password: string) => Promise<User>
    register: (data: RegisterData) => Promise<User>
    logout: () => Promise<void>
    refresh: () => Promise<void>
    setUser: (user: User) => void
    /** Identifiants des offres en favoris (comptes connectés). */
    favorites: string[]
    isFavorite: (offerId: string) => boolean
    toggleFavorite: (offerId: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [favorites, setFavorites] = useState<string[]>([])

    const loadFavorites = useCallback(async (current: User | null) => {
        if (!current || current.role !== 'student') return setFavorites([])
        try {
            const res = await api<{ data: { id: string }[] }>('/me/favorites')
            setFavorites(res.data.map((offer) => offer.id))
        } catch {
            setFavorites([])
        }
    }, [])

    const refresh = useCallback(async () => {
        if (!apiEnabled || !getToken()) {
            setUser(null)
            setLoading(false)
            return
        }
        try {
            const res = await api<{ data: User }>('/me')
            setUser(res.data)
            await loadFavorites(res.data)
        } catch {
            // Jeton expiré ou révoqué : on repart d'une session vide.
            setToken(null)
            setUser(null)
        } finally {
            setLoading(false)
        }
    }, [loadFavorites])

    useEffect(() => {
        refresh()
    }, [refresh])

    const login = useCallback(async (email: string, password: string) => {
        const res = await api<{ token: string; user: User }>('/auth/login', { method: 'POST', body: { email, password }, token: null })
        setToken(res.token)
        setUser(res.user)
        await loadFavorites(res.user)
        return res.user
    }, [loadFavorites])

    const register = useCallback(async (data: RegisterData) => {
        const res = await api<{ token: string; user: User }>('/auth/register', { method: 'POST', body: data, token: null })
        setToken(res.token)
        setUser(res.user)
        setFavorites([])
        return res.user
    }, [])

    const logout = useCallback(async () => {
        try {
            await api('/auth/logout', { method: 'POST' })
        } catch {
            // Déjà déconnecté côté serveur : on nettoie quand même le navigateur.
        }
        setToken(null)
        setUser(null)
        setFavorites([])
        router.push('/')
    }, [router])

    const toggleFavorite = useCallback(async (offerId: string) => {
        if (!user) {
            toast('Connectez-vous avec un compte étudiant pour enregistrer vos favoris.', { icon: <Icon icon='tabler:bulb' className='shrink-0 text-xl text-primary' /> })
            router.push(`/signin/?next=${encodeURIComponent(window.location.pathname + window.location.search)}`)
            return
        }
        if (user.role !== 'student') {
            toast.error('Les favoris sont réservés aux comptes étudiants.')
            return
        }
        const wasFavorite = favorites.includes(offerId)
        setFavorites((prev) => (wasFavorite ? prev.filter((id) => id !== offerId) : [...prev, offerId]))
        try {
            await api(`/me/favorites/${offerId}`, { method: wasFavorite ? 'DELETE' : 'PUT' })
            toast.success(wasFavorite ? 'Retiré de vos favoris' : 'Ajouté à vos favoris')
        } catch (error) {
            setFavorites((prev) => (wasFavorite ? [...prev, offerId] : prev.filter((id) => id !== offerId)))
            toast.error((error as Error).message)
        }
    }, [favorites, router, user])

    const value = useMemo<AuthContextValue>(
        () => ({
            user,
            loading,
            login,
            register,
            logout,
            refresh,
            setUser,
            favorites,
            isFavorite: (offerId: string) => favorites.includes(offerId),
            toggleFavorite,
        }),
        [user, loading, login, register, logout, refresh, favorites, toggleFavorite]
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth doit être utilisé dans <AuthProvider>.')
    return context
}
