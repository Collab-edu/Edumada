'use client'
import Image from 'next/image'
import Link, { useT } from '@/i18n/client'
import { Icon } from '@/components/ui/icon'
import { track } from '@/lib/track'
import type { SchoolType } from '@/features/etablissements/types'
import { offerFacts } from '../../format'
import type { FormationType } from '../../types'
import { DetailSection, SubTitle } from './parts'
import SchoolLogo from '@/features/etablissements/components/SchoolLogo'
import SchoolMap from '@/components/map/SchoolMap'

interface FormationSchoolProps {
    school: SchoolType
    /** Autres formations du même établissement. */
    otherFormations: FormationType[]
}

/* 8. Présentation de l'établissement */
export function FormationSchool({ school, otherFormations }: FormationSchoolProps) {

    const t = useT()

    return (
        <DetailSection id='etablissement' title="L'établissement" icon='tabler:building-community'>
            <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
                <div className='flex flex-col sm:flex-row sm:items-center gap-4 p-6'>
                    <SchoolLogo name={school.name} initials={school.initials} logo={school.logo} className='h-14 w-14 rounded-xl text-sm shadow-md ring-4 ring-white' />
                    <div className='flex flex-1 flex-col gap-1'>
                        <p className='text-xl font-bold text-secondary'>{school.name}</p>
                        <span className='text-ink/70'>
                            {school.type ? `${t(`Établissement ${school.type.toLowerCase()}`)} · ` : ''}{school.city}
                        </span>
                    </div>
                    <Link
                        href={`/etablissements/${school.id}`}
                        className='inline-flex items-center gap-2 rounded-xl bg-secondary px-5 py-3 font-semibold text-white transition-colors duration-300 hover:bg-primary'>
                        {t('Découvrir l’établissement')} <Icon icon='tabler:arrow-right' />
                    </Link>
                </div>

                {school.photos.length > 0 && (
                <div className='grid grid-cols-3 gap-1'>
                    {school.photos.map((src, i) => (
                        <div key={src} className='relative h-32 md:h-40 bg-cream'>
                            <Image src={src} alt={`${school.name} — photo ${i + 1}`} fill className='object-cover' />
                        </div>
                    ))}
                </div>
                )}

                <div className='flex flex-col gap-5 p-6'>
                    <p className='text-black leading-relaxed'>{school.description}</p>

                    <p className='flex items-start gap-2 rounded-xl bg-offwhite p-4 text-sm text-black'>
                        <Icon icon={school.accreditationVerified ? 'tabler:rosette-discount-check' : 'tabler:info-circle'} className='mt-0.5 shrink-0 text-lg text-secondary' />
                        {school.accreditationVerified && school.accreditation
                            ? t('Reconnaissance officielle vérifiée : {accreditation}.', { accreditation: school.accreditation })
                            : t('Reconnaissance officielle et accréditations en cours de vérification par Edumada.')}
                    </p>

                    <div id='contact' className='scroll-mt-40 grid grid-cols-1 md:grid-cols-5 gap-5'>
                        <div className='flex flex-col gap-3 md:col-span-2'>
                            <SubTitle>Coordonnées</SubTitle>
                            {school.phone && (
                            <a href={`tel:${school.phone.replace(/\s/g, '')}`} onClick={() => track({ type: 'contact_click', establishment: school.id })} className='flex min-h-10 items-center gap-2 text-ink/80 hover:text-primary'>
                                <Icon icon='tabler:phone' className='text-lg text-secondary' /> {school.phone}
                            </a>
                            )}
                            {school.email && <a href={`mailto:${school.email}`} onClick={() => track({ type: 'contact_click', establishment: school.id })} className='flex min-h-10 items-center gap-2 text-ink/80 hover:text-primary'>
                                <Icon icon='tabler:mail' className='text-lg text-secondary' /> {school.email}
                            </a>}
                            {school.website && <a href={school.website} target='_blank' rel='noopener noreferrer' onClick={() => track({ type: 'website_click', establishment: school.id })} className='flex min-h-10 items-center gap-2 text-primary hover:underline'>
                                <Icon icon='tabler:world' className='text-lg text-secondary' /> {school.website.replace(/^https?:\/\//, '')}
                            </a>}
                            <span className='flex items-start gap-2 text-ink/80'>
                                <Icon icon='tabler:map-pin' className='mt-0.5 text-lg text-secondary' /> {school.address}
                            </span>
                        </div>
                        {school.coordinates && (
                            <SchoolMap
                                lat={school.coordinates.lat}
                                lng={school.coordinates.lng}
                                name={school.name}
                                address={school.city}
                                className='md:col-span-3'
                                mapClassName='h-72 w-full rounded-2xl ring-1 ring-gray-100 md:h-80'
                            />
                        )}
                    </div>

                    {otherFormations.length > 0 && (
                        <div>
                            <SubTitle>Autres formations de l&apos;établissement</SubTitle>
                            <ul className='flex flex-col divide-y divide-gray-100 rounded-xl border border-gray-100'>
                                {otherFormations.map((f) => (
                                    <li key={f.id}>
                                        <Link href={`/formations/${f.id}`} className='group flex items-center justify-between gap-3 px-4 py-3 hover:bg-offwhite'>
                                            <span className='flex flex-col'>
                                                <span className='font-medium text-secondary group-hover:text-primary'>{f.title}</span>
                                                <span className='text-sm text-ink/60'>{[...offerFacts(f).map((fact) => t(fact.label)), t(f.modality)].join(' · ')}</span>
                                            </span>
                                            <Icon icon='tabler:chevron-right' className='shrink-0 text-ink/40 group-hover:text-primary' />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </DetailSection>
    )
}

export default FormationSchool
