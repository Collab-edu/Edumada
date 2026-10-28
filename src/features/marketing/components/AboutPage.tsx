'use client'
import SectionHeader from '@/components/ui/section-header'
import { CONTACT } from '@/components/layout/social-links'
import { useSiteData } from '@/data/site-data'
import SchoolFaq from '@/features/etablissements/components/SchoolFaq'
import type { FaqItem } from '@/features/etablissements/faq'
import HeroVideo from '@/components/ui/hero-video'
import StudentSpaceSection from './StudentSpaceSection'
import OrientationBanner from './OrientationBanner'
import AboutStory from './AboutStory'
import { useT } from '@/i18n/client'

const HERO_IMAGE = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=70'
/** Vidéo libre de droits (Pexels), en attendant une vidéo d'Edumada. */
const HERO_VIDEO = 'https://videos.pexels.com/video-files/5198159/5198159-hd_1920_1080_25fps.mp4'

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
        answer: 'Créez un compte établissement et complétez votre fiche : l’équipe Edumada la vérifie avant sa mise en ligne. La formule Gratuit permet de publier une offre.',
    },
]

/** Page À propos : mission d'Edumada, ses engagements, ses publics et quelques questions fréquentes. */
export default function AboutPage() {
    const t = useT()
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
                <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                    <div className='mx-auto flex max-w-3xl flex-col items-center gap-5 text-center'>
                        <h1 className='text-4xl md:text-6xl font-bold text-secondary'>
                            {t('Bien choisir sa formation,')} <span className='text-primary'>{t('partout à Madagascar')}</span>
                        </h1>
                        <p className='max-w-2xl text-black'>
                            {t('Edumada aide les jeunes et leurs familles à découvrir les formations et les établissements du pays, à les comparer, puis à les contacter directement.')}
                        </p>
                    </div>

                    <div className='relative mt-10'>
                        <HeroVideo src={HERO_VIDEO} poster={HERO_IMAGE} label={t('Élèves en classe')} className='h-56 sm:h-80 lg:h-96' />
                        <ul className='relative mx-4 -mt-10 grid grid-cols-3 divide-x divide-gray-200 rounded-xl border border-gray-200 bg-white py-4 shadow-[4px_4px_0_0_rgba(15,76,92,0.22)] sm:mx-auto sm:max-w-2xl sm:py-6'>
                            {figures.map((figure) => (
                                <li key={figure.label} className='flex flex-col items-center gap-1 px-2 text-center'>
                                    <span className='text-2xl sm:text-4xl font-bold text-secondary'>{figure.value || '–'}</span>
                                    <span className='text-xs sm:text-sm text-ink/70'>{t(figure.label)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            <AboutStory figures={figures} cities={[...cities].sort()} />

            <StudentSpaceSection />

            <OrientationBanner />

            {/* Questions fréquentes */}
            <section>
                <div className='container mx-auto max-w-3xl px-4'>
                    <SectionHeader title='Questions fréquentes' />
                    <SchoolFaq items={FAQ} />
                    <p className='mt-6 text-black'>
                        {t('Une autre question ? Écrivez-nous :')}{' '}
                        <a href={`mailto:${CONTACT.email}`} className='font-semibold text-primary underline underline-offset-4'>
                            {CONTACT.email}
                        </a>
                    </p>
                </div>
            </section>
        </>
    )
}
