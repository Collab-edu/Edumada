'use client'
import OfferCard, { type OfferCardProps } from './OfferCard'

/** Carte d'offre des grilles du site. */
export function FormationCard({ formation, isFavorite, onToggleFavorite, compact = false }: Pick<OfferCardProps, 'formation' | 'isFavorite' | 'onToggleFavorite' | 'compact'>) {
    return <OfferCard formation={formation} isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} compact={compact} />
}

export default FormationCard
