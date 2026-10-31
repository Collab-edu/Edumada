'use client'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import type { SchoolType } from '@/features/etablissements/types'
import type { CategoryType } from '@/features/categories/types'
import { ADMISSION_LEVEL_LABEL, formatAgeRange, formatDate, formatDuration, formatFees } from '../../format'
import type { FormationDetailType, FormationType } from '../../types'
import { CheckList, ChipList, DetailSection, Fact, NOT_PROVIDED, Panel, SubTitle } from './parts'
import { Eyebrow } from '@/components/ui/eyebrow'
import { useT } from '@/i18n/client'

type Props = { formation: FormationType; detail: FormationDetailType; school: SchoolType; fields: CategoryType['fields'] }

const PRESENTATION_TITLE: Record<FormationType['kind'], string> = {
    formation: 'Présentation de la formation',
    niveau: 'Présentation du niveau',
    accueil: "Présentation de l'accueil",
}

/* 2. Présentation et objectifs */
export function PresentationSection({ formation, detail }: Props) {
    return (
        <DetailSection id='presentation' title={PRESENTATION_TITLE[formation.kind]} icon='tabler:info-circle'>
            <p className='text-black leading-relaxed'>{detail.description}</p>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                <Panel>
                    <SubTitle>Objectifs pédagogiques</SubTitle>
                    <CheckList items={detail.objectives} />
                </Panel>
                <Panel>
                    <SubTitle>{formation.kind === 'formation' ? 'Compétences acquises' : 'Ce que l’enfant développe'}</SubTitle>
                    <CheckList items={detail.skills} />
                </Panel>
            </div>
        </DetailSection>
    )
}

/* 3. Programme */
export function ProgramSection({ detail }: Props) {
    return (
        <DetailSection id='programme' title='Programme et matières' icon='tabler:book'>
            <div>
                <SubTitle>Matières principales</SubTitle>
                <ChipList items={detail.subjects} />
            </div>
            <div>
                <SubTitle>Programme des cours</SubTitle>
                <ol className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {detail.program.map((period, i) => (
                        <li key={period.period} className='rounded-xl border border-gray-100 bg-white p-4'>
                            <p className='mb-2 flex items-center gap-2 font-semibold text-secondary'>
                                <span className='flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-white'>
                                    {i + 1}
                                </span>
                                {period.period}
                            </p>
                            <ul className='flex flex-col gap-1 pl-9 text-ink/80'>
                                {period.courses.map((course) => (
                                    <li key={course} className='list-disc'>{course}</li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ol>
            </div>
            {detail.specializations.length > 0 && (
                <div>
                    <SubTitle>Spécialisations proposées</SubTitle>
                    <ChipList items={detail.specializations} tone='success' />
                </div>
            )}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                <Panel>
                    <SubTitle>Méthodes d&apos;enseignement</SubTitle>
                    <CheckList items={detail.teachingMethods} />
                </Panel>
                <Panel>
                    <SubTitle>Évaluation</SubTitle>
                    <p className='text-black'>{detail.evaluation}</p>
                </Panel>
            </div>
        </DetailSection>
    )
}

/* 4. Conditions d'admission */
export function AdmissionSection({ formation, detail, school, fields }: Props) {
    const t = useT()
    const { level, bacSeries, selection } = formation.admission
    return (
        <DetailSection id='admission' title="Conditions d'admission" icon='tabler:clipboard-check'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {fields.level && <Fact icon='tabler:school' label="Niveau d'études requis">{ADMISSION_LEVEL_LABEL[level]}</Fact>}
                {fields.level && level === 'BAC' && (
                    <Fact icon='tabler:list-letters' label='Séries du BAC acceptées'>
                        {bacSeries.length > 0 ? bacSeries.join(', ') : 'Toutes les séries'}
                    </Fact>
                )}
                {formation.ageRange && <Fact icon='tabler:mood-kid' label='Âge des enfants accueillis'>{formatAgeRange(formation.ageRange)}</Fact>}
                <Fact icon='tabler:filter' label='Modalités de sélection'>{selection}</Fact>
                <Fact icon='tabler:user' label='Âge minimum'>
                    {detail.admission.minAge ? `${detail.admission.minAge} ans` : 'Aucun âge minimum imposé'}
                </Fact>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                <Panel>
                    <SubTitle>Diplômes et prérequis</SubTitle>
                    <CheckList items={detail.admission.prerequisites} />
                    <p className='mt-4 text-sm text-black'>
                        <span className='font-semibold text-secondary'>{t('Conditions particulières :')} </span>
                        {detail.admission.specialConditions ?? t('Aucune condition particulière communiquée.')}
                    </p>
                </Panel>
                <Panel>
                    <SubTitle>Documents à fournir</SubTitle>
                    <CheckList items={school.admissionDocuments} />
                </Panel>
            </div>
        </DetailSection>
    )
}

/* 5. Frais et financement */
const STATUS_BANNER = {
    Confirmés: { icon: 'tabler:circle-check', text: "Montants confirmés par l'établissement.", className: 'bg-success/25 text-secondary' },
    Estimés: { icon: 'tabler:alert-triangle', text: "Montants estimés : à confirmer auprès de l'établissement avant toute démarche.", className: 'bg-cream text-primary' },
    'Non communiqués': { icon: 'tabler:info-circle', text: "L'établissement n'a pas encore communiqué ses frais.", className: 'bg-gray-100 text-ink/70' },
} as const

export function CostsSection({ formation, detail }: Props) {
    const t = useT()
    const { costs } = detail
    const banner = STATUS_BANNER[costs.status]
    const rows = [
        { label: "Frais d'inscription", amount: formation.registrationFee },
        { label: `Frais de scolarité (par ${formation.feesPeriod})`, amount: formation.fees },
        { label: 'Frais de dossier', amount: costs.applicationFee },
        ...costs.otherFees,
    ]
    return (
        <DetailSection id='frais' title='Frais et financement' icon='tabler:coin'>
            <p className={cn('flex items-center gap-2 rounded-xl px-4 py-3 font-medium', banner.className)}>
                <Icon icon={banner.icon} className='shrink-0 text-lg' /> {t(banner.text)}
            </p>
            <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
                <table className='w-full text-left'>
                    <caption className='sr-only'>{t('Détail des frais')}</caption>
                    <tbody className='divide-y divide-gray-100'>
                        {rows.map((row) => (
                            <tr key={row.label}>
                                <th scope='row' className='px-5 py-3.5 font-medium text-ink/80'>{t(row.label)}</th>
                                <td className='px-5 py-3.5 text-right'>
                                    {row.amount === null ? (
                                        <span className='text-ink/50'>{t(NOT_PROVIDED)}</span>
                                    ) : (
                                        <span className='inline-flex items-center gap-2 font-semibold text-secondary'>
                                            {formatFees(row.amount)}
                                            {costs.status === 'Estimés' && (
                                                <Eyebrow bar={false} className='text-[11px] tracking-wider'>{t('Estimé')}</Eyebrow>
                                            )}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                <Fact icon='tabler:calendar-dollar' label='Modalités de paiement'>{costs.paymentOptions.join(', ')}</Fact>
                <Fact icon='tabler:award' label='Bourses'>{costs.scholarships ?? 'Aucune bourse communiquée'}</Fact>
                <Fact icon='tabler:discount' label='Réductions et financement'>{costs.discounts ?? 'Aucune réduction communiquée'}</Fact>
            </div>
        </DetailSection>
    )
}

/* 6. Organisation */
export function OrganisationSection({ formation, detail }: Props) {
    const { organization } = detail
    return (
        <DetailSection id='organisation' title='Organisation de la formation' icon='tabler:calendar-event'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {formation.durationYears !== null && <Fact icon='tabler:clock' label='Durée totale'>{formatDuration(formation.durationYears)}</Fact>}
                {formation.ageRange && <Fact icon='tabler:mood-kid' label='Âge des enfants'>{formatAgeRange(formation.ageRange)}</Fact>}
                <Fact icon='tabler:calendar-star' label='Date de rentrée'>
                    {formation.startDate ? formatDate(formation.startDate) : NOT_PROVIDED}
                </Fact>
                <Fact icon='tabler:calendar-event' label="Période d'inscription">
                    {formation.registrationPeriod
                        ? `Du ${formatDate(formation.registrationPeriod.start)} au ${formatDate(formation.registrationPeriod.end)}`
                        : NOT_PROVIDED}
                </Fact>
                <Fact icon='tabler:clock-hour-4' label={formation.kind === 'accueil' ? "Horaires d'accueil" : 'Horaires des cours'}>{organization.schedule ?? NOT_PROVIDED}</Fact>
                <Fact icon='tabler:device-laptop' label='Modalité'>{formation.modality}</Fact>
                <Fact icon='tabler:language' label="Langues d'enseignement">{formation.languages.join(', ')}</Fact>
                <Fact icon='tabler:building' label='Campus'>{organization.campus}</Fact>
                <Fact icon='tabler:hourglass' label='Rythme'>{organization.rhythm.join(' ou ')}</Fact>
            </div>
            {detail.academicCalendar.length > 0 && (
                <Panel>
                    <SubTitle>Calendrier académique</SubTitle>
                    <ol className='relative flex flex-col gap-4 border-l-2 border-secondary/15 pl-6'>
                        {detail.academicCalendar.map((step) => (
                            <li key={step.label} className='relative'>
                                <span className='absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-primary' />
                                <span className='block text-sm text-ink/60'>{formatDate(step.date)}</span>
                                <span className='font-medium text-ink'>{step.label}</span>
                            </li>
                        ))}
                    </ol>
                </Panel>
            )}
        </DetailSection>
    )
}

/* 7. Débouchés */
export function CareersSection({ detail }: Props) {
    const t = useT()
    const { careers } = detail
    return (
        <DetailSection id='debouches' title='Débouchés professionnels' icon='tabler:briefcase'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                <Panel>
                    <SubTitle>Métiers accessibles</SubTitle>
                    <CheckList items={careers.jobs} />
                </Panel>
                <Panel>
                    <SubTitle>Secteurs d&apos;activité</SubTitle>
                    <ChipList items={careers.sectors} />
                    <SubTitle>
                        <span className='mt-5 block'>{t('Poursuite d’études')}</span>
                    </SubTitle>
                    {careers.furtherStudies.length > 0 ? <CheckList items={careers.furtherStudies} /> : <p className='text-ink/60'>{t(NOT_PROVIDED)}</p>}
                </Panel>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <Fact icon='tabler:building-factory-2' label='Stages et formation en entreprise'>{careers.internship ?? NOT_PROVIDED}</Fact>
                <Fact icon='tabler:heart-handshake' label='Partenariats professionnels'>
                    {careers.partnerships.length > 0 ? careers.partnerships.join(', ') : 'Aucun partenariat confirmé pour le moment'}
                </Fact>
            </div>
        </DetailSection>
    )
}
