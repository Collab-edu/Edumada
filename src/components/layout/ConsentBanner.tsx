'use client'
import { useEffect, useState } from 'react'
import Link, { useT } from '@/i18n/client'
import { CONSENT_DONE_CLASS, CONSENT_OPEN_EVENT, globalPrivacyControl, readConsent, saveConsent, type ConsentChoice } from '@/lib/consent'
import { cn } from '@/lib/utils'

const NONE: ConsentChoice = { measure: false, analytics: false }
const ALL: ConsentChoice = { measure: true, analytics: true }

const BUTTON = 'inline-flex min-h-11 flex-1 items-center justify-center rounded-xl px-5 font-semibold transition-colors duration-200 hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary sm:flex-none'

/**
 * Bandeau de consentement, conforme aux recommandations de la CNIL (un choix par usage) :
 * « Tout refuser » et « Tout accepter » au même niveau,
 * rien n'est actif avant le choix, détail des usages dans « Personnaliser ».
 * Posé au premier passage et tous les 6 mois, rouvert depuis « Gérer les cookies ».
 */
export default function ConsentBanner() {
    const t = useT()
    // Présent dès le HTML (sans attendre le JavaScript) : le script CONSENT_HEAD_SCRIPT le masque
    // avant l'affichage quand le visiteur a déjà choisi. Ainsi il ne retarde pas l'affichage de la page.
    const [open, setOpen] = useState(true)
    const [details, setDetails] = useState(false)
    const [measure, setMeasure] = useState(false)
    const [analytics, setAnalytics] = useState(false)
    const [gpc, setGpc] = useState(false)

    useEffect(() => {
        const saved = readConsent()
        const browserRefuses = globalPrivacyControl()
        setGpc(browserRefuses)
        setMeasure(saved?.measure ?? false)
        setAnalytics(saved?.analytics ?? false)
        // Le navigateur refuse déjà (Global Privacy Control) : refus enregistré, sans bandeau.
        if (!saved && browserRefuses) saveConsent(NONE, 'gpc')
        if (saved || browserRefuses) setOpen(false)

        const reopen = () => {
            document.documentElement.classList.remove(CONSENT_DONE_CLASS)
            setMeasure(readConsent()?.measure ?? false)
            setAnalytics(readConsent()?.analytics ?? false)
            setDetails(true)
            setOpen(true)
        }
        window.addEventListener(CONSENT_OPEN_EVENT, reopen)
        return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen)
    }, [])

    if (!open) return null

    const choose = (choice: ConsentChoice) => {
        saveConsent(gpc ? NONE : choice)
        document.documentElement.classList.add(CONSENT_DONE_CLASS)
        setOpen(false)
        setDetails(false)
    }

    return (
        <section
            role='region'
            aria-label={t('Consentement aux cookies')}
            className='consent-banner fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 sm:px-6 sm:pb-6'>
            <div className='mx-auto flex max-h-[calc(100dvh-2rem)] max-w-3xl flex-col gap-4 overflow-y-auto overscroll-contain rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_16px_40px_-16px_rgba(15,23,42,0.35)] sm:p-6'>
                <div className='flex flex-col gap-2'>
                    <h2 id='consent-title' className='!text-base font-semibold text-secondary'>{t('Vos données sur Edumada')}</h2>
                    {/* Texte court : plus petit que le titre de la page, il ne devient pas l'élément mesuré par Google (LCP). Le détail est dans « Personnaliser ». */}
                    <p className='!text-sm leading-relaxed text-black'>
                        {t('Avec votre accord, nous mesurons la fréquentation du site avec Google Analytics et comptons les visites des fiches. Aucun cookie publicitaire, choix modifiable à tout moment.')}{' '}
                        <Link href='/confidentialite/#cookies' className='font-semibold text-secondary underline underline-offset-2 hover:text-primary'>
                            {t('En savoir plus')}
                        </Link>
                    </p>
                </div>

                {details && (
                    <ul className='flex flex-col divide-y divide-gray-100 rounded-xl border border-gray-200'>
                        <li className='flex items-start justify-between gap-4 p-4'>
                            <div className='flex flex-col gap-1'>
                                <p className='!text-sm font-semibold text-secondary'>{t('Nécessaire au fonctionnement')}</p>
                                <p className='!text-sm text-ink/70'>{t('Connexion, test d’orientation, stages enregistrés, votre choix sur ce bandeau. Sans eux, le site ne fonctionne pas.')}</p>
                            </div>
                            <span className='shrink-0 !text-sm font-semibold text-ink/50'>{t('Toujours actif')}</span>
                        </li>
                        <li className='flex items-start justify-between gap-4 p-4'>
                            <label htmlFor='consent-measure' className='flex flex-col gap-1 hover:cursor-pointer'>
                                <span className='!text-sm font-semibold text-secondary'>{t('Mesure d’audience anonyme')}</span>
                                <span className='!text-sm text-ink/70'>
                                    {t('Nombre de vues et de clics par fiche, envoyé à Edumada sans cookie ni donnée personnelle. Sert aux statistiques des établissements.')}
                                    {gpc && <> {t('Votre navigateur demande de ne pas partager vos données : cette mesure reste désactivée.')}</>}
                                </span>
                            </label>
                            <Switch id='consent-measure' checked={measure} disabled={gpc} onChange={setMeasure} />
                        </li>
                        <li className='flex items-start justify-between gap-4 p-4'>
                            <label htmlFor='consent-analytics' className='flex flex-col gap-1 hover:cursor-pointer'>
                                <span className='!text-sm font-semibold text-secondary'>{t('Statistiques de visite (Google Analytics)')}</span>
                                <span className='!text-sm text-ink/70'>
                                    {t('Pages vues, durée de visite, provenance (Google, Facebook…) et type d’appareil, pour améliorer le site. Google dépose deux cookies, gardés 13 mois au plus ; adresse IP non conservée, aucune publicité.')}
                                    {gpc && <> {t('Votre navigateur demande de ne pas partager vos données : cette mesure reste désactivée.')}</>}
                                </span>
                            </label>
                            <Switch id='consent-analytics' checked={analytics} disabled={gpc} onChange={setAnalytics} />
                        </li>
                    </ul>
                )}

                <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                    {details ? (
                        <button type='button' onClick={() => choose({ measure, analytics })} className={cn(BUTTON, 'bg-secondary text-white hover:bg-secondary/90')}>
                            {t('Enregistrer mes choix')}
                        </button>
                    ) : (
                        <div className='flex gap-3'>
                            {/* Refuser et accepter : même taille, même poids, côte à côte. */}
                            <button type='button' onClick={() => choose(NONE)} className={cn(BUTTON, 'bg-secondary text-white hover:bg-secondary/90')}>
                                {t('Tout refuser')}
                            </button>
                            <button type='button' onClick={() => choose(ALL)} className={cn(BUTTON, 'bg-primary text-white hover:bg-primary/90')}>
                                {t('Tout accepter')}
                            </button>
                        </div>
                    )}
                    <button
                        type='button'
                        aria-expanded={details}
                        onClick={() => setDetails((v) => !v)}
                        className='!text-sm font-semibold text-secondary underline underline-offset-4 decoration-secondary/40 hover:cursor-pointer hover:text-primary sm:ml-auto'>
                        {details ? t('Masquer le détail') : t('Personnaliser')}
                    </button>
                </div>
            </div>
        </section>
    )
}

/** Interrupteur accessible (bouton à bascule) d'un usage soumis à l'accord. */
function Switch({ id, checked, disabled, onChange }: { id: string; checked: boolean; disabled: boolean; onChange: (value: boolean) => void }) {
    return (
        <button
            id={id}
            type='button'
            role='switch'
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={cn(
                'relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-200 hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary disabled:cursor-not-allowed disabled:opacity-50',
                checked ? 'bg-secondary' : 'bg-gray-300'
            )}>
            <span className={cn('absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200', checked && 'translate-x-5')} />
        </button>
    )
}
