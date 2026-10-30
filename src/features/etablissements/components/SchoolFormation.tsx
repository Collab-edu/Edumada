'use client'
import Image from 'next/image'
import { imageOr } from '@/lib/media'
import Link, { useT } from '@/i18n/client'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import { formatAgeRange, formatTuition, offerFacts } from '@/features/formations/format'
import type { FormationType, RegistrationStatus } from '@/features/formations/types'

const REGISTRATION_BADGE: Record<RegistrationStatus, { label: string; className: string }> = {
    Ouvertes: { label: 'Inscriptions ouvertes', className: 'bg-success/30 text-secondary' },
    'À venir': { label: 'Inscriptions à venir', className: 'bg-cream text-primary' },
    Fermées: { label: 'Inscriptions fermées', className: 'bg-gray-100 text-ink/60' },
}

/** Formation proposée par l'établissement : résumé et lien vers sa page. */
export function SchoolFormation({ formation }: { formation: FormationType }) {
    const t = useT()
    const badge = REGISTRATION_BADGE[formation.registration]
    const tuition = formatTuition(formation)

    return (
        <article
            id={formation.id}
            className='scroll-mt-28 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-colors duration-300 hover:border-primary/30'>
            {/* Résumé */}
            <div className='flex flex-col'>
                <div className='relative h-40 shrink-0 bg-cream'>
                    <Image src={imageOr(formation.imageSrc)} alt={formation.title} fill className='object-cover' />
                </div>
                <div className='flex flex-1 flex-col gap-3 p-5'>
                    <div className='flex flex-wrap items-center gap-2'>
                        <span className={cn('rounded-full px-3 py-1 text-xs font-semibold', badge.className)}>{t(badge.label)}</span>
                        {(formation.diploma || formation.ageRange) && (
                            <span className='rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary'>
                                {formation.diploma ?? formatAgeRange(formation.ageRange!)}
                            </span>
                        )}
                    </div>
                    <h3 className='text-lg font-semibold leading-snug text-secondary'>{formation.title}</h3>
                    <ul className='flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink/70'>
                        {offerFacts(formation)
                            .filter((fact) => fact.label !== formation.diploma)
                            .map((fact) => (
                                <li key={fact.label} className='inline-flex items-center gap-1.5'>
                                    <Icon icon={fact.icon} className='text-secondary' /> {fact.label}
                                </li>
                            ))}
                        <li className='inline-flex items-center gap-1.5'>
                            <Icon icon='tabler:device-laptop' className='text-secondary' /> {formation.modality}
                        </li>
                        <li className='inline-flex items-center gap-1.5'>
                            <Icon icon='tabler:coin' className='text-secondary' /> {tuition ? t(tuition) : t('Frais non renseignés')}
                        </li>
                    </ul>
                    <div className='mt-auto pt-1'>
                        <Link
                            href={`/formations/${formation.id}`}
                            className='inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 font-semibold text-white transition-colors duration-300 hover:bg-primary/90'>
                            Voir la formation
                            <Icon icon='tabler:arrow-right' />
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    )
}

export default SchoolFormation
