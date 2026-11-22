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
            {/* Étapes en cartes : numéro en haut à gauche, icône centrée sur un double rond rose, titre et trait rouge en dessous. */}
            <ol className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5'>
                {steps.map((step, i) => (
                    <li
                        key={step.title}
                        className='relative flex flex-col rounded-2xl bg-white p-4 shadow-[0_10px_24px_-14px_rgba(15,23,42,0.19)] ring-1 ring-gray-100'>
                        <span className='absolute top-3 left-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-base font-extrabold text-white'>
                            {i + 1}
                        </span>
                        <span className='relative mx-auto mt-3 flex h-14 w-16 items-center justify-center' aria-hidden='true'>
                            <span className='absolute top-1 left-0 h-12 w-12 rounded-full bg-primary/10' />
                            <span className='absolute top-1 right-0 h-12 w-12 rounded-full bg-primary/10' />
                            <Icon icon={step.icon} className='relative text-4xl text-secondary' />
                        </span>
                        {step.href ? (
                            <a href={step.href} className='mt-3 text-sm font-extrabold leading-snug text-secondary hover:text-primary'>
                                {t(step.title)}
                            </a>
                        ) : (
                            <span className='mt-3 text-sm font-extrabold leading-snug text-secondary'>{t(step.title)}</span>
                        )}
                        <span className='mt-3 h-1 w-10 rounded-full bg-primary' aria-hidden='true' />
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
                        <a href={detail.brochureUrl} download target='_blank' rel='noopener noreferrer' className='inline-flex shrink-0 items-center gap-2 rounded-lg border border-primary px-4 py-2 font-semibold text-primary hover:bg-primary hover:text-white'>
                            <Icon icon='tabler:download' className='text-lg' aria-hidden='true' />
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
