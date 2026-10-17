'use client'
import Image from 'next/image'
import { Icon } from '@/components/ui/icon'
import SectionHeader from '@/components/ui/section-header'
import { CONTACT } from '@/components/layout/social-links'
import { useSiteData } from '@/data/site-data'
import SchoolFaq from '@/features/etablissements/components/SchoolFaq'
import type { FaqItem } from '@/features/etablissements/faq'
import StudentSpaceSection from './StudentSpaceSection'
import OrientationBanner from './OrientationBanner'

const HERO_IMAGE = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=70'

const COMMITMENTS = [
    {
        title: 'Rassembler',
        text: 'Universités, centres de formation, crèches et écoles : toute l’offre éducative du pays, au même endroit.',
    },
    {
        title: 'Clarifier',
        text: 'Durée, coût, diplôme, conditions d’admission : les mêmes repères sur chaque fiche, pour comparer facilement.',
    },
    {
        title: 'Rapprocher',
        text: 'Un contact direct avec l’établissement, sans intermédiaire, depuis un simple téléphone.',
    },
]

const AUDIENCES = [
    { icon: 'tabler:school', title: 'Étudiants', text: 'Trouver la formation qui correspond à son projet, après le bac ou pour apprendre un métier.' },
    { icon: 'tabler:users', title: 'Parents', text: 'Choisir une crèche, une école, un collège ou un lycée près de chez soi.' },
    { icon: 'tabler:building', title: 'Établissements', text: 'Présenter ses formations et recevoir les demandes des futurs élèves.' },
]

const FAQ: FaqItem[] = [
    {
        question: 'Edumada est-il gratuit ?',
        answer: 'Oui. Rechercher, comparer les formations et contacter un établissement est gratuit pour les étudiants et les parents.',
    },
    {
        question: 'Dois-je créer un compte ?',
        answer: 'Non pour consulter le site. Un compte gratuit est demandé seulement pour postuler à une formation et suivre votre dossier.',
    },
    {
        question: 'Les informations sont-elles à jour ?',
        answer: 'Les fiches sont tenues par les établissements eux-mêmes. Vérifiez toujours les dates et les frais auprès de l’établissement avant de vous inscrire.',
    },
    {
        question: 'Comment référencer mon établissement ?',
        answer: 'Créez un compte établissement et complétez votre fiche : l’équipe Edumada la vérifie avant sa mise en ligne. La formule Gratuit permet de publier jusqu’à 3 offres.',
    },
]

/** Page À propos : mission d'Edumada, ses engagements, ses publics et quelques questions fréquentes. */
export default function AboutPage() {
    const { data: schools } = useSiteData('SchoolData')
    const { data: formations } = useSiteData('FormationData')
    const cities = new Set(schools.map((school) => school.city).filter(Boolean))

    const figures = [
        { value: schools.length, label: 'établissements' },
        { value: formations.length, label: 'formations' },
        { value: cities.size, label: 'villes' },
    ]

    return (
        <>
            {/* En-tête */}
            <section className='pt-32 pb-10 sm:pt-40'>
                <div className='container mx-auto max-w-7xl px-4'>
                    <div className='mx-auto flex max-w-3xl flex-col items-center gap-5 text-center'>
                        <h1 className='text-4xl md:text-6xl font-bold text-secondary'>
                            Bien choisir sa formation, <span className='text-primary'>partout à Madagascar</span>
                        </h1>
                        <p className='max-w-2xl text-black'>
                            Edumada aide les jeunes et leurs familles à découvrir les formations et les établissements du pays, à les comparer, puis à
                            les contacter directement.
                        </p>
                    </div>

                    <div className='relative mt-10'>
                        <div className='relative h-56 overflow-hidden rounded-2xl sm:h-80 lg:h-96'>
                            <Image src={HERO_IMAGE} alt='Étudiants réunis autour d’une table' fill priority sizes='100vw' className='object-cover' />
                        </div>
                        <ul className='relative mx-4 -mt-10 grid grid-cols-3 divide-x divide-gray-200 rounded-xl border border-gray-200 bg-white py-4 shadow-[4px_4px_0_0_rgba(15,76,92,0.22)] sm:mx-auto sm:max-w-2xl sm:py-6'>
                            {figures.map((figure) => (
                                <li key={figure.label} className='flex flex-col items-center gap-1 px-2 text-center'>
                                    <span className='text-2xl sm:text-4xl font-bold text-secondary'>{figure.value || '–'}</span>
                                    <span className='text-xs sm:text-sm text-ink/70'>{figure.label}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Mission */}
            <section>
                <div className='container mx-auto max-w-7xl px-4'>
                    <div className='grid gap-10 lg:grid-cols-2'>
                        <div className='flex flex-col gap-4'>
                            <h2 className='font-bold'>Pourquoi nous avons créé Edumada</h2>
                            <p className='text-black'>
                                À Madagascar, trouver une formation se fait souvent au hasard : une affiche, une publication sur les réseaux sociaux, le
                                conseil d’un proche. Les informations sont dispersées et difficiles à comparer.
                            </p>
                            <p className='text-black'>
                                Nous voulons que chaque jeune, à Antananarivo comme en région, puisse voir toutes les possibilités qui s’offrent à lui
                                avant de faire son choix.
                            </p>
                        </div>
                        <ol className='flex flex-col gap-6'>
                            {COMMITMENTS.map((item, index) => (
                                <li key={item.title} className='flex gap-4'>
                                    <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary font-bold text-white'>
                                        {index + 1}
                                    </span>
                                    <div className='flex flex-col gap-1'>
                                        <h3 className='text-lg font-semibold text-secondary'>{item.title}</h3>
                                        <p className='text-black'>{item.text}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </section>

            {/* Publics */}
            <section className='bg-secondary/[0.06]'>
                <div className='container mx-auto max-w-7xl px-4'>
                    <SectionHeader title='Pour qui ?' description='Edumada s’adresse à tous ceux qui cherchent ou proposent une formation.' />
                    <ul className='grid gap-5 md:grid-cols-3'>
                        {AUDIENCES.map((audience) => (
                            <li key={audience.title} className='flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-6'>
                                <span className='flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                                    <Icon icon={audience.icon} className='text-2xl' />
                                </span>
                                <h3 className='text-lg font-semibold text-secondary'>{audience.title}</h3>
                                <p className='text-black'>{audience.text}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <StudentSpaceSection />

            <OrientationBanner />

            {/* Questions fréquentes */}
            <section>
                <div className='container mx-auto max-w-3xl px-4'>
                    <SectionHeader title='Questions fréquentes' />
                    <SchoolFaq items={FAQ} />
                    <p className='mt-6 text-black'>
                        Une autre question ? Écrivez-nous :{' '}
                        <a href={`mailto:${CONTACT.email}`} className='font-semibold text-primary underline underline-offset-4'>
                            {CONTACT.email}
                        </a>
                    </p>
                </div>
            </section>
        </>
    )
}
