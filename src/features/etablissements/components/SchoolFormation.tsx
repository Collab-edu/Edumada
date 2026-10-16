'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import { cn } from '@/lib/utils'
import { ADMISSION_LEVEL_LABEL, formatDate, formatDuration, formatFees } from '@/features/formations/format'
import type { FormationType, RegistrationStatus } from '@/features/formations/types'

const REGISTRATION_BADGE: Record<RegistrationStatus, { label: string; className: string }> = {
    Ouvertes: { label: 'Inscriptions ouvertes', className: 'bg-success/30 text-secondary' },
    'À venir': { label: 'Inscriptions à venir', className: 'bg-cream text-primary' },
    Fermées: { label: 'Inscriptions fermées', className: 'bg-gray-100 text-ink/60' },
}

function Detail({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
    return (
        <div className='flex gap-3'>
            <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary'>
                <Icon icon={icon} className='text-lg' />
            </span>
            <div className='flex flex-col'>
                <span className='text-sm text-ink/60'>{label}</span>
                <span className='font-medium text-ink'>{children}</span>
            </div>
        </div>
    )
}

/**
 * Formation proposée par l'établissement : résumé toujours visible, détail dépliable.
 * S'ouvre automatiquement quand l'URL vise cette formation (…#id-de-la-formation).
 */
export function SchoolFormation({ formation }: { formation: FormationType }) {
    const [open, setOpen] = useState(false)
    const badge = REGISTRATION_BADGE[formation.registration]
    const { level, bacSeries } = formation.admission
    const fees = formatFees(formation.fees)
    const detailsId = `${formation.id}-details`

    useEffect(() => {
        const openIfTargeted = () => {
            if (window.location.hash === `#${formation.id}`) setOpen(true)
        }
        openIfTargeted()
        window.addEventListener('hashchange', openIfTargeted)
        return () => window.removeEventListener('hashchange', openIfTargeted)
    }, [formation.id])

    return (
        <article
            id={formation.id}
            className={cn(
                'scroll-mt-28 overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors duration-300',
                open ? 'border-primary/30' : 'border-gray-100 hover:border-primary/30'
            )}>
            {/* Résumé */}
            <div className='flex flex-col'>
                <div className='relative h-40 shrink-0 bg-cream'>
                    <Image src={formation.imageSrc} alt={formation.title} fill className='object-cover' />
                </div>
                <div className='flex flex-1 flex-col gap-3 p-5'>
                    <div className='flex flex-wrap items-center gap-2'>
                        <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', badge.className)}>{badge.label}</span>
                        <span className='rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary'>
                            {formation.diploma}
                        </span>
                    </div>
                    <h3 className='text-lg font-semibold leading-snug text-secondary'>{formation.title}</h3>
                    <ul className='flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink/70'>
                        <li className='inline-flex items-center gap-1.5'>
                            <Icon icon='tabler:clock' className='text-secondary' /> {formatDuration(formation.durationYears)}
                        </li>
                        <li className='inline-flex items-center gap-1.5'>
                            <Icon icon='tabler:device-laptop' className='text-secondary' /> {formation.modality}
                        </li>
                        <li className='inline-flex items-center gap-1.5'>
                            <Icon icon='tabler:coin' className='text-secondary' /> {fees ? `${fees} / an` : 'Frais non renseignés'}
                        </li>
                    </ul>
                    <div className='mt-auto flex flex-wrap items-center gap-3 pt-1'>
                        <button
                            type='button'
                            onClick={() => setOpen(!open)}
                            aria-expanded={open}
                            aria-controls={detailsId}
                            className='inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 font-semibold text-white transition-colors duration-300 hover:bg-primary/90 hover:cursor-pointer'>
                            {open ? 'Masquer le détail' : 'Voir le détail'}
                            <Icon icon='tabler:chevron-down' className={cn('transition-transform duration-200', open && 'rotate-180')} />
                        </button>
                        <Link
                            href={`/formations/${formation.id}`}
                            className='font-semibold text-secondary underline underline-offset-4 decoration-secondary/30 hover:text-primary hover:decoration-primary'>
                            Fiche complète
                        </Link>
                    </div>
                </div>
            </div>

            {/* Détail */}
            {open && (
                <div id={detailsId} className='border-t border-gray-100 p-5'>
                    <div className='grid grid-cols-1 gap-y-4'>
                        <Detail icon='tabler:certificate' label='Diplôme obtenu'>{formation.diploma}</Detail>
                        <Detail icon='tabler:clock' label='Durée'>{formatDuration(formation.durationYears)}</Detail>
                        <Detail icon='tabler:device-laptop' label='Modalité de formation'>{formation.modality}</Detail>
                        <Detail icon='tabler:language' label="Langues d'enseignement">{formation.languages.join(', ')}</Detail>
                        <Detail icon='tabler:receipt' label="Frais d'inscription">
                            {formatFees(formation.registrationFee) ?? 'Non renseignés'}
                        </Detail>
                        <Detail icon='tabler:coin' label='Frais de scolarité'>
                            {fees ? `${fees} / an` : 'Non renseignés'}
                        </Detail>
                        <Detail icon='tabler:calendar-event' label="Dates d'inscription">
                            {formation.registrationPeriod
                                ? `Du ${formatDate(formation.registrationPeriod.start)} au ${formatDate(formation.registrationPeriod.end)}`
                                : 'Non communiquées'}
                        </Detail>
                        <Detail icon='tabler:calendar-star' label='Date de rentrée'>
                            {formation.startDate ? formatDate(formation.startDate) : 'Non communiquée'}
                        </Detail>
                    </div>

                    <div className='mt-5 rounded-xl bg-offwhite p-4'>
                        <p className='mb-1 font-semibold text-secondary'>Conditions d&apos;admission</p>
                        <ul className='flex flex-col gap-1 text-ink/80'>
                            <li>Niveau requis : {ADMISSION_LEVEL_LABEL[level]}</li>
                            <li>Sélection : {formation.admission.selection}</li>
                            {level === 'BAC' && (
                                <li>Séries du BAC acceptées : {bacSeries.length > 0 ? bacSeries.join(', ') : 'toutes les séries'}</li>
                            )}
                        </ul>
                    </div>
                </div>
            )}
        </article>
    )
}

export default SchoolFormation
