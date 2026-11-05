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
import { planFeatureSections, signupUrl, usePlans } from '../plans'
import { Eyebrow } from '@/components/ui/eyebrow'

/** Présentation de chaque formule, comme sur la page Formule du back-office. */
const PLAN_CARD: Record<Plan['code'], { description: string; tag?: string }> = {
    free: { description: 'Idéale pour démarrer et avoir une présence de base sur la plateforme.' },
    pro: { description: 'Pour les établissements qui souhaitent plus de visibilité et de demandes.', tag: 'Recommandé' },
    premium: { description: 'Pour les établissements qui veulent une visibilité maximale et un accompagnement prioritaire.', tag: 'Visibilité maximale' },
}

/** Prix selon le rythme choisi ; une formule sans tarif annuel reste au mois. */
function planPrice(plan: Plan, yearly: boolean) {
    if (plan.code === 'free') return { amount: '0 Ar', period: 'par mois' }
    if (!yearly || plan.yearlyPrice === null) {
        return { amount: formatAriary(plan.monthlyPrice), period: yearly ? 'par mois, pas de tarif annuel' : 'par mois' }
    }
    return { amount: formatAriary(plan.yearlyPrice), period: `par an, soit ${formatAriary(Math.round(plan.yearlyPrice / 12))} par mois` }
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
    // Économie réelle de l'annuel, calculée à partir des prix.
    const yearlyPlan = plans.find((plan) => plan.code !== 'free' && plan.yearlyPrice !== null && !!plan.monthlyPrice)
    const yearlySaving = yearlyPlan ? Math.round((1 - (yearlyPlan.yearlyPrice ?? 0) / ((yearlyPlan.monthlyPrice ?? 1) * 12)) * 100) : 0

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
                                    {value && yearlySaving > 0 ? (
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
                            const card = PLAN_CARD[plan.code]
                            const highlighted = plan.code === 'pro'
                            const price = planPrice(plan, yearly)
                            return (
                                <div
                                    key={plan.code}
                                    className={cn(
                                        'relative flex flex-col overflow-hidden rounded-xl border bg-white',
                                        highlighted ? 'border-primary shadow-[4px_4px_0_0_rgba(255,59,82,0.3)] md:-my-3' : 'border-gray-200 shadow-[4px_4px_0_0_rgba(15,76,92,0.22)]'
                                    )}>
                                    <div className={cn('flex flex-col gap-4 p-6', highlighted && 'bg-cream/60')}>
                                        <div className='flex flex-wrap items-center justify-between gap-x-2 gap-y-1'>
                                            <p className='whitespace-nowrap text-xl font-bold text-secondary'>Formule {t(plan.name)}</p>
                                            {card.tag && <Eyebrow bar={false} className='whitespace-nowrap'>{card.tag}</Eyebrow>}
                                        </div>
                                        <p className='min-h-12 text-sm text-black'>{card.description}</p>
                                        <div className='min-h-16'>
                                            <p className='text-4xl font-bold text-secondary'>{price.amount}</p>
                                            <p className='mt-1 text-sm text-ink/60'>{price.period}</p>
                                        </div>
                                        <ButtonLink href={cta(plan)} variant={highlighted ? 'primary' : 'dark'} className='w-full justify-center'>
                                            {plan.code === 'free' ? t('Référencer mon établissement') : t('Choisir {plan}', { plan: t(plan.name) })}
                                        </ButtonLink>
                                    </div>
                                    <div className='flex flex-1 flex-col gap-5 border-t border-gray-100 p-6'>
                                        {planFeatureSections(plan).map((section) => (
                                            <div key={section.title} className='flex flex-col gap-2.5'>
                                                <p className='flex items-center justify-between gap-2 text-sm font-semibold text-secondary'>
                                                    {section.title}
                                                    <span className='shrink-0 rounded-full bg-offwhite px-2 py-0.5 text-xs font-semibold text-ink/70'>
                                                        {section.features.filter((f) => f.included).length}/{section.features.length}
                                                        <span className='sr-only'> fonctions incluses</span>
                                                    </span>
                                                </p>
                                                <ul className='flex flex-col gap-2'>
                                                    {section.features.map((f) => (
                                                        <li key={f.label} className={cn('flex items-start gap-2 text-sm', f.included ? 'text-ink/80' : 'text-ink/40')}>
                                                            <Icon icon={f.included ? 'tabler:circle-check-filled' : 'tabler:x'} className={cn('mt-0.5 shrink-0 text-lg', f.included ? 'text-primary' : 'text-ink/30')} />
                                                            <span>
                                                                {f.label}
                                                                {!f.included && <span className='sr-only'> (non inclus)</span>}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className='flex flex-col gap-1 text-center text-sm text-ink/60'>
                        <p>{t('Prix de lancement indicatifs, susceptibles d’évoluer. Aucun nombre de candidats n’est garanti.')}</p>
                        <p>À l’expiration d’une formule payante, la fiche reste en ligne avec la formule Gratuit ; seules les fonctions payantes s’arrêtent.</p>
                    </div>
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
