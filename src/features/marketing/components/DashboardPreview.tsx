import { Icon } from '@/components/ui/icon'

const MENU = [
    { icon: 'tabler:layout-dashboard', label: 'Tableau de bord', active: true },
    { icon: 'tabler:id-badge-2', label: 'Ma fiche' },
    { icon: 'tabler:books', label: 'Offres' },
    { icon: 'tabler:inbox', label: 'Demandes', badge: 3 },
    { icon: 'tabler:chart-bar', label: 'Statistiques' },
]

const TILES = [
    { icon: 'tabler:eye', label: 'Vues de la fiche', value: '1 240', trend: '+18 %' },
    { icon: 'tabler:phone', label: 'Clics de contact', value: '86', trend: '+9 %' },
    { icon: 'tabler:inbox', label: 'Demandes', value: '23', trend: '+5' },
]

const REQUESTS = [
    { initials: 'RA', name: 'Rova A.', offer: 'Licence en informatique', status: 'Nouvelle', tone: 'bg-primary/10 text-primary' },
    { initials: 'TM', name: 'Tiana M.', offer: 'BTS Commerce', status: 'En cours', tone: 'bg-amber-100 text-amber-700' },
    { initials: 'HN', name: 'Hery N.', offer: 'Licence en informatique', status: 'Acceptée', tone: 'bg-success/40 text-secondary' },
]

/** Courbe des vues sur 30 jours (valeurs illustratives, 0 = bas, 100 = haut). */
const CURVE = [30, 38, 34, 46, 42, 55, 50, 62, 58, 70, 66, 78, 74, 88]

function curvePath(close: boolean) {
    const step = 300 / (CURVE.length - 1)
    const points = CURVE.map((v, i) => `${(i * step).toFixed(1)},${(100 - v).toFixed(1)}`)
    const line = `M${points.join(' L')}`
    return close ? `${line} L300,100 L0,100 Z` : line
}

/** Aperçu illustratif de l'espace établissement, dessiné en HTML. */
export default function DashboardPreview() {
    return (
        <div className='relative px-2 pb-8 pt-6 sm:px-6' aria-hidden='true'>
            <div className='absolute inset-0 -z-10 rounded-3xl bg-cream' />

            {/* Fenêtre */}
            <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[6px_6px_0_0_rgba(15,76,92,0.22)]'>
                <div className='flex items-center gap-2 border-b border-gray-100 bg-offwhite px-4 py-2.5'>
                    <span className='h-2.5 w-2.5 rounded-full bg-primary/70' />
                    <span className='h-2.5 w-2.5 rounded-full bg-amber-300' />
                    <span className='h-2.5 w-2.5 rounded-full bg-success' />
                    <span className='ml-3 flex-1 truncate rounded-md bg-white px-3 py-1 text-[11px] text-ink/50'>edumada.mg/espace-etablissement</span>
                </div>

                <div className='flex'>
                    {/* Menu latéral */}
                    <div className='hidden w-40 shrink-0 flex-col gap-1 bg-secondary p-3 sm:flex'>
                        <p className='mb-2 px-2 text-xs font-bold text-white'>Edumada <span className='font-normal text-white/60'>Pro</span></p>
                        {MENU.map((item) => (
                            <span
                                key={item.label}
                                className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] ${item.active ? 'bg-white/15 font-semibold text-white' : 'text-white/70'}`}>
                                <Icon icon={item.icon} className='text-sm' />
                                <span className='flex-1 truncate'>{item.label}</span>
                                {item.badge && <span className='rounded-full bg-primary px-1.5 text-[10px] font-bold text-white'>{item.badge}</span>}
                            </span>
                        ))}
                    </div>

                    {/* Contenu */}
                    <div className='flex min-w-0 flex-1 flex-col gap-3 p-4'>
                        <div className='flex items-center justify-between gap-2'>
                            <div className='min-w-0'>
                                <p className='truncate !text-sm font-bold text-secondary'>Institut Numérique de Madagascar</p>
                                <p className='!text-[11px] text-ink/50'>30 derniers jours</p>
                            </div>
                            <span className='flex shrink-0 items-center gap-1 rounded-full bg-success/40 px-2 py-0.5 text-[10px] font-semibold text-secondary'>
                                <Icon icon='tabler:rosette-discount-check' className='text-xs' />
                                Vérifié
                            </span>
                        </div>

                        <div className='grid grid-cols-3 gap-2'>
                            {TILES.map((tile) => (
                                <div key={tile.label} className='flex flex-col gap-0.5 rounded-lg border border-gray-100 p-2'>
                                    <div className='flex items-center justify-between'>
                                        <Icon icon={tile.icon} className='text-sm text-primary' />
                                        <span className='text-[10px] font-semibold text-emerald-600'>{tile.trend}</span>
                                    </div>
                                    <span className='text-base font-bold text-secondary sm:text-lg'>{tile.value}</span>
                                    <span className='truncate text-[10px] text-ink/60'>{tile.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className='rounded-lg border border-gray-100 p-2'>
                            <div className='mb-1 flex items-center justify-between text-[10px]'>
                                <span className='font-semibold text-secondary'>Vues de la fiche</span>
                                <span className='text-ink/50'>sept. → oct.</span>
                            </div>
                            <svg viewBox='0 0 300 100' preserveAspectRatio='none' className='h-20 w-full'>
                                <defs>
                                    <linearGradient id='dashboard-preview-fill' x1='0' x2='0' y1='0' y2='1'>
                                        <stop offset='0%' stopColor='var(--color-primary)' stopOpacity='0.25' />
                                        <stop offset='100%' stopColor='var(--color-primary)' stopOpacity='0' />
                                    </linearGradient>
                                </defs>
                                {[25, 50, 75].map((y) => (
                                    <line key={y} x1='0' x2='300' y1={y} y2={y} stroke='var(--color-secondary)' strokeOpacity='0.08' />
                                ))}
                                <path d={curvePath(true)} fill='url(#dashboard-preview-fill)' />
                                <path d={curvePath(false)} fill='none' stroke='var(--color-primary)' strokeWidth='2.5' vectorEffect='non-scaling-stroke' />
                            </svg>
                        </div>

                        <div className='flex flex-col gap-1.5'>
                            <p className='!text-[11px] font-semibold text-secondary'>Dernières demandes</p>
                            {REQUESTS.map((request) => (
                                <div key={request.name} className='flex items-center gap-2 rounded-lg bg-offwhite px-2 py-1.5'>
                                    <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-[9px] font-bold text-white'>
                                        {request.initials}
                                    </span>
                                    <div className='min-w-0 flex-1'>
                                        <p className='truncate !text-[11px] font-semibold text-secondary'>{request.name}</p>
                                        <p className='truncate !text-[10px] text-ink/60'>{request.offer}</p>
                                    </div>
                                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${request.tone}`}>{request.status}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Cartes flottantes */}
            <div className='absolute -top-1 right-0 flex animate-float items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-lg sm:-right-2'>
                <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white'>
                    <Icon icon='tabler:bell' className='text-base' />
                </span>
                <div className='leading-tight'>
                    <p className='!text-xs font-semibold text-secondary'>Nouvelle candidature</p>
                    <p className='!text-[10px] text-ink/60'>il y a 5 min</p>
                </div>
            </div>
            <div className='absolute -bottom-2 left-0 flex animate-float items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-lg [animation-delay:1.5s] sm:-left-2'>
                <span className='flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-white'>
                    <Icon icon='tabler:trending-up' className='text-base' />
                </span>
                <div className='leading-tight'>
                    <p className='!text-xs font-semibold text-secondary'>+18 % de vues</p>
                    <p className='!text-[10px] text-ink/60'>ce mois-ci</p>
                </div>
            </div>
        </div>
    )
}
