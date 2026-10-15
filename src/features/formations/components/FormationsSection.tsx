'use client'
import { useState } from 'react'
import AutoScroll from '@/components/ui/auto-scroll'
import { CardSkeletonGrid } from '@/components/ui/card'
import SectionHeader from '@/components/ui/section-header'
import { useSiteData } from '@/data/site-data'
import FormationCard from './FormationCard'

const FormationsSection = () => {
    const { data: formations, loading } = useSiteData('FormationData')
    const [favorites, setFavorites] = useState<string[]>([])

    const toggleFavorite = (title: string) => {
        setFavorites((prev) =>
            prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
        )
    }

    return (
        <section id='courses-section'>
            <div id='Courses' className='container mx-auto max-w-7xl px-4'>
                <SectionHeader
                    title='Les formations à découvrir'
                    description='Parcourez une sélection de formations pour découvrir les cursus disponibles.'
                    link={{ href: '/#courses-section', label: 'Découvrir toutes les formations' }}
                />

                {loading ? (
                    <CardSkeletonGrid count={4} className='h-[420px]' />
                ) : (
                    <AutoScroll duration={35}>
                        {formations.map((formation) => (
                            <FormationCard
                                key={formation.title}
                                formation={formation}
                                isFavorite={favorites.includes(formation.title)}
                                onToggleFavorite={() => toggleFavorite(formation.title)}
                            />
                        ))}
                    </AutoScroll>
                )}
            </div>
        </section>
    )
}

export default FormationsSection
