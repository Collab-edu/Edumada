'use client'
import OfferCard, { type OfferCardProps } from '@/features/formations/components/OfferCard'

/** Carte d'un résultat de recherche : la fiche peut être ciblée par son ancre, sauf un emplacement sponsorisé (doublon). */
export function ResultCard({ formation, isFavorite, onToggleFavorite, sponsored = false }: Pick<OfferCardProps, 'formation' | 'isFavorite' | 'onToggleFavorite' | 'sponsored'>) {
    return <OfferCard id={sponsored ? undefined : formation.id} formation={formation} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} sponsored={sponsored} />
}

export default ResultCard
