'use client'
import { useCallback, useEffect, useState } from 'react'
import { api, ApiError, type ApiOptions } from '@/lib/api'

/**
 * Charge une ressource de l'API pour un écran de l'espace connecté.
 * `path` null : rien à charger (paramètre manquant). `reload` recharge après une modification.
 */
export function useApi<T>(path: string | null, query?: ApiOptions['query']) {
    const [data, setData] = useState<T | null>(null)
    const [error, setError] = useState<ApiError | null>(null)
    const [loading, setLoading] = useState(path !== null)
    const queryKey = JSON.stringify(query ?? {})

    const load = useCallback(async () => {
        if (!path) {
            setLoading(false)
            return
        }
        setLoading(true)
        try {
            setData(await api<T>(path, { query: JSON.parse(queryKey) }))
            setError(null)
        } catch (err) {
            setError(err as ApiError)
        } finally {
            setLoading(false)
        }
    }, [path, queryKey])

    useEffect(() => {
        load()
    }, [load])

    return { data, error, loading, reload: load, setData }
}
