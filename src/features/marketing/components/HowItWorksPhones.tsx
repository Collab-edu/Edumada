'use client'
import Image from 'next/image'
import { motion, MotionConfig } from 'framer-motion'
import { Icon } from '@/components/ui/icon'
import SectionHeader from '@/components/ui/section-header'
import withBasePath from '@/lib/base-path'
import { useT } from '@/i18n/client'

/** Captures d'écrans à 3x, fond transparent : leur contenu ne suit pas le catalogue. */
const STEPS = [
    { title: 'Recherchez', text: 'Filtrez les formations selon vos critères.', image: 'etape-1', alt: 'Recherche de formations sur Edumada, avec des filtres et trois résultats' },
    { title: 'Comparez', text: 'Consultez les informations de chaque formation.', image: 'etape-2', alt: 'Fiche d’une licence en informatique : diplôme, durée, frais et inscriptions' },
    { title: 'Contactez', text: 'Envoyez votre demande à l’établissement.', image: 'etape-3', alt: 'Suivi d’une demande envoyée à un établissement' },
]

/** Entrée de chaque téléphone : il monte, s'agrandit et se redresse depuis l'extérieur, l'un après l'autre. */
const phoneEntrance = (index: number) => ({
    initial: { opacity: 0, y: 72, scale: 0.88, rotate: [-9, 0, 9][index] },
    whileInView: { opacity: 1, y: 0, scale: 1, rotate: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: { type: 'spring' as const, stiffness: 90, damping: 14, delay: index * 0.18 },
})

/** Section « Comment ça marche ? » : les trois étapes, chacune sur un téléphone. */
export default function HowItWorksPhones() {
    const t = useT()

    return (
        <section className='overflow-hidden'>
            <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                <SectionHeader title='Comment ça marche ?' description='Trois étapes pour trouver sa formation sur Edumada.' className='text-center sm:justify-center' />
                {/* Animation réduite à un fondu si l'appareil demande moins de mouvement. */}
                <MotionConfig reducedMotion='user'>
                <ol className='mx-auto grid max-w-5xl gap-14 md:grid-cols-3 md:gap-10'>
                    {STEPS.map((step, index) => (
                        <li key={step.title} className='relative flex flex-col items-center text-center'>
                            {index > 0 && (
                                <span
                                    aria-hidden='true'
                                    className='absolute -top-11 left-1/2 z-10 flex h-11 w-11 -translate-x-1/2 rotate-90 items-center justify-center rounded-full bg-white text-primary shadow-[0_8px_20px_-8px_rgba(15,76,92,0.35)] md:-left-5 md:top-[38%] md:translate-x-[-50%] md:rotate-0'>
                                    <Icon icon='tabler:chevron-right' className='text-2xl' />
                                </span>
                            )}
                            <div className='relative w-full max-w-[17rem]'>
                                <div aria-hidden='true' className='absolute inset-x-[-12%] bottom-[16%] top-[16%] rounded-full bg-cream/70' />
                                <motion.div className='relative' {...phoneEntrance(index)}>
                                    <Image
                                        src={withBasePath(`/images/comment-ca-marche/${step.image}.webp`)}
                                        alt={step.alt}
                                        width={1080}
                                        height={1740}
                                        sizes='272px'
                                        className='h-auto w-full'
                                    />
                                    <span className='absolute -bottom-3 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border-[3px] border-white bg-primary text-xl font-bold text-white shadow-md'>
                                        {index + 1}
                                    </span>
                                </motion.div>
                            </div>
                            <h3 className='mt-6 text-xl font-bold text-black'>{t(step.title)}</h3>
                            <p className='mt-1 max-w-[15rem] text-ink'>{step.text}</p>
                        </li>
                    ))}
                </ol>
                </MotionConfig>
            </div>
        </section>
    )
}
