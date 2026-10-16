'use client'
import type { ReactNode } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import { cn } from '@/lib/utils'
import type { Plan } from '../types'
import { formatAriary } from './SpaceShell'

/** Ce que comprend chaque formule, d'après le document « Les 4 types de comptes ». */
export const PLAN_FEATURES: Record<Plan['code'], string[]> = {
    free: [
        'Fiche établissement complète',
        'Offres publiées : selon la limite de la formule',
        'Présence dans les résultats standards',
        'Demandes reçues par e-mail',
    ],
    pro: [
        'Tout Gratuit',
        'Offres illimitées',
        'Boîte de réception des demandes et candidatures',
        'Statuts, filtres et export CSV',
        'Statistiques standard',
    ],
    premium: [
        'Tout Pro',
        'Campagnes sponsorisées, clairement signalées',
        'Statistiques avancées par campagne',
        'Accompagnement prioritaire',
    ],
}

export function PlanCards({ plans, current, action }: { plans: Plan[]; current?: Plan['code']; action?: (plan: Plan) => ReactNode }) {
    return (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {plans.map((plan) => (
                <div
                    key={plan.code}
                    className={cn(
                        'flex flex-col gap-4 rounded-2xl border bg-white p-5',
                        plan.code === 'pro' ? 'border-primary shadow-lg shadow-primary/10' : 'border-gray-100',
                        current === plan.code && 'ring-2 ring-secondary'
                    )}>
                    <div className='flex items-center justify-between gap-2'>
                        <p className='text-xl font-bold text-secondary'>{plan.name}</p>
                        {current === plan.code && <span className='rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-white'>Votre formule</span>}
                        {plan.code === 'pro' && current !== plan.code && <span className='rounded-full bg-cream px-3 py-1 text-xs font-semibold text-primary'>Recommandée</span>}
                    </div>
                    <div>
                        {plan.code === 'free' ? (
                            <p className='text-3xl font-bold text-secondary'>0 Ar</p>
                        ) : (
                            <>
                                <p className='text-3xl font-bold text-secondary'>{formatAriary(plan.monthlyPrice)}<span className='text-base font-normal text-ink/60'> / mois</span></p>
                                {plan.yearlyPrice !== null && <p className='text-sm text-ink/60'>ou {formatAriary(plan.yearlyPrice)} / an</p>}
                            </>
                        )}
                    </div>
                    <ul className='flex flex-1 flex-col gap-2 text-sm text-ink/80'>
                        {PLAN_FEATURES[plan.code].map((feature) => (
                            <li key={feature} className='flex items-start gap-2'>
                                <Icon icon='tabler:circle-check-filled' className='mt-0.5 shrink-0 text-primary' />
                                {feature.startsWith('Offres publiées') ? `${plan.maxPublishedOffers ?? 'Offres illimitées'} offres publiées` : feature}
                            </li>
                        ))}
                    </ul>
                    {action?.(plan)}
                </div>
            ))}
        </div>
    )
}

export default PlanCards
