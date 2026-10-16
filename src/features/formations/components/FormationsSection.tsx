'use client'
import AutoScroll from '@/components/ui/auto-scroll'
import { CardSkeletonGrid } from '@/components/ui/card'
import SectionHeader from '@/components/ui/section-header'
import { useSiteData } from '@/data/site-data'
import { useAuth } from '@/features/auth/AuthProvider'
import FormationCard from './FormationCard'

// Le carrousel de l'accueil reste une sélection ; la liste complète est sur /recherche.
const MAX_HOME_FORMATIONS = 12

const FormationsSection = () => {
    const { data: formations, loading } = useSiteData('FormationData')
    const { isFavorite, toggleFavorite } = useAuth()

    return (
        <section id='courses-section'>
            <div id='Courses' className='container mx-auto max-w-7xl px-4'>
                <SectionHeader
                    title='Les formations à découvrir'
                    description='Parcourez une sélection de formations pour découvrir les cursus disponibles.'
                    link={{ href: '/recherche', label: 'Découvrir toutes les formations' }}
                />

                {loading ? (
                    <CardSkeletonGrid count={4} className='h-[360px]' />
                ) : (
                    <AutoScroll duration={140} itemClassName='w-[340px]'>
                        {formations.slice(0, MAX_HOME_FORMATIONS).map((formation) => (
                            <FormationCard
                                key={formation.id}
                                formation={formation}
                                isFavorite={isFavorite(formation.id)}
                                onToggleFavorite={() => toggleFavorite(formation.id)}
                                compact
                            />
                        ))}
                    </AutoScroll>
                )}
            </div>
        </section>
    )
}

export default FormationsSection
