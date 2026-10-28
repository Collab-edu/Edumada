'use client'
import { useState } from 'react'
import Link, { useT } from '@/i18n/client'
import { Icon } from '@/components/ui/icon'
import { ButtonLink } from '@/components/ui/form'
import { cn } from '@/lib/utils'
import type { Plan } from '@/features/espace/types'
import { formatAriary } from '@/features/espace/components/SpaceShell'
import { useAuth } from '@/features/auth/AuthProvider'
import { backofficeUrl } from '@/features/auth/types'
import SchoolFaq from '@/features/etablissements/components/SchoolFaq'
import SectionHeader from '@/components/ui/section-header'
import Companies from './Companies'
import { signupUrl, usePlans } from '../plans'
import { Eyebrow } from '@/components/ui/eyebrow'

/** Accroche et contenu de chaque formule, d'après le document « Les 4 types de comptes ». */
const PLAN_DETAILS: Record<Plan['code'], { description: string; intro: string; features: (plan: Plan) => string[] }> = {
    free: {
        description: 'Pour être présent sur Edumada et publier vos premières offres.',
        intro: 'Ce qui est inclus :',
        features: (plan) => [
            'Fiche établissement essentielle',
            plan.maxPublishedOffers === null
                ? 'Offres illimitées'
                : `${plan.maxPublishedOffers} ${plan.maxPublishedOffers > 1 ? 'offres publiées' : 'offre publiée'}`,
            'Coordonnées : adresse, téléphone et e-mail',
            'Jusqu’à 2 infrastructures',
            'Présence dans les résultats standards',
            'Demandes reçues par e-mail',
        ],
    },
    pro: {
        description: 'Pour gérer vos demandes et suivre vos résultats toute l’année.',
        intro: 'Tout Gratuit, plus :',
        features: () => [
            'Offres illimitées',
            'Galerie photos des locaux',
            'Site web et réseaux sociaux sur la fiche',
            'Infrastructures illimitées',
            'Avis des étudiants',
            'Boîte de réception des demandes et candidatures',
            'Statuts, filtres et export CSV',
            'Statistiques standard',
        ],
    },
    premium: {
        description: 'Pour mettre vos formations en avant pendant vos recrutements.',
        intro: 'Tout Pro, plus :',
        features: () => ['Campagnes sponsorisées, clairement signalées', 'Statistiques avancées par campagne', 'Accompagnement prioritaire'],
    },
}

const FAQ = [
    {
        question: 'Les étudiants paient-ils quelque chose ?',
        answer: 'Non. Rechercher, comparer, contacter un établissement et suivre une candidature est toujours gratuit pour les étudiants et les familles.',
    },
    {
        question: 'Que se passe-t-il à la fin de mon abonnement ?',
        answer: 'Vous recevez un rappel 30, 7 et 1 jour avant. Après une courte période de grâce, les fonctions payantes s’arrêtent mais votre fiche reste en ligne avec la formule Gratuit.',
    },
    {
        question: 'Le badge « établissement vérifié » est-il inclus dans une formule ?',
        answer: 'Non : il est attribué après un contrôle réel de votre identité et de vos autorisations, quelle que soit votre formule. Il ne s’achète pas.',
    },
    {
        question: 'Comment payer ?',
        answer: 'Par MVola, Orange Money, Airtel Money, virement ou en espèces. Vous indiquez la référence du paiement dans votre espace ; Edumada confirme et active la formule.',
    },
    {
        question: 'Je ne recrute que quelques mois par an.',
        answer: 'Une campagne Premium d’un mois autour de la rentrée peut suffire : pas besoin d’un abonnement toute l’année.',
    },
]

export default function PricingPage() {
    const t = useT()
    const { user } = useAuth()
    const plans = usePlans()
    const [yearly, setYearly] = useState(false)

    // Le rythme réellement proposé : Premium n'existe qu'au mois.
    const cycleOf = (plan: Plan) => (yearly && plan.yearlyPrice !== null ? 'yearly' : 'monthly')
    // Un établissement déjà inscrit change de formule dans son espace ; les autres s'inscrivent avec la formule choisie.
    const cta = (plan: Plan) =>
        user?.role === 'establishment'
            ? backofficeUrl(plan.code === 'free' ? '/formule/' : `/formule/?plan=${plan.code}&cycle=${cycleOf(plan)}`)
            : signupUrl(plan.code, cycleOf(plan))
    const yearlySaving = 10

    return (
        <>
            {/* Formules */}
            <section className='pt-28 sm:pt-32'>
                <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8 flex flex-col gap-10'>
                    <div className='mx-auto flex max-w-3xl flex-col items-center gap-4 text-center'>
                        <p className='font-semibold uppercase tracking-wide text-primary'>{t('Établissements')}</p>
                        <h1 className='text-3xl md:text-5xl font-bold text-secondary'>
                            {t('Des formules adaptées à')} <span className='text-primary'>{t('votre établissement')}</span>
                        </h1>
                        <p className='text-black'>
                            {t('Commencez gratuitement. Passez à Pro pour gérer vos demandes et candidatures, à Premium pour mettre vos formations en avant pendant vos recrutements.')}
                        </p>

                        <div className='mt-2 inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white p-1 shadow-[3px_3px_0_0_rgba(15,76,92,0.18)]' role='group' aria-label={t('Période de paiement')}>
                            {[false, true].map((value) => (
                                <button
                                    key={String(value)}
                                    type='button'
                                    aria-pressed={yearly === value}
                                    onClick={() => setYearly(value)}
                                    className={cn(
                                        'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 hover:cursor-pointer',
                                        yearly === value ? 'bg-secondary text-white' : 'text-secondary hover:text-primary'
                                    )}>
                                    {value ? t('Annuel') : t('Mensuel')}
                                    {value && yearlySaving ? (
                                        <span className={cn('rounded-full px-2 py-0.5 text-xs', yearly ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary')}>
                                            −{yearlySaving} %
                                        </span>
                                    ) : null}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className='grid gap-5 md:grid-cols-3 md:items-stretch'>
                        {plans.map((plan) => {
                            const details = PLAN_DETAILS[plan.code]
                            const highlighted = plan.code === 'pro'
                            const showYearly = yearly && plan.yearlyPrice !== null && plan.code !== 'free'
                            return (
                                <div
                                    key={plan.code}
                                    className={cn(
                                        'relative flex flex-col overflow-hidden rounded-xl border bg-white',
                                        highlighted ? 'border-primary shadow-[4px_4px_0_0_rgba(255,59,82,0.3)] md:-my-3' : 'border-gray-200 shadow-[4px_4px_0_0_rgba(15,76,92,0.22)]'
                                    )}>
                                    <div className={cn('flex flex-col gap-4 p-6', highlighted && 'bg-cream/60')}>
                                        <div className='flex items-center justify-between gap-2'>
                                            <p className='text-xl font-bold text-secondary'>{t(plan.name)}</p>
                                            {highlighted && <Eyebrow>{t('Recommandée')}</Eyebrow>}
                                        </div>
                                        <p className='min-h-12 text-sm text-black'>{t(details.description)}</p>
                                        <div className='min-h-16'>
                                            {plan.code === 'free' ? (
                                                <p className='text-4xl font-bold text-secondary'>0 Ar</p>
                                            ) : (
                                                <>
                                                    <p className='text-4xl font-bold text-secondary'>
                                                        {formatAriary(showYearly ? plan.yearlyPrice : plan.monthlyPrice)}
                                                        <span className='text-base font-normal text-ink/60'> / {showYearly ? t('an') : t('mois')}</span>
                                                    </p>
                                                    {yearly && plan.yearlyPrice === null && <p className='text-sm text-ink/60'>{t('Au mois uniquement, selon vos besoins')}</p>}
                                                </>
                                            )}
                                        </div>
                                        <ButtonLink href={cta(plan)} variant={highlighted ? 'primary' : 'dark'} className='w-full justify-center'>
                                            {plan.code === 'free' ? t('Référencer mon établissement') : t('Choisir {plan}', { plan: t(plan.name) })}
                                        </ButtonLink>
                                    </div>
                                    <div className='flex flex-1 flex-col gap-3 border-t border-gray-100 p-6'>
                                        <p className='text-sm font-semibold text-secondary'>{t(details.intro)}</p>
                                        <ul className='flex flex-col gap-2.5'>
                                            {details.features(plan).map((feature) => (
                                                <li key={feature} className='flex items-start gap-2 text-sm text-ink/80'>
                                                    <Icon icon='tabler:circle-check-filled' className='mt-0.5 shrink-0 text-lg text-primary' />
                                                    {t(feature)}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <p className='text-center text-sm text-ink/60'>{t('Prix de lancement indicatifs, susceptibles d’évoluer. Aucun nombre de candidats n’est garanti.')}</p>
                </div>
            </section>

            <Companies />

            {/* Questions fréquentes */}
            <section className='pb-20'>
                <div className='container mx-auto max-w-3xl px-4'>
                    <SectionHeader title='Questions fréquentes' description='Tout savoir sur les formules et le paiement.' className='text-center sm:justify-center' />
                    <SchoolFaq items={FAQ} />
                    <p className='mt-6 text-black'>
                        {t('Vous ne trouvez pas votre réponse ?')}{' '}
                        <Link href='/contact/' className='font-semibold text-primary underline underline-offset-4'>
                            {t('Écrivez à notre équipe')}
                        </Link>
                    </p>
                </div>
            </section>
        </>
    )
}
