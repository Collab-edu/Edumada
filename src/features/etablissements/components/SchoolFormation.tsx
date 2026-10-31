'use client'
import { useAuth } from '@/features/auth/AuthProvider'
import OfferCard from '@/features/formations/components/OfferCard'
import type { FormationType } from '@/features/formations/types'

/** Offre proposée par l'établissement, sur sa fiche : même carte que sur le reste du site. */
export function SchoolFormation({ formation }: { formation: FormationType }) {
    const { isFavorite, toggleFavorite } = useAuth()
    return <OfferCard id={formation.id} formation={formation} isFavorite={isFavorite(formation.id)} onToggleFavorite={() => toggleFavorite(formation.id)} />
}

export default SchoolFormation
