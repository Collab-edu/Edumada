'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import { cn } from '@/lib/utils'
import type { FaqItem } from '@/features/etablissements/faq'
import type { SchoolType } from '@/features/etablissements/types'
import { formatDate, formatDuration, formatFees } from '../../format'
import type { FormationDetailType, FormationType } from '../../types'
import SimilarFormations from '../SimilarFormations'
import { ApplySection, ExtraInfoSection } from './FormationApply'
import FormationHero, { REGISTRATION_BADGE } from './FormationHero'
import FormationSchool from './FormationSchool'
import { AdmissionSection, CareersSection, CostsSection, OrganisationSection, PresentationSection, ProgramSection } from './FormationSections'

const NAV = [
    { id: 'presentation', label: 'Présentation' },
    { id: 'programme', label: 'Programme' },
    { id: 'admission', label: 'Admission' },
    { id: 'frais', label: 'Frais' },
    { id: 'organisation', label: 'Organisation' },
    { id: 'debouches', label: 'Débouchés' },
    { id: 'etablissement', label: 'Établissement' },
    { id: 'postuler', label: 'Postuler' },
]

interface FormationDetailPageProps {
    formation: FormationType
    detail: FormationDetailType
    school: SchoolType
    otherFormations: FormationType[]
    similar: FormationType[]
    faq: FaqItem[]
}

/** Page complète d'une formation, dans l'ordre recommandé : infos clés, contenu, admission, frais, organisation, débouchés, établissement, candidature. */
export function FormationDetailPage({ formation, detail, school, otherFormations, similar, faq }: FormationDetailPageProps) {
    const [isFavorite, setIsFavorite] = useState(false)
    const [active, setActive] = useState(NAV[0].id)
    const toggleFavorite = () => setIsFavorite((v) => !v)
    const sectionProps = { formation, detail, school }
    const badge = REGISTRATION_BADGE[formation.registration]
    const fees = formatFees(formation.fees)

    // Met en évidence, dans la navigation, la section en cours de lecture.
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((e) => e.isIntersecting)
                if (visible.length > 0) setActive(visible[0].target.id)
            },
            { rootMargin: '-160px 0px -60% 0px' }
        )
        NAV.forEach(({ id }) => {
            const el = document.getElementById(id)
            if (el) observer.observe(el)
        })
        return () => observer.disconnect()
    }, [])

    return (
        <div className='pt-28 pb-20'>
            <div className='container mx-auto max-w-7xl px-4'>
                <nav aria-label="Fil d'Ariane" className='mb-4 text-sm text-ink/60'>
                    <Link href='/' className='hover:text-primary'>Accueil</Link>
                    <span className='mx-2'>/</span>
                    <Link href='/recherche' className='hover:text-primary'>Formations</Link>
                    <span className='mx-2'>/</span>
                    <span className='text-secondary'>{formation.title}</span>
                </nav>

                <FormationHero {...sectionProps} isFavorite={isFavorite} onToggleFavorite={toggleFavorite} />

                {/* Navigation interne */}
                <nav
                    aria-label='Sections de la page'
                    className='sticky top-20 z-30 -mx-4 mt-6 overflow-x-auto bg-offwhite/95 px-4 py-3 backdrop-blur-sm'>
                    <ul className='flex w-max gap-2'>
                        {NAV.map((item) => (
                            <li key={item.id}>
                                <a
                                    href={`#${item.id}`}
                                    aria-current={active === item.id ? 'true' : undefined}
                                    className={cn(
                                        'block rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200',
                                        active === item.id ? 'bg-secondary text-white' : 'bg-white text-secondary hover:bg-secondary/10'
                                    )}>
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className='mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-10'>
                    <div className='flex flex-col gap-14'>
                        <PresentationSection {...sectionProps} />
                        <ProgramSection {...sectionProps} />
                        <AdmissionSection {...sectionProps} />
                        <CostsSection {...sectionProps} />
                        <OrganisationSection {...sectionProps} />
                        <CareersSection {...sectionProps} />
                        <FormationSchool school={school} otherFormations={otherFormations} />
                        <ApplySection {...sectionProps} />
                        <ExtraInfoSection detail={detail} faq={faq} />
                    </div>

                    {/* Résumé latéral */}
                    <aside className='hidden lg:block'>
                        <div className='sticky top-40 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
                            <p className='text-lg font-bold text-secondary'>En bref</p>
                            <span className={cn('w-fit rounded-full px-3 py-1 text-xs font-semibold', badge.className)}>{badge.label}</span>
                            <dl className='flex flex-col gap-3 text-sm'>
                                {[
                                    ['Frais de scolarité', fees ? `${fees} / an` : 'Non communiqués'],
                                    ['Durée', formatDuration(formation.durationYears)],
                                    ['Diplôme', formation.diploma],
                                    ['Rentrée', formation.startDate ? formatDate(formation.startDate) : 'Non communiquée'],
                                    ['Date limite', formation.registrationPeriod ? formatDate(formation.registrationPeriod.end) : 'Non communiquée'],
                                ].map(([label, value]) => (
                                    <div key={label} className='flex justify-between gap-3 border-b border-gray-100 pb-2 last:border-0'>
                                        <dt className='text-ink/60'>{label}</dt>
                                        <dd className='text-right font-semibold text-secondary'>{value}</dd>
                                    </div>
                                ))}
                            </dl>
                            {detail.onlineApplication ? (
                                <Link
                                    href={`/signup?formation=${formation.id}`}
                                    className='flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary/90'>
                                    <Icon icon='tabler:send' /> Postuler maintenant
                                </Link>
                            ) : null}
                            <a
                                href='#contact'
                                className={cn(
                                    'flex items-center justify-center gap-2 rounded-xl py-3 font-bold',
                                    detail.onlineApplication
                                        ? 'border border-secondary/20 text-secondary hover:border-primary hover:text-primary'
                                        : 'bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90'
                                )}>
                                <Icon icon='tabler:message-circle' /> Contacter l&apos;établissement
                            </a>
                            <button
                                type='button'
                                onClick={toggleFavorite}
                                aria-pressed={isFavorite}
                                className='flex items-center justify-center gap-2 py-1 font-semibold text-secondary hover:text-primary hover:cursor-pointer'>
                                <Icon icon={isFavorite ? 'tabler:heart-filled' : 'tabler:heart'} className={cn(isFavorite && 'text-primary')} />
                                {isFavorite ? 'Dans mes favoris' : 'Ajouter aux favoris'}
                            </button>
                        </div>
                    </aside>
                </div>

                <div className='mt-20 border-t border-gray-100 pt-14'>
                    <SimilarFormations formations={similar} />
                </div>
            </div>
        </div>
    )
}

export default FormationDetailPage
