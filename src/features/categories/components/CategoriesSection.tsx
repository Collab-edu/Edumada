'use client'
import Link, { useT } from '@/i18n/client'
import { Icon } from '@/components/ui/icon'
import SectionHeader from '@/components/ui/section-header'
import { exploreCardClassName } from '@/components/ui/card'
import { useSiteData } from '@/data/site-data'

/** Accueil : les 5 types d'établissements, chacun menant à la recherche filtrée. */
/** Ordre des cartes de cette section ; une catégorie ajoutée plus tard passe en fin de liste. */
const CARD_ORDER = ['superieur', 'formation-pro', 'scolaire', 'petite-enfance', 'autres']
const rank = (id: string) => {
    const index = CARD_ORDER.indexOf(id)
    return index === -1 ? CARD_ORDER.length : index
}

/** Titre et présentation de chaque type d'établissement (plan SEO de l'accueil). */
const CARD_TEXT: Record<string, { title: string; text: string }> = {
    superieur: { title: 'Universités et écoles supérieures', text: 'Découvrez les établissements proposant des formations universitaires, des licences, des masters et des parcours spécialisés.' },
    'formation-pro': { title: 'Centres de formation professionnelle', text: 'Trouvez des formations pratiques dans des domaines tels que l’informatique, la gestion, le commerce, la comptabilité, le tourisme et d’autres secteurs.' },
    scolaire: { title: 'Écoles, collèges et lycées', text: 'Recherchez un établissement scolaire adapté au parcours éducatif de votre enfant.' },
    'petite-enfance': { title: 'Crèches et structures préscolaires', text: 'Découvrez les établissements proposant des services d’accueil et d’éveil pour les jeunes enfants.' },
}

const CategoriesSection = () => {
    const t = useT()
    const { data, loading } = useSiteData('CategoryData')
    const categories = [...data].sort((a, b) => rank(a.id) - rank(b.id))
    const { data: schools } = useSiteData('SchoolData')

    return (
        <section id='categories-section'>
            <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                <SectionHeader
                    title='Découvrez les établissements d’enseignement à Madagascar'
                    description='Chaque parcours commence par le choix d’un établissement adapté à ses besoins. Sur Edumada, explorez différents types de structures éducatives :'
                />
                <ul className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4'>
                    {loading
                        ? Array.from({ length: 5 }).map((_, i) => (
                            <li key={i} className='h-32 rounded-xl border border-gray-200 bg-white animate-pulse' />
                        ))
                        : categories.map((category, i) => {
                            const count = schools.filter((s) => s.category === category.id).length
                            const card = CARD_TEXT[category.id]
                            return (
                                // La dernière carte occupe toute la largeur sur tablette (5 cartes sur 2 colonnes).
                                <li key={category.id} className={i === categories.length - 1 ? 'sm:col-span-2 lg:col-span-1' : ''}>
                                    <Link
                                        href={`/recherche?categorie=${encodeURIComponent(category.shortLabel)}`}
                                        className={exploreCardClassName}>
                                        {/* Même format que les cartes « domaines » : icône, titre, compteur. */}
                                        <Icon icon={category.icon} className='text-xl text-primary' />
                                        {/* Titre en haut, compteur en bas : les cartes restent alignées malgré des textes de longueurs différentes. */}
                                        <div className='flex flex-1 flex-col gap-1'>
                                            <h3 className='text-base font-semibold leading-snug text-black transition-colors duration-200 group-hover:text-primary'>
                                                {t(card?.title ?? category.label)}
                                            </h3>
                                            {card && <p className='!text-sm leading-snug text-black'>{t(card.text)}</p>}
                                            <span className='mt-auto text-sm text-ink/60'>
                                                {t(count > 1 ? `${count} établissements` : `${count} établissement`)}
                                            </span>
                                        </div>
                                    </Link>
                                </li>
                            )
                        })}
                </ul>
                {/* Liens vers les pages de catégorie (maillage interne). */}
                <div className='mobile-center mt-8 flex flex-wrap gap-x-8 gap-y-3'>
                    {[
                        { href: '/universites/', label: 'Découvrir les universités à Madagascar' },
                        { href: '/formation-professionnelle/', label: 'Trouver une formation professionnelle' },
                    ].map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className='font-semibold text-secondary underline underline-offset-4 decoration-secondary/40 hover:text-primary hover:decoration-primary'>
                            {t(link.label)}
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default CategoriesSection
