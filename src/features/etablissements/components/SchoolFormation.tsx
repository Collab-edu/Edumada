'use client'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import { cn } from '@/lib/utils'
import { formatDate, formatDuration, formatFees } from '@/features/formations/format'
import type { AdmissionLevel, FormationType, RegistrationStatus } from '@/features/formations/types'

const REGISTRATION_BADGE: Record<RegistrationStatus, { label: string; className: string }> = {
    Ouvertes: { label: 'Inscriptions ouvertes', className: 'bg-success/30 text-secondary' },
    'À venir': { label: 'Inscriptions à venir', className: 'bg-cream text-primary' },
    Fermées: { label: 'Inscriptions fermées', className: 'bg-gray-100 text-ink/60' },
}

const ADMISSION_LABEL: Record<AdmissionLevel, string> = {
    Aucun: 'Aucun diplôme requis',
    BAC: 'Baccalauréat',
    'BAC+2': 'BAC+2 (BTS, DTS…)',
    'BAC+3': 'BAC+3 (Licence)',
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

/** Fiche détaillée d'une formation, telle qu'affichée sur le profil d'un établissement. */
export function SchoolFormation({ formation }: { formation: FormationType }) {
    const badge = REGISTRATION_BADGE[formation.registration]
    const { level, bacSeries } = formation.admission

    return (
        <article id={formation.id} className='scroll-mt-28 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
            <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5'>
                <div className='flex flex-col gap-2'>
                    <span className={cn('w-fit rounded-full px-3 py-1 text-xs font-semibold', badge.className)}>
                        {badge.label}
                    </span>
                    <h3 className='text-xl font-semibold text-secondary'>{formation.title}</h3>
                    <span className='text-ink/60'>{formation.domain}</span>
                </div>
                <Link
                    href={`/recherche?q=${encodeURIComponent(formation.title)}`}
                    className='shrink-0 rounded-lg border border-primary px-4 py-2 text-center font-semibold text-primary transition-colors duration-300 hover:bg-primary hover:text-white'>
                    Comparer
                </Link>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4'>
                <Detail icon='tabler:certificate' label='Diplôme obtenu'>{formation.diploma}</Detail>
                <Detail icon='tabler:clock' label='Durée'>{formatDuration(formation.durationYears)}</Detail>
                <Detail icon='tabler:device-laptop' label='Modalité de formation'>{formation.modality}</Detail>
                <Detail icon='tabler:language' label="Langues d'enseignement">{formation.languages.join(', ')}</Detail>
                <Detail icon='tabler:receipt' label="Frais d'inscription">
                    {formatFees(formation.registrationFee) ?? 'Non renseignés'}
                </Detail>
                <Detail icon='tabler:coin' label='Frais de scolarité'>
                    {formatFees(formation.fees) ? `${formatFees(formation.fees)} / an` : 'Non renseignés'}
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
                    <li>Niveau requis : {ADMISSION_LABEL[level]}</li>
                    {level === 'BAC' && (
                        <li>Séries du BAC acceptées : {bacSeries.length > 0 ? bacSeries.join(', ') : 'toutes les séries'}</li>
                    )}
                </ul>
            </div>
        </article>
    )
}

export default SchoolFormation
