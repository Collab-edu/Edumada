'use client'
import Link, { useT } from '@/i18n/client'
import { Icon } from '@/components/ui/icon'
import { ButtonLink } from '@/components/ui/form'
import SectionHeader from '@/components/ui/section-header'
import DashboardPreview from './DashboardPreview'
import Image from 'next/image'
import withBasePath from '@/lib/base-path'

/** Bandeau « Pour tous les établissements ». */
const AUDIENCES = [
    { icon: 'tabler:school', label: 'Universités' },
    { icon: 'tabler:briefcase', label: 'Formations pro' },
    { icon: 'tabler:mood-kid', label: 'Crèches' },
    { icon: 'tabler:building-community', label: 'Primaire & Collège' },
    { icon: 'tabler:heart-handshake', label: 'Autres établissements' },
]

const BENEFITS = [
    { icon: 'tabler:eye', title: 'Plus de visibilité', text: 'Présentez votre établissement sur une plateforme dédiée à l’éducation à Madagascar.' },
    { icon: 'tabler:book', title: 'Mettez en valeur vos formations', text: 'Publiez vos filières, programmes et spécialités avec des informations claires et attractives.' },
    { icon: 'tabler:users', title: 'Attirez de nouveaux étudiants', text: 'Permettez aux étudiants de découvrir vos offres et de vous contacter directement.' },
    { icon: 'tabler:device-desktop', title: 'Votre page établissement', text: 'Disposez d’une page personnalisée pour présenter votre histoire, vos infrastructures et vos coordonnées.' },
    { icon: 'tabler:message-circle', title: 'Échangez facilement', text: 'Recevez les demandes d’informations des étudiants intéressés et répondez simplement.' },
    { icon: 'tabler:world', title: 'Renforcez votre présence en ligne', text: 'Bénéficiez d’une présence supplémentaire sur Internet et améliorez la visibilité de votre établissement sur Google.' },
    { icon: 'tabler:trending-up', title: 'Suivez vos statistiques', text: 'Consultez le nombre de visites de votre page et mesurez l’intérêt pour vos formations.' },
    { icon: 'tabler:headset', title: 'Un accompagnement dédié', text: 'Notre équipe vous aide à créer et optimiser votre fiche pour gagner en visibilité.' },
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
            <section className='pt-28 pb-14 sm:pt-32 md:pb-20'>
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
            <section className='py-14 md:py-20'>
                <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                    {/* Types d'établissements concernés */}
                    <div className='mb-14 flex flex-col gap-4 rounded-2xl md:mb-20 bg-secondary/[0.06] px-5 py-5 md:flex-row md:items-center md:justify-between md:px-8'>
                        <p className='!text-xs font-bold uppercase tracking-[0.12em] text-ink/60'>{t('Pour tous les établissements')}</p>
                        <ul className='flex flex-wrap gap-2 md:gap-3'>
                            {AUDIENCES.map((a) => (
                                <li key={a.label} className='inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black shadow-[0_4px_12px_-8px_rgba(15,76,92,0.4)]'>
                                    <Icon icon={a.icon} className='text-base text-primary' />
                                    {t(a.label)}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <SectionHeader title='Ce que vous gagnez' description='Les outils inclus pour présenter votre établissement et suivre l’intérêt des étudiants.' />
                    <ul className='grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                        {BENEFITS.map((benefit, i) => (
                            <li
                                key={benefit.title}
                                className='relative flex flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-[0_10px_30px_-18px_rgba(15,76,92,0.3)] transition-transform duration-300 hover:-translate-y-1'>
                                {/* Grand numéro pâle en filigrane : 01, 02… */}
                                <span aria-hidden='true' className='absolute -top-1 right-4 font-heading text-6xl font-extrabold leading-none text-secondary/[0.06]'>
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <span className='relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[#e8203a] text-white shadow-[0_8px_16px_-6px_rgba(255,59,82,0.6)]'>
                                    <Icon icon={benefit.icon} className='text-2xl' />
                                </span>
                                <h3 className='relative mt-5 text-lg font-bold leading-snug text-secondary'>{t(benefit.title)}</h3>
                                <p className='relative mt-3 mb-6 !text-sm leading-relaxed text-ink/80'>{t(benefit.text)}</p>
                                <span aria-hidden='true' className='mt-auto block h-0.5 w-8 rounded-full bg-primary' />
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Étapes */}
            <section className='overflow-hidden bg-secondary/[0.06] py-16 md:py-24'>
                <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                    <div className='grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16'>
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
                            <ol className='flex flex-col gap-4'>
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
            <section className='pt-16 pb-24 md:pt-24 md:pb-28'>
                <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                    <SectionHeader
                        title='Commencez gratuitement'
                        description='Passez à une formule payante seulement quand vous en avez besoin.'
                        link={{ href: '/tarifs/', label: 'Comparer les formules' }}
                    />
                    <ul className='grid gap-6 md:grid-cols-3'>
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
                    <p className='mt-8 text-sm text-ink/60'>{t('Paiement par MVola, Orange Money, Airtel Money, virement ou espèces. Aucun nombre de candidats n’est garanti.')}</p>
                </div>
            </section>
        </>
    )
}
