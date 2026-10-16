'use client'
import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import SectionHeader from '@/components/ui/section-header'
import { useSiteData } from '@/data/site-data'

/** Accueil : les 5 types d'établissements, chacun menant à la recherche filtrée. */
const CategoriesSection = () => {
    const { data: categories, loading } = useSiteData('CategoryData')
    const { data: schools } = useSiteData('SchoolData')

    return (
        <section id='categories-section'>
            <div className='container mx-auto max-w-7xl px-4'>
                <SectionHeader
                    title="Explorer par type d'établissement"
                    description='De la crèche à l’université, trouvez la structure adaptée à chaque âge et à chaque projet.'
                />
                <ul className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4'>
                    {loading
                        ? Array.from({ length: 5 }).map((_, i) => (
                            <li key={i} className='h-36 rounded-2xl border border-gray-100 bg-white animate-pulse' />
                        ))
                        : categories.map((category, i) => {
                            const count = schools.filter((s) => s.category === category.id).length
                            return (
                                // La dernière carte occupe toute la largeur sur mobile (5 cartes sur 2 colonnes).
                                <li key={category.id} className={i === categories.length - 1 ? 'col-span-2 sm:col-span-1' : ''}>
                                    <Link
                                        href={`/recherche?categorie=${encodeURIComponent(category.shortLabel)}`}
                                        className='group flex h-full flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg'>
                                        <span className='flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white'>
                                            <Icon icon={category.icon} className='text-2xl' />
                                        </span>
                                        <span className='font-semibold leading-snug text-secondary group-hover:text-primary'>
                                            {category.label}
                                        </span>
                                        <span className='mt-auto text-sm text-ink/60'>
                                            {count} établissement{count > 1 ? 's' : ''}
                                        </span>
                                    </Link>
                                </li>
                            )
                        })}
                </ul>
            </div>
        </section>
    )
}

export default CategoriesSection
