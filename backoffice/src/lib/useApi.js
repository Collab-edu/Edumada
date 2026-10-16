import { useCallback, useEffect, useState } from 'react'
import { api } from './api'

/**
 * Charge une ressource de l'API. `path` null : rien à charger.
 * Renvoie { data, error, loading, reload, setData }.
 */
export function useApi(path, query) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(path !== null)
  const queryKey = JSON.stringify(query ?? {})

  const load = useCallback(async () => {
    if (!path) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      setData(await api(path, { query: JSON.parse(queryKey) }))
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [path, queryKey])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement de données au montage
    load()
  }, [load])

  return { data, error, loading, reload: load, setData }
}
