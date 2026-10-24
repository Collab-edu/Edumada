import Link from '@/i18n/client'
import { Icon } from '@/components/ui/icon'
import { ButtonLink } from '@/components/ui/form'
import SectionHeader from '@/components/ui/section-header'
import DashboardPreview from './DashboardPreview'
import PhoneMockup, { type PhoneTab } from './PhoneMockup'

const BENEFITS = [
    {
        icon: 'tabler:id-badge-2',
        title: 'Une fiche complète',
        text: 'Présentation, coordonnées, position sur la carte, et avec Pro une galerie photos : tout ce qu’un futur étudiant veut savoir sur votre établissement.',
    },
    {
        icon: 'tabler:books',
        title: 'Vos formations en ligne',
        text: 'Publiez vos offres avec la durée, les frais, le diplôme et les conditions d’admission. Elles apparaissent dans la recherche du site.',
    },
    {
        icon: 'tabler:inbox',
        title: 'Les demandes des étudiants',
        text: 'Recevez les demandes d’information et les candidatures, puis suivez-les avec des statuts, des filtres et un export CSV.',
    },
    {
        icon: 'tabler:chart-bar',
        title: 'Des statistiques claires',
        text: 'Vues de votre fiche, clics vers vos coordonnées, demandes reçues : mesurez l’intérêt pour vos formations.',
    },
    {
        icon: 'tabler:speakerphone',
        title: 'Plus de visibilité',
        text: 'Pendant vos recrutements, mettez vos formations en avant avec des campagnes sponsorisées, toujours signalées comme telles.',
    },
    {
        icon: 'tabler:rosette-discount-check',
        title: 'Un badge « vérifié »',
        text: 'Après contrôle de votre identité et de vos autorisations, votre fiche affiche un badge de confiance. Il ne s’achète pas.',
    },
]

/** Liste de contrôle de la fiche, avec les mêmes libellés que l'espace établissement. */
const CHECKLIST = [
    { label: 'Photo de couverture', done: true },
    { label: 'Présentation de quelques phrases', done: true },
    { label: 'Téléphone et e-mail', done: true },
    { label: 'Au moins 2 photos des locaux', done: true },
    { label: 'Position sur la carte', done: true },
    { label: 'Au moins une offre publiée', done: false },
]

const PHONE_TABS: PhoneTab[] = [
    { icon: 'tabler:layout-dashboard', label: 'Accueil' },
    { icon: 'tabler:id-badge-2', label: 'Fiche', active: true },
    { icon: 'tabler:books', label: 'Offres' },
    { icon: 'tabler:inbox', label: 'Demandes' },
]

const STEPS = [
    { title: 'Créez votre compte', text: 'Un compte établissement gratuit, en quelques minutes.' },
    { title: 'Complétez votre fiche', text: 'Ajoutez vos informations et vos offres, ou revendiquez la fiche qui existe déjà.' },
    { title: 'Nous vérifions, vous êtes en ligne', text: 'L’équipe Edumada relit votre fiche avant sa publication.' },
]

const PLANS = [
    { name: 'Gratuit', text: 'Fiche essentielle et une offre publiée.' },
    { name: 'Pro', text: 'Offres illimitées, galerie photos, avis, boîte de réception et statistiques.', highlight: true },
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
                            <p className='text-black'>
                                Edumada est le lieu où les jeunes et leurs familles cherchent une formation à Madagascar. Référencez votre
                                établissement gratuitement et soyez là où ils vous cherchent.
                            </p>
                            <div className='flex flex-wrap gap-3'>
                                <ButtonLink href='/tarifs/'>
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
                                className='flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-6 shadow-[4px_4px_0_0_rgba(15,76,92,0.22)]'>
                                <span className='flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                                    <Icon icon={benefit.icon} className='text-2xl' />
                                </span>
                                <h3 className='text-lg font-semibold text-secondary'>{benefit.title}</h3>
                                <p className='text-black'>{benefit.text}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Étapes */}
            <section className='bg-secondary/[0.06]'>
                <div className='container mx-auto max-w-7xl px-4'>
                    <div className='grid gap-10 lg:grid-cols-2 lg:items-center'>
                        <PhoneMockup tabs={PHONE_TABS}>
                            <div>
                                <p className='font-bold text-secondary'>Bienvenue <Icon icon='material-symbols:waving-hand-outline' aria-hidden='true' className='inline-block align-[-0.125em] text-amber-400' /></p>
                                <p className='!text-xs text-ink/60'>Votre fiche est presque prête.</p>
                            </div>
                            <div className='flex flex-col gap-2 rounded-lg bg-white p-3'>
                                <div className='flex items-center justify-between text-xs'>
                                    <span className='font-semibold text-secondary'>Fiche complétée</span>
                                    <span className='font-bold text-primary'>83 %</span>
                                </div>
                                <div className='h-2 overflow-hidden rounded-full bg-secondary/10'>
                                    <div className='h-full w-[83%] rounded-full bg-primary' />
                                </div>
                            </div>
                            <ul className='flex flex-col gap-1.5'>
                                {CHECKLIST.map((item) => (
                                    <li key={item.label} className='flex items-center gap-2 rounded-lg bg-white px-2 py-1.5 text-[11px] text-secondary'>
                                        <span
                                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${item.done ? 'bg-success/50 text-secondary' : 'border border-dashed border-primary text-primary'}`}>
                                            <Icon icon={item.done ? 'tabler:check' : 'tabler:plus'} className='text-xs' />
                                        </span>
                                        <span className={item.done ? '' : 'font-semibold'}>{item.label}</span>
                                    </li>
                                ))}
                            </ul>
                            <div className='flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-[11px] font-semibold text-white'>
                                <Icon icon='tabler:send' className='text-sm' />
                                Envoyer pour vérification
                            </div>
                        </PhoneMockup>
                        <div>
                            <SectionHeader title='Comment ça marche ?' description='Trois étapes pour être visible sur Edumada.' />
                            <ol className='flex flex-col gap-4'>
                                {STEPS.map((step, index) => (
                                    <li key={step.title} className='flex gap-4 rounded-xl bg-white p-5'>
                                        <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary font-bold text-white'>{index + 1}</span>
                                        <div className='flex flex-col gap-1'>
                                            <h3 className='text-lg font-semibold text-secondary'>{step.title}</h3>
                                            <p className='text-black'>{step.text}</p>
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
                                    <p className='text-black'>{plan.text}</p>
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
