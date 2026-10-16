'use client'
import { Fragment } from 'react'
import { Icon } from '@/components/ui/icon'
import type { CategoryType } from '@/features/categories/types'
import { ADMISSION_LEVEL_LABEL, formatAgeRange, formatDate } from '@/features/formations/format'
import type { FormationType } from '@/features/formations/types'
import type { SchoolType } from '../types'

const STEPS = [
    { icon: 'tabler:list-check', title: 'Vérifiez les prérequis', text: "Âge, niveau ou prérequis demandés pour l'offre choisie." },
    { icon: 'tabler:folder', title: 'Préparez votre dossier', text: 'Rassemblez les pièces demandées ci-dessous.' },
    { icon: 'tabler:send', title: 'Déposez votre candidature', text: "Pendant la période d'inscription, auprès de l'établissement." },
    { icon: 'tabler:circle-check', title: 'Sélection et inscription', text: 'Étude du dossier, entretien ou concours selon la formation.' },
]

const seriesLabel = (f: FormationType) =>
    f.admission.level !== 'BAC' ? '—' : f.admission.bacSeries.length > 0 ? f.admission.bacSeries.join(', ') : 'Toutes'

const periodLabel = (f: FormationType) =>
    f.registrationPeriod ? `${formatDate(f.registrationPeriod.start)} → ${formatDate(f.registrationPeriod.end)}` : 'À confirmer'

/** Conditions d'admission de l'établissement : démarche, prérequis par formation et pièces du dossier. */
export function SchoolAdmission({
    school,
    formations,
    fields,
}: {
    school: SchoolType
    formations: FormationType[]
    fields: CategoryType['fields']
}) {
    // Seules les colonnes pertinentes pour la catégorie (et renseignées) sont affichées.
    const columns: { label: string; value: (f: FormationType) => string }[] = [
        ...(fields.level ? [{ label: 'Niveau requis', value: (f: FormationType) => ADMISSION_LEVEL_LABEL[f.admission.level] }] : []),
        ...(fields.level && formations.some((f) => f.admission.level === 'BAC') ? [{ label: 'Séries du BAC', value: seriesLabel }] : []),
        ...(fields.childAge && formations.some((f) => f.ageRange) ? [{ label: 'Âge', value: (f: FormationType) => (f.ageRange ? formatAgeRange(f.ageRange) : '—') }] : []),
        { label: 'Sélection', value: (f: FormationType) => f.admission.selection },
        { label: 'Inscriptions', value: periodLabel },
    ]

    return (
        <div className='flex flex-col gap-6'>
            {/* Démarche */}
            <ol className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3'>
                {STEPS.map((step, i) => (
                    <li key={step.title} className='relative rounded-xl border border-gray-100 bg-white p-4'>
                        <span className='absolute top-3 right-4 text-3xl font-bold text-secondary/10'>{i + 1}</span>
                        <Icon icon={step.icon} className='mb-2 text-2xl text-primary' />
                        <p className='font-semibold text-secondary'>{step.title}</p>
                        <span className='text-sm text-ink/70'>{step.text}</span>
                    </li>
                ))}
            </ol>

            {/* Prérequis par offre : tableau sur grand écran, cartes sur mobile. Colonnes selon la catégorie. */}
            <div className='hidden md:block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
                <table className='w-full text-left text-sm'>
                    <thead className='bg-secondary/5 text-secondary'>
                        <tr>
                            <th scope='col' className='px-4 py-3 font-semibold'>Offre</th>
                            {columns.map((col) => (
                                <th key={col.label} scope='col' className='px-4 py-3 font-semibold'>{col.label}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-100 text-ink/80'>
                        {formations.map((f) => (
                            <tr key={f.id}>
                                <th scope='row' className='px-4 py-3 font-semibold text-ink'>
                                    <a href={`#${f.id}`} className='hover:text-primary'>{f.title}</a>
                                </th>
                                {columns.map((col) => (
                                    <td key={col.label} className='px-4 py-3'>{col.value(f)}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className='flex flex-col gap-3 md:hidden'>
                {formations.map((f) => (
                    <div key={f.id} className='rounded-xl border border-gray-100 bg-white p-4 text-sm'>
                        <a href={`#${f.id}`} className='mb-2 block py-1 font-semibold text-secondary'>{f.title}</a>
                        <dl className='grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-ink/80'>
                            {columns.map((col) => (
                                <Fragment key={col.label}>
                                    <dt className='text-ink/60'>{col.label}</dt>
                                    <dd>{col.value(f)}</dd>
                                </Fragment>
                            ))}
                        </dl>
                    </div>
                ))}
            </div>
            {/* Pièces du dossier */}
            <div className='rounded-2xl bg-secondary/[0.06] p-6'>
                <p className='mb-3 font-semibold text-secondary'>Pièces à fournir</p>
                <ul className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2'>
                    {school.admissionDocuments.map((doc) => (
                        <li key={doc} className='flex items-start gap-2 text-ink/80'>
                            <Icon icon='tabler:circle-check-filled' className='mt-0.5 shrink-0 text-lg text-primary' />
                            {doc}
                        </li>
                    ))}
                </ul>
                <p className='mt-4 text-sm text-ink/60'>
                    La liste peut varier selon la formation : confirmez-la auprès de l&apos;établissement avant de déposer votre dossier.
                </p>
            </div>
        </div>
    )
}

export default SchoolAdmission
