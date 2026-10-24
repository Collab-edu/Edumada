'use client'
import { useState } from 'react'
import Image from 'next/image'
import { imageOr } from '@/lib/media'
import { track } from '@/lib/track'
import Link, { useT } from '@/i18n/client'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import type { SchoolType } from '@/features/etablissements/types'
import { formatDate, formatTuition, offerFacts } from '../../format'
import type { FormationDetailType, FormationType, RegistrationStatus } from '../../types'
import SchoolLogo from '@/features/etablissements/components/SchoolLogo'

export const REGISTRATION_BADGE: Record<RegistrationStatus, { label: string; className: string }> = {
    Ouvertes: { label: 'Inscriptions ouvertes', className: 'bg-success/30 text-secondary' },
    'À venir': { label: 'Inscriptions bientôt ouvertes', className: 'bg-cream text-primary' },
    Fermées: { label: 'Inscriptions fermées', className: 'bg-gray-100 text-ink/60' },
}

interface FormationHeroProps {
    formation: FormationType
    detail: FormationDetailType
    school: SchoolType
    isFavorite: boolean
    onToggleFavorite: () => void
    onContact: () => void
    onApply: () => void
}

/** Haut de page : informations principales et actions. */
export function FormationHero({ formation, detail, school, isFavorite, onToggleFavorite, onContact, onApply }: FormationHeroProps) {
    const t = useT()
    const [copied, setCopied] = useState(false)
    const badge = REGISTRATION_BADGE[formation.registration]
    const tuition = formatTuition(formation)

    const share = async () => {
        const data = { title: `${formation.title} — ${school.name}`, url: window.location.href }
        try {
            if (navigator.share) {
                await navigator.share(data)
            } else {
                await navigator.clipboard.writeText(data.url)
                setCopied(true)
                setTimeout(() => setCopied(false), 2500)
            }
        } catch {
            // Partage annulé par l'utilisateur : rien à faire.
        }
    }

    const facts = [
        { icon: 'tabler:map-pin', label: formation.city },
        // Public / privé : affiché seulement quand l'établissement l'a précisé.
        ...(formation.schoolType ? [{ icon: 'tabler:building-community', label: t(`Établissement ${formation.schoolType.toLowerCase()}`) }] : []),
        ...offerFacts(formation),
        { icon: 'tabler:coin', label: tuition ? t(tuition) : t('Frais non communiqués') },
    ]

    return (
        <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
            <div className='grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px]'>
                <div className='flex flex-col gap-5 p-6 md:p-8'>
                    <div className='flex items-center gap-4'>
                        <SchoolLogo name={school.name} initials={school.initials} logo={school.logo} className='h-14 w-14 rounded-xl text-sm shadow-md ring-4 ring-white' />
                        <div className='flex flex-col'>
                            <Link href={`/etablissements/${school.id}`} className='font-semibold text-secondary hover:text-primary hover:underline'>
                                {school.name}
                            </Link>
                            <span className={cn('mt-1 w-fit rounded-full px-3 py-1 text-xs font-semibold', badge.className)}>
                                {t(badge.label)}
                                {formation.registrationPeriod && formation.registration !== 'Fermées' && (
                                    <> · {t('jusqu’au {date}', { date: t(formatDate(formation.registrationPeriod.end)) })}</>
                                )}
                            </span>
                        </div>
                    </div>

                    <h1 className='text-3xl md:text-4xl font-bold leading-tight text-secondary'>{formation.title}</h1>

                    <ul className='flex flex-wrap gap-2'>
                        {facts.map((fact) => (
                            <li key={fact.label} className='inline-flex items-center gap-1.5 rounded-full bg-offwhite px-3 py-1.5 text-sm text-ink/80'>
                                <Icon icon={fact.icon} className='text-secondary' />
                                {t(fact.label)}
                            </li>
                        ))}
                    </ul>

                    {/* Actions principales : pleine largeur sur mobile, en ligne sur grand écran */}
                    <div className='grid grid-cols-1 sm:flex sm:flex-wrap sm:items-center gap-3 [&>*]:justify-center sm:[&>*]:justify-start'>
                        {detail.onlineApplication ? (
                            <Link
                                href={`/candidature/?offre=${formation.id}`}
                                onClick={onApply}
                                className='inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white shadow-lg shadow-primary/30 transition-all duration-300 hover:bg-primary/90 hover:-translate-y-0.5'>
                                <Icon icon='tabler:send' className='text-lg' /> {t('Postuler maintenant')}
                            </Link>
                        ) : null}
                        <button
                            type='button'
                            onClick={onContact}
                            className={cn(
                                'inline-flex items-center gap-2 rounded-xl px-6 py-3 font-bold transition-colors duration-300 hover:cursor-pointer',
                                detail.onlineApplication
                                    ? 'border border-secondary/20 text-secondary hover:border-primary hover:text-primary'
                                    : 'bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90'
                            )}>
                            <Icon icon='tabler:message-circle' className='text-lg' /> {t('Contacter l’établissement')}
                        </button>
                        <button
                            type='button'
                            onClick={onToggleFavorite}
                            aria-pressed={isFavorite}
                            className='inline-flex items-center gap-2 rounded-xl border border-secondary/20 px-4 py-3 font-semibold text-secondary transition-colors duration-300 hover:border-primary hover:text-primary hover:cursor-pointer'>
                            <Icon icon={isFavorite ? 'tabler:heart-filled' : 'tabler:heart'} className={cn('text-lg', isFavorite && 'text-primary')} />
                            {isFavorite ? 'Dans mes favoris' : 'Ajouter aux favoris'}
                        </button>
                        {school.website && (
                            <a
                                href={school.website}
                                target='_blank'
                                rel='noopener noreferrer'
                                onClick={() => track({ type: 'website_click', establishment: school.id, offer: formation.id })}
                                className='inline-flex items-center gap-2 px-2 py-3 font-semibold text-secondary hover:text-primary'>
                                <Icon icon='tabler:world' className='text-lg' /> {t('Site de l’établissement')}
                            </a>
                        )}
                        <button
                            type='button'
                            onClick={share}
                            className='inline-flex items-center gap-2 px-2 py-3 font-semibold text-secondary hover:text-primary hover:cursor-pointer'>
                            <Icon icon={copied ? 'tabler:check' : 'tabler:share'} className='text-lg' />
                            {copied ? t('Lien copié') : t('Partager')}
                        </button>
                    </div>

                    <p className='flex items-center gap-1.5 text-sm text-ink/60'>
                        <Icon icon='tabler:shield-check' className='text-success' />
                        {t('Informations vérifiées par Edumada le {date}', { date: t(formatDate(detail.lastVerified)) })}
                    </p>
                </div>

                <div className='relative hidden lg:block min-h-full bg-cream'>
                    <Image src={imageOr(formation.imageSrc)} alt={formation.title} fill priority className='object-cover' />
                </div>
            </div>
        </div>
    )
}

export default FormationHero
