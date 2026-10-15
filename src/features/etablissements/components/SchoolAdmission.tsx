'use client'
import { Icon } from '@iconify/react/dist/iconify.js'
import { ADMISSION_LEVEL_LABEL, formatDate } from '@/features/formations/format'
import type { FormationType } from '@/features/formations/types'
import type { SchoolType } from '../types'

const STEPS = [
    { icon: 'tabler:list-check', title: 'Vérifiez les prérequis', text: 'Niveau requis et séries du BAC acceptées pour la formation choisie.' },
    { icon: 'tabler:folder', title: 'Préparez votre dossier', text: 'Rassemblez les pièces demandées ci-dessous.' },
    { icon: 'tabler:send', title: 'Déposez votre candidature', text: "Pendant la période d'inscription, auprès de l'établissement." },
    { icon: 'tabler:circle-check', title: 'Sélection et inscription', text: 'Étude du dossier, entretien ou concours selon la formation.' },
]

const seriesLabel = (f: FormationType) =>
    f.admission.level !== 'BAC' ? '—' : f.admission.bacSeries.length > 0 ? f.admission.bacSeries.join(', ') : 'Toutes'

const periodLabel = (f: FormationType) =>
    f.registrationPeriod ? `${formatDate(f.registrationPeriod.start)} → ${formatDate(f.registrationPeriod.end)}` : 'À confirmer'

/** Conditions d'admission de l'établissement : démarche, prérequis par formation et pièces du dossier. */
export function SchoolAdmission({ school, formations }: { school: SchoolType; formations: FormationType[] }) {
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

            {/* Prérequis par formation : tableau sur grand écran, cartes sur mobile */}
            <div className='hidden md:block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
                <table className='w-full text-left text-sm'>
                    <thead className='bg-secondary/5 text-secondary'>
                        <tr>
                            <th scope='col' className='px-4 py-3 font-semibold'>Formation</th>
                            <th scope='col' className='px-4 py-3 font-semibold'>Niveau requis</th>
                            <th scope='col' className='px-4 py-3 font-semibold'>Séries du BAC</th>
                            <th scope='col' className='px-4 py-3 font-semibold'>Sélection</th>
                            <th scope='col' className='px-4 py-3 font-semibold'>Candidatures</th>
                        </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-100 text-ink/80'>
                        {formations.map((f) => (
                            <tr key={f.id}>
                                <th scope='row' className='px-4 py-3 font-semibold text-ink'>
                                    <a href={`#${f.id}`} className='hover:text-primary'>{f.title}</a>
                                </th>
                                <td className='px-4 py-3'>{ADMISSION_LEVEL_LABEL[f.admission.level]}</td>
                                <td className='px-4 py-3'>{seriesLabel(f)}</td>
                                <td className='px-4 py-3'>{f.admission.selection}</td>
                                <td className='px-4 py-3'>{periodLabel(f)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className='flex flex-col gap-3 md:hidden'>
                {formations.map((f) => (
                    <div key={f.id} className='rounded-xl border border-gray-100 bg-white p-4 text-sm'>
                        <a href={`#${f.id}`} className='mb-2 block font-semibold text-secondary'>{f.title}</a>
                        <dl className='grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-ink/80'>
                            <dt className='text-ink/60'>Niveau requis</dt><dd>{ADMISSION_LEVEL_LABEL[f.admission.level]}</dd>
                            <dt className='text-ink/60'>Séries du BAC</dt><dd>{seriesLabel(f)}</dd>
                            <dt className='text-ink/60'>Sélection</dt><dd>{f.admission.selection}</dd>
                            <dt className='text-ink/60'>Candidatures</dt><dd>{periodLabel(f)}</dd>
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
