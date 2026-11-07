'use client'
import Link, { useT } from '@/i18n/client'
import { Icon } from '@/components/ui/icon'
import { ButtonLink } from '@/components/ui/form'
import SectionHeader from '@/components/ui/section-header'
import DashboardPreview from './DashboardPreview'
import Image from 'next/image'
import withBasePath from '@/lib/base-path'

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
    {
        icon: 'tabler:star',
        title: 'Les avis de vos étudiants',
        text: 'Avec Pro, recueillez les témoignages de vos étudiants et de leurs familles : la meilleure preuve de la qualité de vos formations.',
    },
    {
        icon: 'tabler:users',
        title: 'Une gestion à plusieurs',
        text: 'Invitez vos collègues dans votre espace établissement pour tenir la fiche à jour et répondre aux demandes ensemble.',
    },
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
    const t = useT()
    return (
        <>
            {/* En-tête */}
            <section className='pt-28 pb-10 sm:pt-32'>
                <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                    <div className='grid gap-10 lg:grid-cols-2 lg:items-center'>
                        <div className='mobile-center flex flex-col gap-4'>
                            <p className='font-semibold uppercase tracking-wide text-primary'>{t('Établissements')}</p>
                            <h1 className='text-3xl md:text-5xl font-bold text-secondary'>{t('Faites découvrir vos formations aux futurs étudiants')}</h1>
                            <p className='text-black'>
                                {t('Edumada est le lieu où les jeunes et leurs familles cherchent une formation à Madagascar. Référencez votre établissement gratuitement et soyez là où ils vous cherchent.')}
                            </p>
                            <div className='mobile-center flex flex-wrap gap-3'>
                                <ButtonLink href='/tarifs/'>
                                    {t('Référencer mon établissement')}
                                    <Icon icon='tabler:arrow-right' className='text-lg' />
                                </ButtonLink>
                                <ButtonLink href='/tarifs/' variant='secondary'>
                                    {t('Voir les formules')}
                                </ButtonLink>
                            </div>
                        </div>

                        <div>
                            <DashboardPreview />
                            <p className='mt-4 text-center !text-xs text-ink/50'>{t('Aperçu illustratif de l’espace établissement')}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Avantages */}
            <section>
                <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                    <SectionHeader title='Ce que vous gagnez' description='Les outils inclus pour présenter votre établissement et suivre l’intérêt des étudiants.' />
                    <ul className='grid gap-5 sm:grid-cols-2 lg:grid-cols-4'>
                        {BENEFITS.map((benefit, i) => (
                            <li
                                key={benefit.title}
                                className='relative flex flex-col rounded-2xl border border-gray-100 bg-white p-7 shadow-[0_8px_24px_-18px_rgba(15,76,92,0.35)] transition-shadow duration-300 hover:shadow-[0_14px_30px_-16px_rgba(15,76,92,0.35)]'>
                                {/* Numéro discret en haut à droite : 01, 02… */}
                                <span className='absolute top-6 right-7 text-xs font-semibold text-ink/30'>{String(i + 1).padStart(2, '0')}</span>
                                <span className='flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                                    <Icon icon={benefit.icon} className='text-xl' />
                                </span>
                                <h3 className='mt-6 text-lg font-bold text-secondary'>{t(benefit.title)}</h3>
                                <p className='mt-2 !text-sm leading-relaxed text-ink/80'>{t(benefit.text)}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Étapes */}
            <section className='overflow-hidden bg-secondary/[0.06]'>
                <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                    <div className='grid gap-10 lg:grid-cols-2 lg:items-center'>
                        {/* Vrai téléphone (image, comme à l'accueil) sur une forme rose : le référencement d'un établissement. */}
                        <div className='relative mx-auto w-full max-w-[17rem] py-4'>
                            <div aria-hidden='true' className='absolute top-1/4 -left-12 h-[62%] w-[120%] rotate-[-14deg] rounded-[3.5rem] bg-primary/15' />
                            <Image
                                src={withBasePath('/images/avantages/referencer-etablissement.webp')}
                                alt='Référencement d’un établissement sur Edumada : informations générales, formations puis publication'
                                width={600}
                                height={967}
                                sizes='272px'
                                className='relative h-auto w-full'
                            />
                        </div>
                        <div>
                            <SectionHeader title='Comment ça marche ?' description='Trois étapes pour être visible sur Edumada.' />
                            <ol className='flex flex-col gap-3'>
                                {STEPS.map((step, index) => (
                                    <li key={step.title} className='flex items-center gap-4 rounded-xl bg-white px-5 py-4 shadow-[0_8px_24px_-18px_rgba(15,76,92,0.45)]'>
                                        <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-white'>{index + 1}</span>
                                        <div className='flex flex-col gap-0.5'>
                                            <h3 className='text-base font-bold text-secondary'>{t(step.title)}</h3>
                                            <p className='!text-sm text-ink/80'>{t(step.text)}</p>
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
                <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
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
                                    <span className='text-xl font-bold text-secondary group-hover:text-primary duration-300'>{t(plan.name)}</span>
                                    <p className='text-black'>{t(plan.text)}</p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <p className='mt-6 text-sm text-ink/60'>{t('Paiement par MVola, Orange Money, Airtel Money, virement ou espèces. Aucun nombre de candidats n’est garanti.')}</p>
                </div>
            </section>
        </>
    )
}
