'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import type { ManagedEstablishment, User } from '@/lib/types'
import { useAuth } from './AuthContext'

type EstablishmentContextValue = {
    establishments: ManagedEstablishment[]
    current: ManagedEstablishment | null
    loading: boolean
    reload: () => Promise<void>
    select: (slug: string, path?: string) => Promise<void>
    leave: () => void
}

const EstablishmentContext = createContext<EstablishmentContextValue | null>(null)

// Mémorisé par utilisateur : deux comptes sur le même navigateur ne partagent pas leur choix.
const storageKey = (user: User) => `edumada_backoffice_establishment_${user.id}`
const remembered = (user: User) => {
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
 * Un lien `?e=fiche` (e-mails) sélectionne directement la fiche.
 */
export function EstablishmentProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const router = useRouter()
    const fromUrl = useSearchParams().get('e')
    const [establishments, setEstablishments] = useState<ManagedEstablishment[]>([])
    const [current, setCurrent] = useState<ManagedEstablishment | null>(null)
    const [loading, setLoading] = useState(true)

    const load = useCallback(
        async (slug?: string | null) => {
            if (!user) return
            setLoading(true)
            try {
                const list = user.role === 'establishment' ? (await api<{ data: ManagedEstablishment[] }>('/me/establishments')).data : []
                setEstablishments(list)
                const target = slug ?? list[0]?.id
                if (!target) {
                    setCurrent(null)
                    return
                }
                setCurrent((await api<{ data: ManagedEstablishment }>(`/establishments/${target}/manage`)).data)
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
        [user]
    )

    useEffect(() => {
        if (!user) return
        load(fromUrl ?? remembered(user))
        // Le paramètre ?e= ne sert qu'à l'arrivée sur une page.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, fromUrl])

    const select = useCallback(
        async (slug: string, path = '/dashboard/') => {
            await load(slug)
            router.push(path)
        },
        [load, router]
    )

    const leave = useCallback(() => {
        if (user) {
            try {
                localStorage.removeItem(storageKey(user))
            } catch {
                // sans importance
            }
        }
        setCurrent(null)
        router.push('/dashboard/')
    }, [router, user])

    const value = useMemo(
        () => ({ establishments, current, loading, reload: () => load(current?.id), select, leave }),
        [establishments, current, loading, load, select, leave]
    )
    return <EstablishmentContext.Provider value={value}>{children}</EstablishmentContext.Provider>
}

export function useEstablishment(): EstablishmentContextValue {
    const context = useContext(EstablishmentContext)
    if (!context) throw new Error('useEstablishment doit être utilisé dans <EstablishmentProvider>.')
    return context
}

/** Établissement géré, sur une page qui en exige un (garanti par AppContent). */
export function useCurrentEstablishment() {
    const context = useEstablishment()
    if (!context.current) throw new Error('Aucun établissement géré.')
    return { ...context, current: context.current }
}
