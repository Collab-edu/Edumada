'use client'
import { useState } from 'react'
import AutoScroll from '@/components/ui/auto-scroll'
import SectionHeader from '@/components/ui/section-header'
import type { FormationType } from '../types'
import FormationCard from './FormationCard'

/** Carrousel de formations proches (même domaine, même ville…). */
export function SimilarFormations({ formations }: { formations: FormationType[] }) {
    const [favorites, setFavorites] = useState<string[]>([])
    if (formations.length === 0) return null
    const toggleFavorite = (id: string) =>
        setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))

    return (
        <div>
            <SectionHeader
                title='Formations similaires'
                description="Des formations proches, proposées par d'autres établissements."
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

export default SimilarFormations
