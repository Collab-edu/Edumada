'use client'
import Image from 'next/image'
import SectionHeader from '@/components/ui/section-header'
import withBasePath from '@/lib/base-path'
import { useT } from '@/i18n/client'

/** Captures à 3x de PhoneMockup, fond transparent, avec une marge de 32 px pour l'ombre du téléphone. */
const STEPS = [
    { title: 'Recherchez', text: 'Filtrez les formations par domaine, ville, niveau et budget.', image: 'etape-1', alt: 'Recherche de formations sur Edumada, avec des filtres et trois résultats' },
    { title: 'Comparez', text: 'Durée, frais, diplôme, admission : les mêmes repères sur chaque fiche.', image: 'etape-2', alt: 'Fiche d’une licence en informatique : diplôme, durée, frais et inscriptions' },
    { title: 'Contactez', text: 'Envoyez votre demande à l’établissement et suivez sa réponse.', image: 'etape-3', alt: 'Suivi d’une demande envoyée à un établissement' },
]

/** Section « Comment ça marche ? » : les trois étapes, chacune sur un téléphone. */
export default function HowItWorksPhones() {
    const t = useT()

    return (
        <section>
            <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                <SectionHeader title='Comment ça marche ?' description='Trois étapes pour trouver sa formation sur Edumada.' className='text-center sm:justify-center' />
                <ol className='grid gap-12 md:grid-cols-3 md:gap-6'>
                    {STEPS.map((step, index) => (
                        <li key={step.title} className='flex flex-col items-center gap-6'>
                            <div className='relative -my-8 w-full max-w-[22rem]'>
                                <div className='absolute inset-2 -z-10 rounded-full bg-cream blur-2xl' />
                                <Image
                                    src={withBasePath(`/images/comment-ca-marche/${step.image}.webp`)}
                                    alt={step.alt}
                                    width={1056}
                                    height={1692}
                                    sizes='(min-width: 768px) 33vw, 352px'
                                    className='h-auto w-full'
                                />
                            </div>
                            <div className='flex max-w-xs flex-col items-center gap-2 text-center'>
                                <span className='flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-white'>{index + 1}</span>
                                <h3 className='text-lg font-semibold text-secondary'>{t(step.title)}</h3>
                                <p className='text-black'>{t(step.text)}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    )
}
