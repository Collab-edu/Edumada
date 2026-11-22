'use client'
import { useT } from '@/i18n/client'

/** Carte blanche des textes de présentation (accueil). */
const PANEL = 'rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 lg:p-10'

const CRITERIA = [
    'Le niveau d’admission requis.',
    'Le diplôme ou la certification délivrée.',
    'La durée de la formation.',
    'Les frais de scolarité et les autres dépenses.',
    'La localisation de l’établissement.',
    'Les perspectives professionnelles après la formation.',
]

/** Accueil, avant le bandeau établissements : bien choisir sa formation, puis la plateforme. */
export function HomeGuide() {
    const t = useT()
    return (
        <section id='home-guide'>
            <div className='container mx-auto grid max-w-site gap-6 px-4 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:px-8'>
                <div className={`${PANEL} flex flex-col gap-5`}>
                    <h2 className='font-bold leading-tight'>{t('Comment choisir une formation à Madagascar ?')}</h2>
                    <p className='text-black'>
                        {t('Le choix d’une formation ne doit pas reposer uniquement sur le nom ou la réputation d’une école. Plusieurs critères méritent votre attention :')}
                    </p>
                    {/* Critères numérotés, séparés par un filet : une liste à lire, pas des cases à cocher. */}
                    <ol className='grid sm:grid-cols-2 sm:gap-x-8'>
                        {CRITERIA.map((item, i) => (
                            <li key={item} className='flex items-baseline gap-4 border-t border-secondary/10 py-3 text-black'>
                                <span aria-hidden='true' className='w-6 shrink-0 text-sm font-semibold tabular-nums text-primary'>
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <span>{t(item)}</span>
                            </li>
                        ))}
                    </ol>
                    <p className='text-black'>
                        {t('Prenez le temps de comparer ces éléments et de contacter les établissements pour obtenir des informations complémentaires.')}
                    </p>
                </div>
                <div className='flex flex-col gap-5 rounded-2xl bg-secondary p-6 text-white sm:p-8 lg:p-10'>
                    <h2 className='font-bold leading-tight text-white'>{t('Une plateforme pour faciliter votre orientation scolaire et professionnelle')}</h2>
                    <p className='text-white/85'>
                        {t('Edumada a pour objectif de simplifier la recherche d’établissements et de formations à Madagascar. Grâce à une recherche centralisée, vous pouvez explorer les possibilités d’études, consulter les informations des établissements, enregistrer vos formations favorites et envoyer vos demandes directement aux structures concernées.')}
                    </p>
                    <p className='text-white/85'>
                        {t('Que votre projet concerne les études supérieures, une formation professionnelle ou la scolarité de votre enfant, Edumada vous aide à avancer avec davantage de visibilité.')}
                    </p>
                    <p className='mt-auto border-t border-white/15 pt-5 font-medium text-white'>
                        {t('Edumada : explorez les formations, comparez les établissements et trouvez le parcours qui vous correspond.')}
                    </p>
                </div>
            </div>
        </section>
    )
}
