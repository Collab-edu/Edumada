'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import { cn } from '@/lib/utils'
import { track } from '@/lib/track'
import { useAuth } from '@/features/auth/AuthProvider'
import ReportDialog from '@/features/etablissements/components/ReportDialog'
import ContactDialog from './ContactDialog'
import type { FaqItem } from '@/features/etablissements/faq'
import type { SchoolType } from '@/features/etablissements/types'
import type { CategoryType } from '@/features/categories/types'
import { formatDate, formatTuition, offerFacts } from '../../format'
import type { FormationDetailType, FormationType } from '../../types'
import SimilarFormations from '../SimilarFormations'
import { ApplySection, ExtraInfoSection } from './FormationApply'
import FormationHero, { REGISTRATION_BADGE } from './FormationHero'
import FormationSchool from './FormationSchool'
import { AdmissionSection, CareersSection, CostsSection, OrganisationSection, PresentationSection, ProgramSection } from './FormationSections'

const ALL_NAV = [
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
    category: CategoryType
    otherFormations: FormationType[]
    similar: FormationType[]
    faq: FaqItem[]
}

/** Page complète d'une formation, dans l'ordre recommandé : infos clés, contenu, admission, frais, organisation, débouchés, établissement, candidature. */
export function FormationDetailPage({ formation, detail, school, category, otherFormations, similar, faq }: FormationDetailPageProps) {
    const { fields } = category
    // Sections affichées selon la catégorie : pas de programme ni de débouchés pour une crèche, par exemple.
    const showProgramme = fields.programme && (detail.program.length > 0 || detail.subjects.length > 0)
    const showCareers = fields.careers && detail.careers.jobs.length + detail.careers.sectors.length > 0
    const NAV = ALL_NAV.filter((item) => (item.id !== 'programme' || showProgramme) && (item.id !== 'debouches' || showCareers))
    const { isFavorite: isFavoriteOffer, toggleFavorite: toggle } = useAuth()
    const isFavorite = isFavoriteOffer(formation.id)
    const toggleFavorite = () => toggle(formation.id)
    const [active, setActive] = useState(NAV[0].id)
    const [contactOpen, setContactOpen] = useState(false)
    const [reportOpen, setReportOpen] = useState(false)
    const openContact = () => {
        setContactOpen(true)
        track({ type: 'contact_click', establishment: school.id, offer: formation.id })
    }
    const applyClick = () => track({ type: 'apply_click', establishment: school.id, offer: formation.id })
    const sectionProps = { formation, detail, school, fields }
    const badge = REGISTRATION_BADGE[formation.registration]
    const tuition = formatTuition(formation)

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
        // NAV ne dépend que des props, fixes pour une page donnée.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Sur mobile, la barre d'onglets défile horizontalement : on garde l'onglet actif visible.
    // On fait défiler la barre seule (et non la page, ce qui interromprait la lecture).
    useEffect(() => {
        const nav = document.querySelector<HTMLElement>('nav[aria-label="Sections de la page"]')
        const tab = nav?.querySelector<HTMLElement>(`a[href="#${active}"]`)
        if (!nav || !tab) return
        nav.scrollTo({ left: tab.offsetLeft - nav.clientWidth / 2 + tab.clientWidth / 2, behavior: 'smooth' })
    }, [active])

    return (
        <div className='pt-24 pb-32 sm:pt-28 lg:pb-20'>
            <div className='container mx-auto max-w-7xl px-4'>
                <nav aria-label="Fil d'Ariane" className='mb-4 text-sm text-ink/60'>
                    <Link href='/' className='inline-block py-2 hover:text-primary'>Accueil</Link>
                    <span className='mx-2'>/</span>
                    <Link href='/recherche' className='inline-block py-2 hover:text-primary'>Recherche</Link>
                    <span className='mx-2'>/</span>
                    <span className='text-secondary'>{formation.title}</span>
                </nav>

                <FormationHero {...sectionProps} isFavorite={isFavorite} onToggleFavorite={toggleFavorite} onContact={openContact} onApply={applyClick} />

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
                        {showProgramme && <ProgramSection {...sectionProps} />}
                        <AdmissionSection {...sectionProps} />
                        <CostsSection {...sectionProps} />
                        <OrganisationSection {...sectionProps} />
                        {showCareers && <CareersSection {...sectionProps} />}
                        <FormationSchool school={school} otherFormations={otherFormations} />
                        <ApplySection {...sectionProps} onContact={openContact} onApply={applyClick} />
                        <ExtraInfoSection detail={detail} faq={faq} onReport={() => setReportOpen(true)} />
                    </div>

                    {/* Résumé latéral */}
                    <aside className='hidden lg:block'>
                        <div className='sticky top-40 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
                            <p className='text-lg font-bold text-secondary'>En bref</p>
                            <span className={cn('w-fit rounded-full px-3 py-1 text-xs font-semibold', badge.className)}>{badge.label}</span>
                            <dl className='flex flex-col gap-3 text-sm'>
                                {[
                                    ['Frais de scolarité', tuition ?? 'Non communiqués'],
                                    ...offerFacts(formation).map((fact) => [fact.icon === 'tabler:school' ? 'Diplôme' : fact.icon === 'tabler:clock' ? 'Durée' : 'Âge', fact.label]),
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
                                    href={`/candidature/?offre=${formation.id}`}
                                    onClick={applyClick}
                                    className='flex items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-white shadow-lg shadow-primary/30 hover:bg-primary/90'>
                                    <Icon icon='tabler:send' /> Postuler maintenant
                                </Link>
                            ) : null}
                            <button
                                type='button'
                                onClick={openContact}
                                className={cn(
                                    'flex items-center justify-center gap-2 rounded-xl py-3 font-bold hover:cursor-pointer',
                                    detail.onlineApplication
                                        ? 'border border-secondary/20 text-secondary hover:border-primary hover:text-primary'
                                        : 'bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90'
                                )}>
                                <Icon icon='tabler:message-circle' /> Contacter l&apos;établissement
                            </button>
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

            <ContactDialog open={contactOpen} onClose={() => setContactOpen(false)} formation={formation} school={school} />
            <ReportDialog open={reportOpen} onClose={() => setReportOpen(false)} establishmentId={school.id} offerId={formation.id} />

            {/* Barre d'action mobile : le résumé latéral n'existe pas sur petit écran */}
            <div
                data-mobile-cta
                className='fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-gray-100 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(15,76,92,0.25)] backdrop-blur-sm lg:hidden'>
                <button
                    type='button'
                    onClick={toggleFavorite}
                    aria-pressed={isFavorite}
                    aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-secondary/20 text-secondary'>
                    <Icon icon={isFavorite ? 'tabler:heart-filled' : 'tabler:heart'} className={cn('text-xl', isFavorite && 'text-primary')} />
                </button>
                <button
                    type='button'
                    onClick={openContact}
                    className={cn(
                        'flex h-12 flex-1 items-center justify-center gap-2 rounded-xl font-bold hover:cursor-pointer',
                        detail.onlineApplication ? 'border border-secondary/20 text-secondary' : 'bg-primary text-white'
                    )}>
                    <Icon icon='tabler:message-circle' /> Contacter
                </button>
                {detail.onlineApplication && (
                    <Link
                        href={`/candidature/?offre=${formation.id}`}
                        onClick={applyClick}
                        className='flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary font-bold text-white'>
                        <Icon icon='tabler:send' /> Postuler
                    </Link>
                )}
            </div>
        </div>
    )
}

export default FormationDetailPage
