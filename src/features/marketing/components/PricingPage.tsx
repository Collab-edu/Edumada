'use client'
import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import { ButtonLink } from '@/components/ui/form'
import { api, apiEnabled } from '@/lib/api'
import PlanCards from '@/features/espace/components/PlanCards'
import type { Plan } from '@/features/espace/types'
import { useAuth } from '@/features/auth/AuthProvider'

/** Formules affichées si l'API ne répond pas (mêmes hypothèses que la base). */
const FALLBACK_PLANS: Plan[] = [
    { code: 'free', name: 'Gratuit', monthlyPrice: 0, yearlyPrice: 0, maxPublishedOffers: 3, features: { inquiryInbox: false, statistics: 'none' } },
    { code: 'pro', name: 'Pro', monthlyPrice: 75000, yearlyPrice: 600000, maxPublishedOffers: null, features: { inquiryInbox: true, statistics: 'standard' } },
    { code: 'premium', name: 'Premium', monthlyPrice: 175000, yearlyPrice: null, maxPublishedOffers: null, features: { inquiryInbox: true, statistics: 'advanced', sponsoredPlacement: true } },
]

const FAQ = [
    {
        q: 'Les étudiants paient-ils quelque chose ?',
        a: "Non. Rechercher, comparer, contacter un établissement et suivre une candidature est toujours gratuit pour les étudiants et les familles.",
    },
    {
        q: 'Que se passe-t-il à la fin de mon abonnement ?',
        a: "Vous recevez un rappel 30, 7 et 1 jour avant. Après une courte période de grâce, les fonctions payantes s'arrêtent mais votre fiche reste en ligne avec la formule Gratuit.",
    },
    {
        q: 'Le badge « établissement vérifié » est-il inclus dans une formule ?',
        a: "Non : il est attribué après un contrôle réel de votre identité et de vos autorisations, quelle que soit votre formule. Il ne s'achète pas.",
    },
    {
        q: 'Comment payer ?',
        a: "Par MVola, Orange Money, Airtel Money, virement ou en espèces. Vous indiquez la référence du paiement dans votre espace ; Edumada confirme et active la formule.",
    },
    {
        q: 'Je ne recrute que quelques mois par an.',
        a: "Une campagne Premium d'un mois autour de la rentrée peut suffire : pas besoin d'un abonnement toute l'année.",
    },
]

export default function PricingPage() {
    const { user } = useAuth()
    const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS)

    useEffect(() => {
        if (!apiEnabled) return
        api<{ data: Plan[] }>('/plans', { token: null }).then((res) => setPlans(res.data)).catch(() => undefined)
    }, [])

    const cta = user?.role === 'establishment' ? '/espace/etablissement/formule/' : '/signup/?type=etablissement'

    return (
        <section className='pt-28 pb-20'>
            <div className='container mx-auto max-w-7xl px-4 flex flex-col gap-10'>
                <div className='mx-auto flex max-w-3xl flex-col gap-3 text-center'>
                    <p className='font-semibold uppercase tracking-wide text-primary'>Établissements</p>
                    <h1 className='text-3xl md:text-5xl font-bold tracking-tight text-secondary'>Faites-vous connaître des futurs étudiants</h1>
                    <p className='text-ink/70'>
                        Commencez gratuitement. Passez à Pro pour gérer vos demandes et candidatures, à Premium pour mettre vos formations en avant pendant vos recrutements.
                    </p>
                </div>

                <PlanCards
                    plans={plans}
                    action={(plan) => (
                        <ButtonLink href={cta} variant={plan.code === 'pro' ? 'primary' : plan.code === 'premium' ? 'dark' : 'secondary'}>
                            {plan.code === 'free' ? 'Référencer mon établissement' : `Choisir ${plan.name}`}
                        </ButtonLink>
                    )}
                />
                <p className='text-center text-sm text-ink/60'>Prix de lancement indicatifs, susceptibles d&apos;évoluer. Aucun nombre de candidats n&apos;est garanti.</p>

                <div className='mx-auto w-full max-w-3xl'>
                    <h2 className='mb-5 text-center font-bold'>Questions fréquentes</h2>
                    <div className='flex flex-col gap-3'>
                        {FAQ.map((item) => (
                            <details key={item.q} className='group rounded-xl border border-gray-100 bg-white p-4'>
                                <summary className='flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-semibold text-secondary'>
                                    {item.q}
                                    <Icon icon='tabler:chevron-down' className='shrink-0 transition-transform group-open:rotate-180' />
                                </summary>
                                <p className='mt-2 text-ink/80'>{item.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
