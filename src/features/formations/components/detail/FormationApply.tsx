'use client'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import SchoolFaq from '@/features/etablissements/components/SchoolFaq'
import type { FaqItem } from '@/features/etablissements/faq'
import type { SchoolType } from '@/features/etablissements/types'
import { formatDate } from '../../format'
import type { FormationDetailType, FormationType } from '../../types'
import { DetailSection, Panel, SubTitle } from './parts'

type Props = { formation: FormationType; detail: FormationDetailType; school: SchoolType; onContact: () => void; onApply: () => void }

/* 9. Comment postuler ? */
export function ApplySection({ formation, detail, school, onContact, onApply }: Props) {
    const steps = [
        { title: "Vérifiez les conditions d'admission", href: '#admission' },
        { title: 'Préparez les documents demandés', href: '#admission' },
        { title: detail.onlineApplication ? 'Démarrez votre candidature en ligne' : "Contactez l'établissement", href: detail.onlineApplication ? undefined : '#etablissement' },
        { title: 'Soumettez votre dossier selon la procédure indiquée' },
        { title: detail.onlineApplication ? 'Suivez la réponse depuis votre espace Edumada' : "Suivez la réponse de l'établissement" },
    ]

    return (
        <DetailSection id='postuler' title='Comment postuler ?' icon='tabler:send'>
            <ol className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3'>
                {steps.map((step, i) => (
                    <li key={step.title} className='flex flex-col gap-2 rounded-xl border border-gray-100 bg-white p-4'>
                        <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bold text-white'>{i + 1}</span>
                        {step.href ? (
                            <a href={step.href} className='font-medium text-secondary hover:text-primary hover:underline'>{step.title}</a>
                        ) : (
                            <span className='font-medium text-secondary'>{step.title}</span>
                        )}
                    </li>
                ))}
            </ol>

            <div className='flex flex-col md:flex-row md:items-center justify-between gap-5 rounded-2xl bg-secondary p-6 text-white'>
                <div className='flex flex-col gap-1'>
                    <p className='text-lg font-bold'>
                        {detail.onlineApplication ? 'Candidature en ligne disponible' : 'Candidature auprès de l’établissement'}
                    </p>
                    <span className='text-white/80'>
                        {detail.onlineApplication
                            ? 'Créez votre compte, remplissez le formulaire et suivez le statut de votre dossier depuis votre espace.'
                            : `Contactez ${school.name} pour recevoir le dossier de candidature.`}
                        {formation.registrationPeriod && formation.registration !== 'Fermées' && (
                            <> Date limite : {formatDate(formation.registrationPeriod.end)}.</>
                        )}
                    </span>
                </div>
                {detail.onlineApplication ? (
                    <Link
                        href={`/candidature/?offre=${formation.id}`}
                        onClick={onApply}
                        className='inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white transition-colors duration-300 hover:bg-white hover:text-primary'>
                        <Icon icon='tabler:send' /> Postuler maintenant
                    </Link>
                ) : (
                    <button
                        type='button'
                        onClick={onContact}
                        className='inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white transition-colors duration-300 hover:bg-white hover:text-primary hover:cursor-pointer'>
                        <Icon icon='tabler:message-circle' /> Contacter l&apos;établissement
                    </button>
                )}
            </div>
        </DetailSection>
    )
}

/* 10. Informations complémentaires */
export function ExtraInfoSection({ detail, faq, onReport }: { detail: FormationDetailType; faq: FaqItem[]; onReport: () => void }) {
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
                        <a href={detail.brochureUrl} download className='rounded-lg border border-primary px-4 py-2 font-semibold text-primary hover:bg-primary hover:text-white'>
                            Télécharger
                        </a>
                    ) : null}
                </Panel>
                <Panel className='flex items-center gap-3'>
                    <Icon icon='tabler:shield-check' className='text-3xl text-success' />
                    <div className='flex flex-col'>
                        <span className='font-semibold text-secondary'>Dernière vérification</span>
                        <span className='text-sm text-ink/60'>
                            Informations vérifiées par Edumada le {formatDate(detail.lastVerified)}
                        </span>
                        <button type='button' onClick={onReport} className='mt-1 w-fit text-sm font-semibold text-primary hover:underline hover:cursor-pointer'>
                            Signaler une information erronée
                        </button>
                    </div>
                </Panel>
            </div>
            <div>
                <SubTitle>Questions fréquentes</SubTitle>
                <SchoolFaq items={faq} />
            </div>
        </DetailSection>
    )
}
