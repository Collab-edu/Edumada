'use client'
import Image from 'next/image'
import { Icon } from '@/components/ui/icon'
import SectionHeader from '@/components/ui/section-header'
import { useSiteData } from '@/data/site-data'
import { imageOr } from '@/lib/media'
import { formatTuition } from '@/features/formations/format'
import type { FormationType } from '@/features/formations/types'
import SchoolLogo from '@/features/etablissements/components/SchoolLogo'
import PhoneMockup, { type PhoneTab } from './PhoneMockup'

const tabs = (active: string): PhoneTab[] =>
    [
        { icon: 'tabler:home', label: 'Accueil' },
        { icon: 'tabler:search', label: 'Rechercher' },
        { icon: 'tabler:heart', label: 'Favoris' },
        { icon: 'tabler:user', label: 'Profil' },
    ].map((tab) => ({ ...tab, active: tab.label === active }))

const STEPS = [
    { title: 'Recherchez', text: 'Filtrez les formations par domaine, ville, niveau et budget.', tab: 'Rechercher' },
    { title: 'Comparez', text: 'Durée, frais, diplôme, admission : les mêmes repères sur chaque fiche.', tab: 'Favoris' },
    { title: 'Contactez', text: 'Envoyez votre demande à l’établissement et suivez sa réponse.', tab: 'Profil' },
]

/** Écran 1 : la recherche, avec des filtres actifs et des résultats. */
function SearchScreen({ results }: { results: FormationType[] }) {
    return (
        <>
            <p className='font-bold text-secondary'>Rechercher</p>
            <div className='flex items-center gap-2 rounded-lg border border-primary/40 bg-white px-3 py-2 text-xs text-secondary'>
                <Icon icon='tabler:search' className='text-sm text-primary' />
                Informatique
            </div>
            <div className='flex flex-wrap gap-1.5'>
                {['Antananarivo', 'Licence', '< 2,5 M Ar'].map((chip) => (
                    <span key={chip} className='rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary'>
                        {chip}
                    </span>
                ))}
            </div>
            <p className='!text-[11px] font-semibold text-ink/60'>{results.length} résultats</p>
            <div className='flex flex-col gap-2'>
                {results.map((formation) => (
                    <div key={formation.id} className='flex items-center gap-2 rounded-lg bg-white p-2'>
                        <SchoolLogo name={formation.school} logo={formation.schoolLogo} className='h-9 w-9 rounded-md text-[9px] shadow-sm' />
                        <div className='min-w-0'>
                            <p className='truncate !text-xs font-semibold text-secondary'>{formation.title}</p>
                            <p className='truncate !text-[10px] text-ink/60'>{formation.school}</p>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

/** Écran 2 : la fiche d'une formation, avec ses repères clés. */
function CompareScreen({ formation }: { formation: FormationType }) {
    const facts = [
        { label: 'Diplôme', value: formation.diploma ?? '—' },
        { label: 'Durée', value: formation.durationYears ? `${formation.durationYears} ans` : '—' },
        { label: 'Frais', value: formatTuition(formation) ?? 'Non communiqué' },
        { label: 'Inscriptions', value: formation.registration },
    ]
    return (
        <>
            <div className='relative h-20 overflow-hidden rounded-lg bg-cream'>
                <Image src={imageOr(formation.imageSrc)} alt='' fill sizes='260px' className='object-cover' />
            </div>
            <div className='-mt-7 flex items-end gap-2 px-1'>
                <SchoolLogo name={formation.school} logo={formation.schoolLogo} className='h-11 w-11 rounded-lg text-[10px] shadow-md ring-2 ring-white' />
                <p className='truncate pb-0.5 !text-[10px] font-semibold text-secondary'>{formation.school}</p>
            </div>
            <p className='font-bold leading-tight text-secondary'>{formation.title}</p>
            <div className='grid grid-cols-2 gap-1.5'>
                {facts.map((fact) => (
                    <div key={fact.label} className='rounded-lg bg-white px-2 py-1.5'>
                        <p className='!text-[9px] uppercase tracking-wide text-ink/50'>{fact.label}</p>
                        <p className='truncate !text-[11px] font-semibold text-secondary'>{fact.value}</p>
                    </div>
                ))}
            </div>
            <div className='flex items-center justify-center gap-1.5 rounded-lg border border-primary px-3 py-2 text-[11px] font-semibold text-primary'>
                <Icon icon='tabler:heart-filled' className='text-sm' />
                Ajouté aux favoris
            </div>
        </>
    )
}

/** Écran 3 : la demande envoyée à l'établissement, puis son suivi. */
function ContactScreen({ formation }: { formation: FormationType }) {
    const steps = [
        { label: 'Demande envoyée', done: true },
        { label: 'En cours d’examen', done: true },
        { label: 'Réponse de l’établissement', done: false },
    ]
    return (
        <>
            <p className='font-bold text-secondary'>Mes démarches</p>
            <div className='flex items-center gap-2 rounded-lg bg-white p-2'>
                <SchoolLogo name={formation.school} logo={formation.schoolLogo} className='h-9 w-9 rounded-md text-[9px] shadow-sm' />
                <div className='min-w-0'>
                    <p className='truncate !text-xs font-semibold text-secondary'>{formation.title}</p>
                    <p className='truncate !text-[10px] text-ink/60'>{formation.school}</p>
                </div>
            </div>
            <div className='rounded-lg rounded-tl-none bg-secondary px-3 py-2 text-[11px] leading-snug text-white'>
                Bonjour, quelles sont les dates d’inscription pour la prochaine rentrée ?
            </div>
            <ol className='flex flex-col gap-2 rounded-lg bg-white p-3'>
                {steps.map((step) => (
                    <li key={step.label} className='flex items-center gap-2 text-[11px]'>
                        <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${step.done ? 'bg-success/50 text-secondary' : 'border border-dashed border-primary text-primary'}`}>
                            <Icon icon={step.done ? 'tabler:check' : 'tabler:clock'} className='text-xs' />
                        </span>
                        <span className={step.done ? 'text-secondary' : 'font-semibold text-primary'}>{step.label}</span>
                    </li>
                ))}
            </ol>
        </>
    )
}

/** Section « Comment ça marche ? » : les trois étapes, chacune sur un téléphone. */
export default function HowItWorksPhones() {
    const { data: formations } = useSiteData('FormationData')
    const degrees = formations.filter((formation) => formation.kind === 'formation')
    if (degrees.length === 0) return null
    const featured = degrees[0]
    const screens = [<SearchScreen key='search' results={degrees.slice(0, 3)} />, <CompareScreen key='compare' formation={featured} />, <ContactScreen key='contact' formation={featured} />]

    return (
        <section>
            <div className='container mx-auto max-w-7xl px-4'>
                <SectionHeader title='Comment ça marche ?' description='Trois étapes pour trouver sa formation sur Edumada.' className='text-center sm:justify-center' />
                <ol className='grid gap-12 md:grid-cols-3 md:gap-6'>
                    {STEPS.map((step, index) => (
                        <li key={step.title} className='flex flex-col items-center gap-6'>
                            <PhoneMockup tabs={tabs(step.tab)} screenClassName='h-[25rem] overflow-hidden'>
                                {screens[index]}
                            </PhoneMockup>
                            <div className='flex max-w-xs flex-col items-center gap-2 text-center'>
                                <span className='flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-white'>{index + 1}</span>
                                <h3 className='text-lg font-semibold text-secondary'>{step.title}</h3>
                                <p className='text-black'>{step.text}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    )
}
