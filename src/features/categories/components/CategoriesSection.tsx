'use client'
import Link, { useT } from '@/i18n/client'
import { Icon } from '@/components/ui/icon'
import SectionHeader from '@/components/ui/section-header'
import { useSiteData } from '@/data/site-data'

/** Accueil : les 5 types d'établissements, chacun menant à la recherche filtrée. */
const CategoriesSection = () => {
    const t = useT()
    const { data: categories, loading } = useSiteData('CategoryData')
    const { data: schools } = useSiteData('SchoolData')

    return (
        <section id='categories-section'>
            <div className='container mx-auto max-w-7xl px-4'>
                <SectionHeader
                    title="Explorer par type d'établissement"
                    description='De la crèche à l’université, trouvez la structure adaptée à chaque âge et à chaque projet.'
                />
                <ul className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4'>
                    {loading
                        ? Array.from({ length: 5 }).map((_, i) => (
                            <li key={i} className='h-32 rounded-xl border border-gray-200 bg-white animate-pulse' />
                        ))
                        : categories.map((category, i) => {
                            const count = schools.filter((s) => s.category === category.id).length
                            return (
                                // La dernière carte occupe toute la largeur sur mobile (5 cartes sur 2 colonnes).
                                <li key={category.id} className={i === categories.length - 1 ? 'col-span-2 sm:col-span-1' : ''}>
                                    <Link
                                        href={`/recherche?categorie=${encodeURIComponent(category.shortLabel)}`}
                                        className='group flex h-full flex-col justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-[4px_4px_0_0_rgba(15,76,92,0.22)] transition-all duration-300 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-secondary/40 hover:shadow-[6px_6px_0_0_rgba(15,76,92,0.35)]'>
                                        {/* Même format que les cartes « domaines » : icône, titre, compteur. */}
                                        <Icon icon={category.icon} className='text-xl text-primary' />
                                        <div className='flex flex-col gap-1'>
                                            <h3 className='text-[15px] font-semibold leading-snug text-secondary group-hover:text-primary duration-300'>
                                                {t(category.label)}
                                            </h3>
                                            <span className='text-sm text-ink/60'>
                                                {t(count > 1 ? `${count} établissements` : `${count} établissement`)}
                                            </span>
                                        </div>
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
