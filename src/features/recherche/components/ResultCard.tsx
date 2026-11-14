'use client'
import OfferCard, { type OfferCardProps } from '@/features/formations/components/OfferCard'

/** Carte d'un résultat de recherche : la fiche peut être ciblée par son ancre. */
export function ResultCard({ formation, isFavorite, onToggleFavorite }: Pick<OfferCardProps, 'formation' | 'isFavorite' | 'onToggleFavorite'>) {
    return <OfferCard id={formation.id} formation={formation} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />
}

export default ResultCard
