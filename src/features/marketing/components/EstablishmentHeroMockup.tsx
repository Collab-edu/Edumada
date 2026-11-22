'use client'
import { Icon } from '@/components/ui/icon'
import { useT } from '@/i18n/client'

const MENU = ['Mon établissement', 'Formations', 'Demandes', 'Statistiques', 'Paramètres']
const OFFERS = ['Licence en Informatique', 'Licence en Communication', 'Master en Gestion de Projet']

/**
 * Aperçu illustratif de l'espace établissement (en-tête de la page Avantages) : fenêtre du back-office
 * avec la liste des formations, et deux bulles flottantes (nouvelle demande, vues du mois). Décoratif.
 */
export default function EstablishmentHeroMockup() {
    const t = useT()
    return (
        <div className='relative mx-auto w-full max-w-[34rem] px-2 py-10 sm:px-6' aria-hidden='true'>
            {/* Forme rose inclinée derrière la fenêtre */}
            <div className='absolute inset-x-6 top-4 bottom-0 rotate-[4deg] rounded-[2.5rem] bg-primary/10 sm:inset-x-10' />

            {/* Fenêtre du back-office */}
            <div className='relative overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.25)] ring-1 ring-gray-100'>
                <div className='flex items-center gap-1.5 border-b border-gray-100 px-4 py-2.5'>
                    <span className='h-2.5 w-2.5 rounded-full bg-[#ff5f57]' />
                    <span className='h-2.5 w-2.5 rounded-full bg-[#febc2e]' />
                    <span className='h-2.5 w-2.5 rounded-full bg-[#28c840]' />
                    <span className='ml-3 h-2 flex-1 rounded-full bg-gray-100' />
                </div>
                <div className='flex'>
                    <div className='w-[34%] shrink-0 bg-secondary px-2.5 py-4 sm:px-3'>
                        <p className='mb-4 px-2 font-heading text-sm font-extrabold text-white sm:text-base'>EduMada</p>
                        <ul className='flex flex-col gap-1'>
                            {MENU.map((item) => (
                                <li
                                    key={item}
                                    className={`truncate rounded-md px-2 py-1.5 text-[10px] sm:text-xs ${item === 'Formations' ? 'bg-primary font-semibold text-white' : 'text-white/75'}`}>
                                    {t(item)}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className='min-w-0 flex-1 bg-offwhite/60 p-3 sm:p-4'>
                        <div className='mb-3 flex items-center justify-between gap-2'>
                            <p className='truncate text-xs font-bold text-secondary sm:text-sm'>{t('Mes formations')}</p>
                            <span className='shrink-0 rounded-md bg-primary px-2 py-1 text-[9px] font-semibold text-white sm:text-[10px]'>+ {t('Ajouter une formation')}</span>
                        </div>
                        <ul className='flex flex-col gap-2'>
                            {OFFERS.map((offer) => (
                                <li key={offer} className='flex items-center gap-2.5 rounded-lg border border-gray-100 bg-white p-2.5'>
                                    <span className='h-7 w-7 shrink-0 rounded-md bg-gray-100 sm:h-8 sm:w-8' />
                                    <span className='flex min-w-0 flex-1 flex-col gap-1'>
                                        <span className='truncate text-[10px] font-semibold text-secondary sm:text-xs'>{offer}</span>
                                        <span className='h-1.5 w-3/5 rounded-full bg-gray-100' />
                                    </span>
                                    <span className='shrink-0 rounded-md bg-success/30 px-1.5 py-0.5 text-[9px] font-semibold text-green-700 sm:text-[10px]'>{t('Publié')}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bulle : nouvelle demande */}
            <div className='absolute top-2 right-0 flex items-center gap-2.5 rounded-xl bg-white px-3 py-2.5 shadow-[0_12px_30px_-12px_rgba(15,23,42,0.22)] sm:right-2'>
                <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary'>
                    <Icon icon='tabler:message-circle' className='text-base' />
                </span>
                <span className='flex flex-col leading-tight'>
                    <span className='text-[11px] font-bold text-secondary sm:text-xs'>{t('Nouvelle demande')}</span>
                    <span className='text-[10px] text-ink/60 sm:text-[11px]'>Licence en Informatique</span>
                </span>
            </div>

            {/* Bulle : vues du mois */}
            <div className='absolute bottom-2 left-0 flex items-center gap-2.5 rounded-xl bg-white px-3 py-2.5 shadow-[0_12px_30px_-12px_rgba(15,23,42,0.22)]'>
                <span className='flex h-9 w-9 items-center justify-center rounded-full bg-success/30 text-green-700'>
                    <Icon icon='tabler:eye' className='text-lg' />
                </span>
                <span className='flex flex-col leading-tight'>
                    <span className='font-heading text-lg font-extrabold text-secondary'>1 240</span>
                    <span className='text-[10px] text-ink/60 sm:text-[11px]'>{t('vues ce mois')}</span>
                </span>
            </div>
        </div>
    )
}
