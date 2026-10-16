'use client'
import AutoScroll from '@/components/ui/auto-scroll'
import { CardSkeletonGrid } from '@/components/ui/card'
import SectionHeader from '@/components/ui/section-header'
import { useSiteData } from '@/data/site-data'
import SchoolCard from './SchoolCard'

const SchoolsSection = () => {
    const { data: schools, loading } = useSiteData('SchoolData')

    return (
        <section id='schools-section' className='bg-secondary/[0.06] py-14 mt-10'>
            <div className='container mx-auto max-w-7xl px-4'>
                <SectionHeader
                    title='Découvrez les établissements'
                    description="Consultez les établissements et découvrez les formations qu'ils proposent."
                    link={{ href: '/#schools-section', label: 'Voir tous les établissements' }}
                />

                {loading ? (
                    <CardSkeletonGrid count={4} className='h-[360px]' />
                ) : (
                    <AutoScroll duration={160} itemClassName='w-[340px]'>
                        {schools.map((school) => (
                            <SchoolCard key={school.id} school={school} compact />
                        ))}
                    </AutoScroll>
                )}
            </div>
        </section>
    )
}

export default SchoolsSection
