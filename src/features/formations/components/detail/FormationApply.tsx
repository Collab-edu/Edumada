'use client'
import Link, { useT } from '@/i18n/client'
import { Icon } from '@/components/ui/icon'
import SchoolFaq from '@/features/etablissements/components/SchoolFaq'
import type { FaqItem } from '@/features/etablissements/faq'
import type { SchoolType } from '@/features/etablissements/types'
import { formatDate } from '../../format'
import type { FormationDetailType, FormationType } from '../../types'
import { DetailSection, Panel } from './parts'

type Props = { formation: FormationType; detail: FormationDetailType; school: SchoolType; onContact: () => void; onApply: () => void }

/* 10. Comment postuler ? (dernière section, après les informations complémentaires) */
export function ApplySection({ formation, detail, school, onContact, onApply }: Props) {
    const t = useT()
    const steps: { title: string; icon: string; href?: string }[] = [
        { title: "Vérifiez les conditions d'admission", icon: 'tabler:clipboard-check', href: '#admission' },
        { title: 'Préparez les documents demandés', icon: 'tabler:file-text', href: '#admission' },
        detail.onlineApplication
            ? { title: 'Démarrez votre candidature en ligne', icon: 'tabler:device-laptop' }
            : { title: "Contactez l'établissement", icon: 'tabler:message-circle', href: '#etablissement' },
        { title: 'Soumettez votre dossier selon la procédure indiquée', icon: 'tabler:folder-up' },
        { title: detail.onlineApplication ? 'Suivez la réponse depuis votre espace Edumada' : "Suivez la réponse de l'établissement", icon: 'tabler:calendar-check' },
    ]

    return (
        <DetailSection id='postuler' title='Comment postuler ?' icon='tabler:send'>
            {/* Étapes en cartes : empilées et compactes sur mobile, sur une ligne reliée par des flèches sur grand écran. */}
            <ol className='grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2 lg:grid-cols-5 lg:gap-5'>
                {steps.map((step, i) => (
                    <li
                        key={step.title}
                        className='relative flex items-center gap-3 rounded-xl bg-white p-3 pl-5 shadow-[0_8px_20px_-12px_rgba(15,76,92,0.3)] ring-1 ring-gray-100 lg:flex-col lg:items-start lg:gap-2 lg:p-3 lg:pt-5'>
                        <span className='absolute -top-2.5 -left-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow'>
                            {i + 1}
                        </span>
                        <span className='relative flex h-10 w-10 shrink-0 items-center justify-center lg:mx-auto' aria-hidden='true'>
                            <span className='absolute inset-0 translate-x-1.5 rounded-full bg-primary/10' />
                            <Icon icon={step.icon} className='relative text-2xl text-secondary' />
                        </span>
                        <div className='flex min-w-0 flex-col'>
                            {step.href ? (
                                <a href={step.href} className='text-sm font-bold leading-snug text-secondary hover:text-primary'>
                                    {t(step.title)}
                                </a>
                            ) : (
                                <span className='text-sm font-bold leading-snug text-secondary'>{t(step.title)}</span>
                            )}
                            <span className='mt-1.5 h-0.5 w-8 rounded-full bg-primary' aria-hidden='true' />
                        </div>
                        {i < steps.length - 1 && (
                            <span
                                className='absolute top-1/2 -right-[17px] z-10 hidden h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white ring-2 ring-offwhite lg:flex'
                                aria-hidden='true'>
                                <Icon icon='tabler:chevron-right' className='text-xs' />
                            </span>
                        )}
                    </li>
                ))}
            </ol>

            <div className='flex flex-col md:flex-row md:items-center justify-between gap-5 rounded-xl bg-secondary p-6 text-white'>
                <div className='flex flex-col gap-1'>
                    <p className='text-lg font-bold'>
                        {detail.onlineApplication ? t('Candidature en ligne disponible') : t('Candidature auprès de l’établissement')}
                    </p>
                    <span className='text-white/80'>
                        {detail.onlineApplication
                            ? t('Créez votre compte, remplissez le formulaire et suivez le statut de votre dossier depuis votre espace.')
                            : t('Contactez {school} pour recevoir le dossier de candidature.', { school: school.name })}
                        {formation.registrationPeriod && formation.registration !== 'Fermées' && (
                            <> {t('Date limite :')} {t(formatDate(formation.registrationPeriod.end))}.</>
                        )}
                    </span>
                </div>
                {detail.onlineApplication ? (
                    <Link
                        href={`/candidature/?offre=${formation.id}`}
                        onClick={onApply}
                        className='inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white transition-colors duration-300 hover:bg-white hover:text-primary'>
                        <Icon icon='tabler:send' /> {t('Postuler maintenant')}
                    </Link>
                ) : (
                    <button
                        type='button'
                        onClick={onContact}
                        className='inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white transition-colors duration-300 hover:bg-white hover:text-primary hover:cursor-pointer'>
                        <Icon icon='tabler:message-circle' /> {t('Contacter l’établissement')}
                    </button>
                )}
            </div>
        </DetailSection>
    )
}

/* 9. Informations complémentaires */
export function ExtraInfoSection({ detail, onReport }: { detail: FormationDetailType; onReport: () => void }) {
    const t = useT()
    return (
        <DetailSection id='infos' title='Informations complémentaires' icon='tabler:file-description'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                <Panel className='flex items-center justify-between gap-4'>
                    <div className='flex items-center gap-3'>
                        <Icon icon='tabler:file-type-pdf' className='text-3xl text-primary' />
                        <div className='flex flex-col'>
                            <span className='font-semibold text-secondary'>Brochure de la formation</span>
                            <span className='text-sm text-ink/60'>{detail.brochureUrl ? 'PDF' : 'Pas encore disponible'}</span>
                        </div>
                    </div>
                    {detail.brochureUrl ? (
                        <a href={detail.brochureUrl} download target='_blank' rel='noopener noreferrer' className='rounded-lg border border-primary px-4 py-2 font-semibold text-primary hover:bg-primary hover:text-white'>
                            {t('Télécharger')}
                        </a>
                    ) : null}
                </Panel>
                <Panel className='flex items-center gap-3'>
                    <Icon icon='tabler:shield-check' className='text-3xl text-success' />
                    <div className='flex flex-col'>
                        <span className='font-semibold text-secondary'>{t('Dernière vérification')}</span>
                        <span className='text-sm text-ink/60'>
                            {t('Informations vérifiées par Edumada le {date}', { date: t(formatDate(detail.lastVerified)) })}
                        </span>
                        <button type='button' onClick={onReport} className='mt-1 w-fit text-sm font-semibold text-primary hover:underline hover:cursor-pointer'>
                            {t('Signaler une information erronée')}
                        </button>
                    </div>
                </Panel>
            </div>
        </DetailSection>
    )
}

/* 11. Questions fréquentes (dernière section de la fiche) */
export function FaqSection({ faq }: { faq: FaqItem[] }) {
    if (faq.length === 0) return null
    return (
        <DetailSection id='faq' title='Questions fréquentes' icon='tabler:help-circle'>
            <SchoolFaq items={faq} />
        </DetailSection>
    )
}
