import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import { ButtonLink } from '@/components/ui/form'
import SectionHeader from '@/components/ui/section-header'
import DashboardPreview from './DashboardPreview'

const BENEFITS = [
    {
        icon: 'tabler:id-badge-2',
        title: 'Une fiche complète',
        image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=70',
        text: 'Présentation, photos des locaux, coordonnées, position sur la carte : tout ce qu’un futur étudiant veut savoir sur votre établissement.',
    },
    {
        icon: 'tabler:books',
        title: 'Vos formations en ligne',
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=70',
        text: 'Publiez vos offres avec la durée, les frais, le diplôme et les conditions d’admission. Elles apparaissent dans la recherche du site.',
    },
    {
        icon: 'tabler:inbox',
        title: 'Les demandes des étudiants',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=70',
        text: 'Recevez les demandes d’information et les candidatures, puis suivez-les avec des statuts, des filtres et un export CSV.',
    },
    {
        icon: 'tabler:chart-bar',
        title: 'Des statistiques claires',
        image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=70',
        text: 'Vues de votre fiche, clics vers vos coordonnées, demandes reçues : mesurez l’intérêt pour vos formations.',
    },
    {
        icon: 'tabler:speakerphone',
        title: 'Plus de visibilité',
        image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=70',
        text: 'Pendant vos recrutements, mettez vos formations en avant avec des campagnes sponsorisées, toujours signalées comme telles.',
    },
    {
        icon: 'tabler:rosette-discount-check',
        title: 'Un badge « vérifié »',
        image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=70',
        text: 'Après contrôle de votre identité et de vos autorisations, votre fiche affiche un badge de confiance. Il ne s’achète pas.',
    },
]

const STEPS_IMAGE = 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=70'

const STEPS = [
    { title: 'Créez votre compte', text: 'Un compte établissement gratuit, en quelques minutes.' },
    { title: 'Complétez votre fiche', text: 'Ajoutez vos informations et vos offres, ou revendiquez la fiche qui existe déjà.' },
    { title: 'Nous vérifions, vous êtes en ligne', text: 'L’équipe Edumada relit votre fiche avant sa publication.' },
]

const PLANS = [
    { name: 'Gratuit', text: 'Fiche complète et jusqu’à 3 offres publiées.' },
    { name: 'Pro', text: 'Offres illimitées, boîte de réception et statistiques.', highlight: true },
    { name: 'Premium', text: 'Campagnes sponsorisées et accompagnement prioritaire.' },
]

/** Page Avantages : ce qu'Edumada apporte aux établissements référencés. */
export default function BenefitsPage() {
    return (
        <>
            {/* En-tête */}
            <section className='pt-28 pb-10 sm:pt-32'>
                <div className='container mx-auto max-w-7xl px-4'>
                    <div className='grid gap-10 lg:grid-cols-2 lg:items-center'>
                        <div className='flex flex-col gap-4'>
                            <p className='font-semibold uppercase tracking-wide text-primary'>Établissements</p>
                            <h1 className='text-3xl md:text-5xl font-bold text-secondary'>Faites découvrir vos formations aux futurs étudiants</h1>
                            <p className='text-ink/70'>
                                Edumada est le lieu où les jeunes et leurs familles cherchent une formation à Madagascar. Référencez votre
                                établissement gratuitement et soyez là où ils vous cherchent.
                            </p>
                            <div className='flex flex-wrap gap-3'>
                                <ButtonLink href='/signup/?type=etablissement'>
                                    Référencer mon établissement
                                    <Icon icon='tabler:arrow-right' className='text-lg' />
                                </ButtonLink>
                                <ButtonLink href='/tarifs/' variant='secondary'>
                                    Voir les formules
                                </ButtonLink>
                            </div>
                        </div>

                        <div>
                            <DashboardPreview />
                            <p className='mt-4 text-center !text-xs text-ink/50'>Aperçu illustratif de l’espace établissement</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Avantages */}
            <section>
                <div className='container mx-auto max-w-7xl px-4'>
                    <SectionHeader title='Ce que vous gagnez' description='Les outils inclus pour présenter votre établissement et suivre l’intérêt des étudiants.' />
                    <ul className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
                        {BENEFITS.map((benefit) => (
                            <li
                                key={benefit.title}
                                className='group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[4px_4px_0_0_rgba(15,76,92,0.22)]'>
                                <div className='relative h-40 overflow-hidden'>
                                    <Image
                                        src={benefit.image}
                                        alt=''
                                        fill
                                        sizes='(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
                                        className='object-cover transition-transform duration-500 group-hover:scale-105'
                                    />
                                </div>
                                <div className='relative flex flex-col gap-3 px-6 pb-6'>
                                    <span className='-mt-6 flex h-12 w-12 items-center justify-center rounded-xl border-4 border-white bg-primary text-white'>
                                        <Icon icon={benefit.icon} className='text-2xl' />
                                    </span>
                                    <h3 className='text-lg font-semibold text-secondary'>{benefit.title}</h3>
                                    <p className='text-ink/70'>{benefit.text}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Étapes */}
            <section className='bg-secondary/[0.06]'>
                <div className='container mx-auto max-w-7xl px-4'>
                    <div className='grid gap-10 lg:grid-cols-2 lg:items-center'>
                        <div className='relative h-64 overflow-hidden rounded-2xl shadow-[6px_6px_0_0_rgba(15,76,92,0.22)] sm:h-80 lg:h-full lg:min-h-96'>
                            <Image src={STEPS_IMAGE} alt='Élèves dans une salle de classe' fill sizes='(min-width: 1024px) 50vw, 100vw' className='object-cover' />
                            <div className='absolute bottom-4 left-4 flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-lg'>
                                <Icon icon='tabler:clock' className='text-xl text-primary' />
                                <span className='!text-sm font-semibold text-secondary'>Inscription en quelques minutes</span>
                            </div>
                        </div>
                        <div>
                            <SectionHeader title='Comment ça marche ?' description='Trois étapes pour être visible sur Edumada.' />
                            <ol className='flex flex-col gap-4'>
                                {STEPS.map((step, index) => (
                                    <li key={step.title} className='flex gap-4 rounded-xl bg-white p-5'>
                                        <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary font-bold text-white'>{index + 1}</span>
                                        <div className='flex flex-col gap-1'>
                                            <h3 className='text-lg font-semibold text-secondary'>{step.title}</h3>
                                            <p className='text-ink/70'>{step.text}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </div>
            </section>

            {/* Formules */}
            <section className='pb-20'>
                <div className='container mx-auto max-w-7xl px-4'>
                    <SectionHeader
                        title='Commencez gratuitement'
                        description='Passez à une formule payante seulement quand vous en avez besoin.'
                        link={{ href: '/tarifs/', label: 'Comparer les formules' }}
                    />
                    <ul className='grid gap-5 md:grid-cols-3'>
                        {PLANS.map((plan) => (
                            <li key={plan.name}>
                                <Link
                                    href='/tarifs/'
                                    className={`group flex h-full flex-col gap-2 rounded-xl border bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 ${plan.highlight ? 'border-primary' : 'border-gray-200 hover:border-primary/40'}`}>
                                    <span className='text-xl font-bold text-secondary group-hover:text-primary duration-300'>{plan.name}</span>
                                    <p className='text-ink/70'>{plan.text}</p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <p className='mt-6 text-sm text-ink/60'>Paiement par MVola, Orange Money, Airtel Money, virement ou espèces. Aucun nombre de candidats n’est garanti.</p>
                </div>
            </section>
        </>
    )
}
