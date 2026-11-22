'use client'
import { useEffect, useState } from 'react'
import Link, { useT } from '@/i18n/client'
import { CONSENT_OPEN_EVENT, readConsent, saveConsent } from '@/lib/consent'
import { cn } from '@/lib/utils'

const BUTTON = 'inline-flex min-h-11 flex-1 items-center justify-center rounded-xl px-5 font-semibold transition-colors duration-200 hover:cursor-pointer sm:flex-none'

/**
 * Bandeau de consentement : posé au premier passage, puis rouvert depuis « Gérer les cookies »
 * (pied de page). Accepter et refuser ont le même poids ; « Personnaliser » détaille les usages.
 */
export default function ConsentBanner() {
    const t = useT()
    const [open, setOpen] = useState(false)
    const [details, setDetails] = useState(false)
    const [measure, setMeasure] = useState(false)

    useEffect(() => {
        const saved = readConsent()
        setMeasure(saved?.measure ?? false)
        if (!saved) setOpen(true)
        const reopen = () => {
            setMeasure(readConsent()?.measure ?? false)
            setDetails(true)
            setOpen(true)
        }
        window.addEventListener(CONSENT_OPEN_EVENT, reopen)
        return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen)
    }, [])

    if (!open) return null

    const choose = (value: boolean) => {
        saveConsent(value)
        setOpen(false)
        setDetails(false)
    }

    return (
        <div role='dialog' aria-modal='false' aria-labelledby='consent-title' className='fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 sm:px-6 sm:pb-6'>
            <div className='mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_16px_40px_-16px_rgba(15,23,42,0.35)] sm:p-6'>
                <div className='flex flex-col gap-2'>
                    <p id='consent-title' className='font-semibold text-secondary'>{t('Vos données sur Edumada')}</p>
                    <p className='!text-sm leading-relaxed text-black'>
                        {t('Edumada garde dans votre navigateur ce qui est nécessaire au site : votre connexion, vos réponses au test d’orientation et les stages que vous enregistrez. Avec votre accord, nous comptons aussi, de façon anonyme, les visites et les clics sur les fiches, pour les statistiques des établissements.')}{' '}
                        <Link href='/confidentialite/' className='font-semibold text-secondary underline underline-offset-2 hover:text-primary'>
                            {t('Politique de confidentialité')}
                        </Link>
                    </p>
                </div>

                {details && (
                    <ul className='flex flex-col divide-y divide-gray-100 rounded-xl border border-gray-200'>
                        <li className='flex items-start justify-between gap-4 p-4'>
                            <div className='flex flex-col gap-1'>
                                <p className='!text-sm font-semibold text-secondary'>{t('Nécessaire au fonctionnement')}</p>
                                <p className='!text-sm text-ink/70'>{t('Connexion, test d’orientation, stages enregistrés. Toujours actif.')}</p>
                            </div>
                            <span className='shrink-0 !text-sm font-semibold text-ink/50'>{t('Toujours actif')}</span>
                        </li>
                        <li className='flex items-start justify-between gap-4 p-4'>
                            <label htmlFor='consent-measure' className='flex flex-col gap-1 hover:cursor-pointer'>
                                <span className='!text-sm font-semibold text-secondary'>{t('Mesure d’audience anonyme')}</span>
                                <span className='!text-sm text-ink/70'>{t('Nombre de vues et de clics par fiche, sans cookie ni donnée personnelle.')}</span>
                            </label>
                            {/* Interrupteur : bouton à bascule accessible. */}
                            <button
                                id='consent-measure'
                                type='button'
                                role='switch'
                                aria-checked={measure}
                                onClick={() => setMeasure((v) => !v)}
                                className={cn(
                                    'relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-200 hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary',
                                    measure ? 'bg-secondary' : 'bg-gray-300'
                                )}>
                                <span className={cn('absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200', measure && 'translate-x-5')} />
                            </button>
                        </li>
                    </ul>
                )}

                <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                    {details ? (
                        <button type='button' onClick={() => choose(measure)} className={cn(BUTTON, 'bg-secondary text-white hover:bg-secondary/90')}>
                            {t('Enregistrer mes choix')}
                        </button>
                    ) : (
                        <div className='flex gap-3'>
                            {/* Refuser et accepter : même taille, même poids. */}
                            <button type='button' onClick={() => choose(false)} className={cn(BUTTON, 'bg-secondary text-white hover:bg-secondary/90')}>
                                {t('Tout refuser')}
                            </button>
                            <button type='button' onClick={() => choose(true)} className={cn(BUTTON, 'bg-primary text-white hover:bg-primary/90')}>
                                {t('Tout accepter')}
                            </button>
                        </div>
                    )}
                    <button
                        type='button'
                        onClick={() => setDetails((v) => !v)}
                        className='!text-sm font-semibold text-secondary underline underline-offset-4 decoration-secondary/40 hover:cursor-pointer hover:text-primary sm:ml-auto'>
                        {details ? t('Retour') : t('Personnaliser')}
                    </button>
                </div>
            </div>
        </div>
    )
}
