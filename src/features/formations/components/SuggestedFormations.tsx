'use client'
import { useState } from 'react'
import AutoScroll from '@/components/ui/auto-scroll'
import SectionHeader from '@/components/ui/section-header'
import type { FormationType } from '../types'
import FormationCard from './FormationCard'

interface SuggestedFormationsProps {
    title: string
    description?: string
    formations: FormationType[]
}

/** Carrousel de formations suggérées, réutilisable sur n'importe quelle page. */
export function SuggestedFormations({ title, description, formations }: SuggestedFormationsProps) {
    const [favorites, setFavorites] = useState<string[]>([])
    if (formations.length === 0) return null

    const toggleFavorite = (id: string) =>
        setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))

    return (
        <div>
            <SectionHeader
                title={title}
                description={description}
                link={{ href: '/recherche', label: 'Voir toutes les formations' }}
            />
            <AutoScroll duration={35}>
                {formations.map((formation) => (
                    <FormationCard
                        key={formation.id}
                        formation={formation}
                        isFavorite={favorites.includes(formation.id)}
                        onToggleFavorite={() => toggleFavorite(formation.id)}
                    />
                ))}
            </AutoScroll>
        </div>
    )
}

export default SuggestedFormations
