'use client'
import { useEffect } from 'react'
import { useApi } from './useApi'
import type { EstablishmentCounts } from './types'

const EVENT = 'edumada:establishments-changed'

/** À appeler après une décision sur une fiche : le menu et les onglets se remettent à jour. */
export const notifyEstablishmentsChanged = () => window.dispatchEvent(new Event(EVENT))

/** Compteurs « nouveaux / inscrits » des fiches (administrateur), rechargés après chaque décision. */
export function useEstablishmentCounts(enabled: boolean, category?: string | null) {
    const result = useApi<EstablishmentCounts>(enabled ? '/admin/establishments/counts' : null, { category })
    const { reload } = result
    useEffect(() => {
        window.addEventListener(EVENT, reload)
        return () => window.removeEventListener(EVENT, reload)
    }, [reload])
    return result
}
