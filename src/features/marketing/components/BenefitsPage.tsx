import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import { ButtonLink } from '@/components/ui/form'
import SectionHeader from '@/components/ui/section-header'

const BENEFITS = [
    {
        icon: 'tabler:id-badge-2',
        title: 'Une fiche complète',
        text: 'Présentation, photos des locaux, coordonnées, position sur la carte : tout ce qu’un futur étudiant veut savoir sur votre établissement.',
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

const PREVIEW_TILES = [
    { icon: 'tabler:eye', label: 'Vues de la fiche', value: '1 240' },
    { icon: 'tabler:phone', label: 'Clics de contact', value: '86' },
    { icon: 'tabler:inbox', label: 'Demandes', value: '23' },
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

                        {/* Aperçu du tableau de bord */}
                        <div className='relative' aria-hidden='true'>
                            <div className='absolute -inset-4 -z-10 rounded-3xl bg-cream' />
                            <div className='flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-[6px_6px_0_0_rgba(15,76,92,0.22)]'>
                                <div className='flex items-center justify-between'>
                                    <p className='font-semibold text-secondary'>Tableau de bord</p>
                                    <span className='rounded-full bg-success/40 px-3 py-1 text-xs font-semibold text-secondary'>30 derniers jours</span>
                                </div>
                                <div className='grid grid-cols-3 gap-3'>
                                    {PREVIEW_TILES.map((tile) => (
                                        <div key={tile.label} className='flex flex-col gap-1 rounded-xl bg-offwhite p-3'>
                                            <Icon icon={tile.icon} className='text-lg text-primary' />
                                            <span className='text-xl font-bold text-secondary'>{tile.value}</span>
                                            <span className='text-xs text-ink/60'>{tile.label}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className='flex h-24 items-end gap-2 rounded-xl bg-offwhite px-3 pb-3 pt-4'>
                                    {[40, 55, 35, 70, 60, 85, 75, 95, 65, 80, 90, 100].map((height, i) => (
                                        <span key={i} className={`flex-1 rounded-t ${i === 11 ? 'bg-primary' : 'bg-secondary/25'}`} style={{ height: `${height}%` }} />
                                    ))}
                                </div>
                                <div className='flex items-center gap-3 rounded-xl border border-gray-200 p-3'>
                                    <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary'>
                                        <Icon icon='tabler:message-circle' />
                                    </span>
                                    <div className='min-w-0'>
                                        <p className='truncate !text-sm font-semibold text-secondary'>Nouvelle demande d’information</p>
                                        <p className='truncate !text-xs text-ink/60'>Licence en informatique · il y a 5 min</p>
                                    </div>
                                </div>
                            </div>
                            <p className='mt-6 text-center !text-xs text-ink/50'>Aperçu illustratif de l’espace établissement</p>
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
                                <p className='text-ink/70'>{benefit.text}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Étapes */}
            <section className='bg-secondary/[0.06]'>
                <div className='container mx-auto max-w-7xl px-4'>
                    <SectionHeader title='Comment ça marche ?' description='Trois étapes pour être visible sur Edumada.' />
                    <ol className='grid gap-5 md:grid-cols-3'>
                        {STEPS.map((step, index) => (
                            <li key={step.title} className='flex gap-4 rounded-xl bg-white p-6'>
                                <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary font-bold text-white'>{index + 1}</span>
                                <div className='flex flex-col gap-1'>
                                    <h3 className='text-lg font-semibold text-secondary'>{step.title}</h3>
                                    <p className='text-ink/70'>{step.text}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
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
