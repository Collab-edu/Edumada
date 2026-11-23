'use client'
import Link, { useT } from '@/i18n/client'
import { Icon } from '@/components/ui/icon'
import { ButtonLink } from '@/components/ui/form'
import SectionHeader from '@/components/ui/section-header'
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

/** Sections « Pourquoi référencer votre établissement » (plan SEO de la page). */
const REASONS = [
    { icon: 'tabler:eye', title: 'Développez la visibilité de votre établissement', text: 'En créant votre fiche sur Edumada, vous disposez d’un espace pour présenter votre établissement, son emplacement, ses coordonnées et ses principales caractéristiques. Les étudiants peuvent ainsi découvrir votre structure lorsqu’ils recherchent une école, une université ou un centre de formation correspondant à leurs besoins.' },
    { icon: 'tabler:book', title: 'Présentez vos formations et vos programmes', text: 'Mettez en avant les formations que vous proposez, les filières disponibles, les niveaux d’admission et les informations essentielles sur vos programmes. Une présentation claire aide les futurs étudiants à mieux comprendre votre offre et à identifier les parcours qui correspondent à leurs objectifs.' },
    { icon: 'tabler:message-circle', title: 'Facilitez les demandes d’informations', text: 'Les personnes intéressées peuvent consulter votre fiche et vous contacter directement pour obtenir davantage de renseignements. Vous facilitez ainsi les premiers échanges avec de futurs étudiants et leurs familles.' },
    { icon: 'tabler:map-pin', title: 'Une présence adaptée aux établissements malgaches', text: 'Edumada accueille différents types de structures éducatives : universités, écoles supérieures, centres de formation professionnelle, écoles primaires, collèges, lycées et établissements préscolaires. Quelle que soit votre spécialité, vous pouvez présenter votre établissement à un public qui recherche des possibilités d’apprentissage et de formation à Madagascar.' },
]

const STEPS = [
    { title: 'Créez votre compte', text: 'Un compte établissement gratuit, en quelques minutes.' },
    { title: 'Complétez votre fiche', text: 'Ajoutez vos informations et vos offres, ou revendiquez la fiche qui existe déjà.' },
    { title: 'Nous vérifions, vous êtes en ligne', text: 'L’équipe Edumada relit votre fiche avant sa publication.' },
]

const PLANS = [
    { name: 'Gratuit', text: 'Fiche essentielle et une offre publiée.' },
    { name: 'Pro', text: '3 offres publiées, galerie photos, boîte de réception et statistiques.', highlight: true },
    { name: 'Premium', text: 'Offres illimitées, avis des étudiants, plusieurs utilisateurs, en tête des recherches, badge doré, promotion par Edumada et accompagnement prioritaire.' },
]

/** Page Avantages : ce qu'Edumada apporte aux établissements référencés. */
export default function BenefitsPage() {
    const t = useT()
    return (
        <>
            {/* En-tête */}
            <section className='overflow-hidden pt-28 pb-6 sm:pt-32 md:pb-8'>
                <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                    <div className='grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-10'>
                        <div className='mobile-center flex flex-col gap-6'>
                            <h1 className='text-3xl md:text-5xl font-bold text-secondary'>
                                {t('Référencez votre établissement et')} <span className='text-primary'>{t('gagnez en visibilité à Madagascar')}</span>
                            </h1>
                            <p className='max-w-xl text-lg text-ink'>
                                {t('Rejoignez EduMada et gagnez en visibilité auprès d’un large public d’étudiants à Madagascar. Présentez votre établissement, vos formations et facilitez la prise de contact.')}
                            </p>
                            <div className='mobile-center flex flex-wrap gap-3'>
                                <ButtonLink href='/tarifs/' className='min-h-12 px-6'>
                                    {t('Référencer mon établissement')}
                                    <Icon icon='tabler:arrow-right' className='text-lg' />
                                </ButtonLink>
                                <ButtonLink href='#avantages' variant='secondary' className='min-h-12 px-6'>
                                    {t('Voir les avantages')}
                                </ButtonLink>
                            </div>
                        </div>

                        {/* Aperçu de l'espace établissement : simple image, rien n'y est cliquable. */}
                        <Image
                            src={withBasePath('/images/avantages/espace-etablissement.webp')}
                            alt={t('Aperçu de l’espace établissement Edumada : liste des formations publiées, nouvelle demande et vues du mois')}
                            width={1088}
                            height={712}
                            sizes='(min-width: 1024px) 544px, 100vw'
                            draggable={false}
                            className='mx-auto h-auto w-full max-w-[34rem] select-none'
                        />
                    </div>
                </div>
            </section>

            {/* Avantages */}
            <section id='avantages' className='scroll-mt-24 pt-4 pb-14 md:pt-6 md:pb-20'>
                <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                    {/* Types d'établissements concernés */}
                    <div className='mb-14 flex flex-col gap-4 rounded-2xl md:mb-20 bg-secondary/[0.06] px-5 py-5 md:flex-row md:items-center md:justify-between md:px-8'>
                        <p className='!text-sm font-bold text-ink/60'>{t('Pour tous les établissements')}</p>
                        <ul className='flex flex-wrap gap-2 md:gap-3'>
                            {AUDIENCES.map((a) => (
                                <li key={a.label} className='inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black shadow-[0_4px_12px_-8px_rgba(15,23,42,0.22)]'>
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
                                className='relative flex flex-col overflow-hidden rounded-2xl bg-white p-6 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.17)]'>
                                {/* Grand numéro pâle en filigrane : 01, 02… */}
                                <span aria-hidden='true' className='absolute -top-1 right-4 font-heading text-6xl font-extrabold leading-none text-secondary/[0.06]'>
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <span className='relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[#e8203a] text-white shadow-[0_8px_16px_-6px_rgba(15,23,42,0.33)]'>
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

            {/* Pourquoi référencer son établissement (plan SEO de la page) */}
            <section className='pt-0 pb-14 md:pb-20'>
                <div className='container mx-auto flex max-w-site flex-col gap-6 px-4 sm:px-6 lg:px-8'>
                    <div className='grid gap-5 rounded-2xl bg-secondary p-6 text-white sm:p-8 lg:grid-cols-[1fr_1.5fr] lg:gap-16 lg:p-10'>
                        <div className='flex flex-col gap-4'>
                            <span aria-hidden='true' className='block h-1 w-10 rounded-full bg-primary' />
                            <h2 className='font-bold leading-tight text-white'>{t('Pourquoi référencer votre établissement sur Edumada\u00a0?')}</h2>
                        </div>
                        <div className='flex flex-col gap-4 text-white/85'>
                            <p>{t('Aujourd’hui, les étudiants et les parents utilisent de plus en plus Internet pour rechercher des écoles, des universités et des formations. Disposer d’une présence en ligne claire et accessible est devenu un véritable atout pour les établissements d’enseignement.')}</p>
                            <p>{t('Edumada est une plateforme dédiée à la découverte des établissements et des formations à Madagascar. Elle permet aux structures éducatives de présenter leurs activités et de faciliter la prise de contact avec les personnes intéressées.')}</p>
                        </div>
                    </div>
                    <div className='grid gap-6 md:grid-cols-2'>
                        {REASONS.map((reason) => (
                            <div key={reason.title} className='flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8'>
                                <span className='flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                                    <Icon icon={reason.icon} className='text-2xl' />
                                </span>
                                <h2 className='text-xl font-bold leading-snug text-secondary md:text-2xl'>{t(reason.title)}</h2>
                                <p className='text-black'>{t(reason.text)}</p>
                            </div>
                        ))}
                    </div>
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
                                alt={t('Référencement d’un établissement sur Edumada : informations générales, formations puis publication')}
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
                                    <li key={step.title} className='flex items-center gap-4 rounded-xl bg-white px-5 py-4 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.25)]'>
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
                {/* Largeur réduite : les trois formules restent compactes et centrées. */}
                <div className='container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8'>
                    <div className='mobile-center mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between'>
                        <div className='mobile-center flex flex-col gap-3'>
                            <h2 className='font-bold'>{t('Commencez gratuitement sur Edumada')}</h2>
                            <p className='text-ink'>{t('Vous pouvez créer votre compte établissement et publier une première fiche gratuitement. Complétez vos informations, ajoutez vos formations et développez progressivement votre présence sur la plateforme.')}</p>
                            <p className='text-ink'>{t('Rejoignez Edumada et permettez aux futurs étudiants de découvrir votre établissement.')}</p>
                        </div>
                        {/* Bouton rouge, comme « Référencer mon établissement » en haut de page. */}
                        <ButtonLink href='/tarifs/' className='min-h-12 shrink-0 self-center px-6 sm:self-auto'>
                            {t('Comparer les formules')}
                            <Icon icon='tabler:arrow-right' className='text-lg' />
                        </ButtonLink>
                    </div>
                    {/* Les trois formules dans une seule carte ; Pro mis en avant. */}
                    <ul className='grid overflow-hidden rounded-2xl bg-white shadow-[0_16px_40px_-24px_rgba(15,23,42,0.22)] md:grid-cols-3'>
                        {PLANS.map((plan, i) => (
                            <li key={plan.name} className={plan.highlight ? 'bg-primary/[0.06]' : ''}>
                                <Link href='/tarifs/' className='group flex h-full flex-col p-6 md:p-7'>
                                    <span className='flex items-center gap-3'>
                                        <span
                                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${plan.highlight ? 'bg-primary text-white' : 'border border-secondary/25 text-secondary'}`}>
                                            {i + 1}
                                        </span>
                                        {/* Niveau de la formule : 1, 2 ou 3 barres */}
                                        <span className='flex items-end gap-0.5' aria-hidden='true'>
                                            {[0, 1, 2].map((bar) => (
                                                <span key={bar} className={`w-1 rounded-sm ${bar <= i ? 'bg-primary' : 'bg-gray-200'}`} style={{ height: 6 + bar * 4 }} />
                                            ))}
                                        </span>
                                    </span>
                                    <span className={`mt-5 text-xl font-bold transition-colors ${plan.highlight ? 'text-primary' : 'text-secondary group-hover:text-primary'}`}>{t(plan.name)}</span>
                                    <p className='mt-2 !text-sm text-ink'>{t(plan.text)}</p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </>
    )
}
