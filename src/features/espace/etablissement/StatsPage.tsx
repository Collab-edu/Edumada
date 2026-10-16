'use client'
import { useState } from 'react'
import { ButtonLink, EmptyState, FormAlert } from '@/components/ui/form'
import { useApi } from '../useApi'
import { Panel, StatCard } from '../components/SpaceShell'
import BarChart from '../components/BarChart'
import { EstablishmentSpace, useEstablishment } from './EstablishmentSpace'

type Totals = {
    views: number
    contactClicks: number
    websiteClicks: number
    applyClicks: number
    impressions: number
    clicks: number
    clickRate: number | null
    inquiries: number
    applications: number
    processed: number
}

type Stats = {
    level: 'standard' | 'advanced'
    period: { from: string; to: string; days: number }
    totals: Totals
    previousTotals: Totals | null
    series: { date: string; views: number; contactClicks: number; inquiries: number }[]
    offers: { id: string; title: string; status: string; views: number; contactClicks: number; inquiries: number }[]
    campaigns?: { id: number; title: string; offer: string; startsOn: string; endsOn: string; impressions: number; clicks: number; clickRate: number | null; inquiriesDuring: number }[]
}

/** Évolution par rapport à la période précédente, seulement si elle contient des données. */
function trend(current: number, previous: number | undefined) {
    if (previous === undefined || previous === 0) return undefined
    const change = Math.round(((current - previous) / previous) * 100)
    return `${change >= 0 ? '+' : ''}${change} % vs période précédente`
}

function Stats() {
    const { establishment: e, href } = useEstablishment()
    const [days, setDays] = useState(30)
    const level = e.plan.features.statistics ?? 'none'
    const { data, loading, error } = useApi<{ data: Stats }>(level === 'none' ? null : `/establishments/${e.id}/stats`, { days })

    if (level === 'none') {
        return (
            <Panel title='Statistiques'>
                <div className='flex flex-col gap-4'>
                    <p className='text-ink/70'>
                        Combien de personnes consultent vos offres, cliquent pour vous contacter, envoient une demande ? Les statistiques sont incluses dans Pro (standard) et Premium (avancées, avec les campagnes).
                    </p>
                    <ButtonLink href={href('formule')} className='w-fit'>Voir les formules</ButtonLink>
                </div>
            </Panel>
        )
    }

    const stats = data?.data
    const t = stats?.totals
    const p = stats?.previousTotals ?? undefined
    const processedShare = t && t.inquiries + t.applications > 0 ? Math.round((t.processed / (t.inquiries + t.applications)) * 100) : null

    return (
        <>
            <div className='flex flex-wrap items-center gap-2' role='group' aria-label='Période'>
                {[7, 30, 90].map((d) => (
                    <button
                        key={d}
                        type='button'
                        aria-pressed={days === d}
                        onClick={() => setDays(d)}
                        className={`min-h-10 rounded-full px-4 text-sm font-semibold hover:cursor-pointer ${days === d ? 'bg-secondary text-white' : 'bg-white text-secondary'}`}>
                        {d} jours
                    </button>
                ))}
            </div>

            {error && <FormAlert>{error.message}</FormAlert>}
            {loading && !stats ? (
                <div className='h-64 rounded-2xl bg-white animate-pulse' />
            ) : stats && t ? (
                <>
                    <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
                        <StatCard icon='tabler:eye' label='Vues des fiches' value={t.views} hint={trend(t.views, p?.views)} />
                        <StatCard icon='tabler:phone' label='Clics de contact' value={t.contactClicks + t.websiteClicks} hint={trend(t.contactClicks + t.websiteClicks, p ? p.contactClicks + p.websiteClicks : undefined)} />
                        <StatCard icon='tabler:inbox' label='Demandes reçues' value={t.inquiries + t.applications} hint={`${t.applications} candidature(s)`} />
                        <StatCard icon='tabler:checks' label='Demandes traitées' value={processedShare === null ? '—' : `${processedShare} %`} />
                    </div>

                    <Panel title="Évolution">
                        <div className='grid grid-cols-1 xl:grid-cols-2 gap-8'>
                            <BarChart title='Vues par jour' unit='vues' points={stats.series.map((s) => ({ date: s.date, value: s.views }))} />
                            <BarChart title='Demandes par jour' unit='demandes' points={stats.series.map((s) => ({ date: s.date, value: s.inquiries }))} />
                        </div>
                    </Panel>

                    <Panel title='Par offre' description='Les offres qui génèrent le plus de demandes en premier.'>
                        {stats.offers.length === 0 ? (
                            <EmptyState icon='tabler:chart-bar' title='Pas encore de données' />
                        ) : (
                            <div className='-mx-5 overflow-x-auto sm:mx-0'>
                                <table className='w-full min-w-[480px] text-left text-sm'>
                                    <thead className='text-ink/60'>
                                        <tr className='border-b border-gray-100'>
                                            <th className='px-5 py-2 font-semibold sm:px-2'>Offre</th>
                                            <th className='px-2 py-2 text-right font-semibold'>Vues</th>
                                            <th className='px-2 py-2 text-right font-semibold'>Contacts</th>
                                            <th className='px-2 py-2 text-right font-semibold'>Demandes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.offers.map((o) => (
                                            <tr key={o.id} className='border-b border-gray-50'>
                                                <td className='px-5 py-2 text-secondary sm:px-2'>{o.title}</td>
                                                <td className='px-2 py-2 text-right tabular-nums'>{o.views}</td>
                                                <td className='px-2 py-2 text-right tabular-nums'>{o.contactClicks}</td>
                                                <td className='px-2 py-2 text-right font-semibold tabular-nums'>{o.inquiries}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Panel>

                    {stats.level === 'advanced' && (
                        <Panel title='Campagnes' description='Impressions et clics des emplacements sponsorisés ; demandes reçues pour l’offre promue pendant la campagne (attribution indicative).'>
                            {!stats.campaigns || stats.campaigns.length === 0 ? (
                                <EmptyState icon='tabler:speakerphone' title='Aucune campagne' action={<ButtonLink href={href('campagnes')}>Créer une campagne</ButtonLink>} />
                            ) : (
                                <ul className='flex flex-col gap-3'>
                                    {stats.campaigns.map((c) => (
                                        <li key={c.id} className='rounded-xl border border-gray-100 p-4'>
                                            <p className='font-semibold text-secondary'>{c.title}</p>
                                            <p className='text-sm text-ink/60'>{c.offer}</p>
                                            <dl className='mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm'>
                                                <div><dt className='text-ink/60'>Impressions</dt><dd className='text-lg font-bold text-secondary'>{c.impressions}</dd></div>
                                                <div><dt className='text-ink/60'>Clics</dt><dd className='text-lg font-bold text-secondary'>{c.clicks}</dd></div>
                                                <div><dt className='text-ink/60'>Taux de clic</dt><dd className='text-lg font-bold text-secondary'>{c.clickRate === null ? '—' : `${c.clickRate} %`}</dd></div>
                                                <div><dt className='text-ink/60'>Demandes</dt><dd className='text-lg font-bold text-secondary'>{c.inquiriesDuring}</dd></div>
                                            </dl>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Panel>
                    )}
                </>
            ) : null}
        </>
    )
}

export default function StatsPage() {
    return (
        <EstablishmentSpace title='Statistiques'>
            <Stats />
        </EstablishmentSpace>
    )
}
