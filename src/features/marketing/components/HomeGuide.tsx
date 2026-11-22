'use client'
import { useT } from '@/i18n/client'

/** Accueil, sous le hero : présentation de la recherche d'une formation à Madagascar. */
export function HomeIntro() {
    const t = useT()
    return (
        <section id='home-intro'>
            <div className='container mx-auto grid max-w-site gap-6 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:gap-16 lg:px-8'>
                <h2 className='mobile-center font-bold'>{t('Trouvez la bonne formation et le bon établissement à Madagascar')}</h2>
                <div className='flex flex-col gap-4 text-black'>
                    <p>
                        {t('Choisir une formation est une étape importante pour construire son avenir scolaire et professionnel. À Madagascar, les possibilités d’études sont nombreuses : universités publiques et privées, écoles supérieures, centres de formation professionnelle, lycées et établissements spécialisés.')}
                    </p>
                    <p>
                        {t('Mais trouver le parcours qui correspond réellement à ses ambitions, à son niveau d’études et à son budget n’est pas toujours facile. Edumada vous accompagne dans cette recherche en regroupant les établissements et les formations disponibles à Madagascar sur une seule plateforme.')}
                    </p>
                    <p>
                        {t('Que vous soyez un nouveau bachelier à la recherche d’une université, un étudiant souhaitant poursuivre ses études ou une personne désireuse d’acquérir de nouvelles compétences, vous pouvez explorer différentes possibilités et découvrir les établissements qui correspondent à votre projet.')}
                    </p>
                </div>
            </div>
        </section>
    )
}

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
            <div className='container mx-auto grid max-w-site gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8'>
                <div className='flex flex-col gap-4'>
                    <h2 className='mobile-center font-bold'>{t('Comment choisir une formation à Madagascar ?')}</h2>
                    <p className='text-black'>
                        {t('Le choix d’une formation ne doit pas reposer uniquement sur le nom ou la réputation d’une école. Plusieurs critères méritent votre attention :')}
                    </p>
                    <ul className='flex flex-col gap-2 text-black'>
                        {CRITERIA.map((item) => (
                            <li key={item} className='flex gap-3'>
                                <span aria-hidden='true' className='mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary' />
                                {t(item)}
                            </li>
                        ))}
                    </ul>
                    <p className='text-black'>
                        {t('Prenez le temps de comparer ces éléments et de contacter les établissements pour obtenir des informations complémentaires.')}
                    </p>
                </div>
                <div className='flex flex-col gap-4'>
                    <h2 className='mobile-center font-bold'>{t('Une plateforme pour faciliter votre orientation scolaire et professionnelle')}</h2>
                    <p className='text-black'>
                        {t('Edumada a pour objectif de simplifier la recherche d’établissements et de formations à Madagascar. Grâce à une recherche centralisée, vous pouvez explorer les possibilités d’études, consulter les informations des établissements, enregistrer vos formations favorites et envoyer vos demandes directement aux structures concernées.')}
                    </p>
                    <p className='text-black'>
                        {t('Que votre projet concerne les études supérieures, une formation professionnelle ou la scolarité de votre enfant, Edumada vous aide à avancer avec davantage de visibilité.')}
                    </p>
                    <p className='font-semibold text-secondary'>
                        {t('Edumada : explorez les formations, comparez les établissements et trouvez le parcours qui vous correspond.')}
                    </p>
                </div>
            </div>
        </section>
    )
}
