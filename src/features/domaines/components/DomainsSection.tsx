'use client'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import SectionHeader from '@/components/ui/section-header'
import { useSiteData } from '@/data/site-data'

// Carte bordée avec une ombre pleine décalée, qui se « soulève » au survol.
const domainCardClassName =
    'group flex flex-col justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-[4px_4px_0_0_rgba(255,59,82,0.22)] transition-all duration-300 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[6px_6px_0_0_rgba(255,59,82,0.35)]'

const DomainsSection = () => {
    const { data: domains, loading } = useSiteData('DomainData')

    return (
        <section id='domains-section'>
            <div className='container mx-auto max-w-7xl px-4'>
                <SectionHeader
                    title='Explorez les formations par domaine'
                    description="Découvrez les possibilités d'études selon vos centres d'intérêt et vos objectifs professionnels."
                />

                <div className='grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-4 lg:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.3fr)] gap-4'>
                    {loading
                        ? Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className='h-32 rounded-xl border border-gray-200 bg-white animate-pulse' />
                        ))
                        : domains.map((domain) => (
                            <Link
                                key={domain.name}
                                href={`/recherche?domaine=${encodeURIComponent(domain.searchDomain)}`}
                                className={domainCardClassName}>
                                <Icon icon={domain.icon} className='text-xl text-primary' />
                                <div className='flex flex-col gap-1'>
                                    <h3 className='text-[15px] font-semibold leading-snug text-secondary group-hover:text-primary duration-300'>
                                        {domain.name}
                                    </h3>
                                    <span className='text-sm text-ink/60'>{domain.count} formations</span>
                                </div>
                            </Link>
                        ))}

                    {/* Panneau « Explorateur », sur la hauteur des deux lignes de cartes */}
                    <div className='flex flex-col justify-between gap-6 rounded-xl bg-secondary/10 p-6 min-[420px]:col-span-2 md:col-span-4 lg:col-span-1 lg:col-start-5 lg:row-start-1 lg:row-span-2'>
                        <div className='flex flex-col gap-2'>
                            <h3 className='text-lg font-bold text-secondary'>Explorateur de formations</h3>
                            <p className='text-ink/80 leading-snug'>
                                Répondez à quelques questions et nous vous présenterons les formations qui vous
                                correspondent.
                            </p>
                        </div>
                        <Link
                            href='/recherche'
                            className='group inline-flex items-center justify-between gap-3 font-semibold text-primary'>
                            <span className='underline underline-offset-4 decoration-primary/40 group-hover:decoration-primary'>
                                Essayez notre outil d&apos;orientation
                            </span>
                            <Icon
                                icon='tabler:chevron-right'
                                className='shrink-0 text-xl transition-transform duration-300 group-hover:translate-x-1'
                            />
                        </Link>
                    </div>
                </div>

                <Link
                    href='/recherche'
                    className='mt-8 inline-block font-semibold text-secondary underline underline-offset-4 decoration-secondary/40 hover:text-primary hover:decoration-primary'>
                    Parcourez toutes les formations
                </Link>
            </div>
        </section>
    )
}

export default DomainsSection
