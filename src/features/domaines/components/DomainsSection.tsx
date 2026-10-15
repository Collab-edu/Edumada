'use client'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import { CardSkeletonGrid, cardClassName } from '@/components/ui/card'
import SectionHeader from '@/components/ui/section-header'
import { cn } from '@/lib/utils'
import { useSiteData } from '@/data/site-data'

const DomainsSection = () => {
    const { data: domains, loading } = useSiteData('DomainData')

    return (
        <section id='domains-section'>
            <div className='container mx-auto max-w-7xl px-4'>
                <SectionHeader
                    title='Explorez les formations par domaine'
                    description="Découvrez les possibilités d'études selon vos centres d'intérêt et vos objectifs professionnels."
                    link={{ href: '/#courses-section', label: 'Voir tous les domaines' }}
                />
                {loading ? (
                    <CardSkeletonGrid count={8} className='h-28' />
                ) : (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                        {domains.map((domain) => (
                            <Link
                                key={domain.name}
                                href='/#courses-section'
                                className={cn(cardClassName, 'flex items-center gap-5 p-6')}>
                                <span className='flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary transition-colors duration-300 group-hover:bg-primary group-hover:text-white'>
                                    <Icon icon={domain.icon} className='text-2xl' />
                                </span>
                                <div className='flex flex-col gap-2'>
                                    <h3 className='text-base font-semibold leading-snug text-secondary group-hover:text-primary duration-300'>
                                        {domain.name}
                                    </h3>
                                    <p className='text-ink/60'>{domain.count} formations</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default DomainsSection
