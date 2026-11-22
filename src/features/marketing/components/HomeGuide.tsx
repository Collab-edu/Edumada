'use client'
import { useT } from '@/i18n/client'
import { Icon } from '@/components/ui/icon'
import ReadMore from '@/components/ui/read-more'

/** Carte blanche des textes de présentation (accueil). */
const PANEL = 'rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 lg:p-10'
/** Trait rouge au-dessus des titres, repris des en-têtes du site. */
const Accent = () => <span aria-hidden='true' className='block h-1 w-10 rounded-full bg-primary' />

/** Accueil, sous le hero : présentation de la recherche d'une formation à Madagascar. */
export function HomeIntro() {
    const t = useT()
    return (
        <section id='home-intro'>
            <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                <div className={`${PANEL} grid gap-5 lg:grid-cols-[1fr_1.5fr] lg:gap-16`}>
                    <div className='flex flex-col gap-4'>
                        <Accent />
                        <h2 className='font-bold leading-tight'>{t('Trouvez la bonne formation et le bon établissement à Madagascar')}</h2>
                    </div>
                    <ReadMore>
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
                    </ReadMore>
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
            <div className='container mx-auto grid max-w-site gap-6 px-4 sm:px-6 lg:grid-cols-[1.3fr_1fr] lg:px-8'>
                <div className={`${PANEL} flex flex-col gap-5`}>
                    <Accent />
                    <h2 className='font-bold leading-tight'>{t('Comment choisir une formation à Madagascar ?')}</h2>
                    <p className='text-black'>
                        {t('Le choix d’une formation ne doit pas reposer uniquement sur le nom ou la réputation d’une école. Plusieurs critères méritent votre attention :')}
                    </p>
                    <ul className='grid gap-3 sm:grid-cols-2'>
                        {CRITERIA.map((item) => (
                            <li key={item} className='flex items-start gap-3 rounded-xl bg-offwhite px-4 py-3 text-black'>
                                <span className='mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
                                    <Icon icon='tabler:check' className='text-sm' />
                                </span>
                                <span className='!text-sm leading-snug sm:!text-base'>{t(item)}</span>
                            </li>
                        ))}
                    </ul>
                    <p className='text-black'>
                        {t('Prenez le temps de comparer ces éléments et de contacter les établissements pour obtenir des informations complémentaires.')}
                    </p>
                </div>
                <div className='flex flex-col gap-5 rounded-2xl bg-secondary p-6 text-white sm:p-8 lg:p-10'>
                    <Accent />
                    <h2 className='font-bold leading-tight text-white'>{t('Une plateforme pour faciliter votre orientation scolaire et professionnelle')}</h2>
                    <p className='text-white/85'>
                        {t('Edumada a pour objectif de simplifier la recherche d’établissements et de formations à Madagascar. Grâce à une recherche centralisée, vous pouvez explorer les possibilités d’études, consulter les informations des établissements, enregistrer vos formations favorites et envoyer vos demandes directement aux structures concernées.')}
                    </p>
                    <p className='text-white/85'>
                        {t('Que votre projet concerne les études supérieures, une formation professionnelle ou la scolarité de votre enfant, Edumada vous aide à avancer avec davantage de visibilité.')}
                    </p>
                    <p className='mt-auto border-t border-white/15 pt-5 font-semibold text-white'>
                        {t('Edumada : explorez les formations, comparez les établissements et trouvez le parcours qui vous correspond.')}
                    </p>
                </div>
            </div>
        </section>
    )
}
