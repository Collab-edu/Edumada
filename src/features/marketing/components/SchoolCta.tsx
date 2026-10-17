'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import { useSiteData } from '@/data/site-data'
import { imageOr } from '@/lib/media'

/** Emplacement des photos rondes autour du texte (en % de la carte), taille en px et décalage d'animation. */
const SPOTS = [
    { left: '5%', top: '18%', size: 56, delay: '0s' },
    { left: '15%', top: '6%', size: 72, delay: '1.2s' },
    { left: '11%', top: '50%', size: 60, delay: '2.4s' },
    { left: '4%', top: '78%', size: 48, delay: '0.6s' },
    { left: '17%', top: '74%', size: 56, delay: '1.8s' },
    { left: '81%', top: '8%', size: 68, delay: '0.9s' },
    { left: '92%', top: '24%', size: 48, delay: '2.1s' },
    { left: '86%', top: '44%', size: 60, delay: '0.3s' },
    { left: '79%', top: '80%', size: 44, delay: '1.5s' },
    { left: '89%', top: '72%', size: 64, delay: '2.7s' },
]

const SchoolCta = () => {
    const { data: schools } = useSiteData('SchoolData')
    const photos = [...new Set(schools.map((school) => imageOr(school.imageSrc)))].slice(0, SPOTS.length)

    return (
        <section id='school-cta-section' className='relative z-10 -mb-28 pb-0'>
            <div className='container mx-auto max-w-7xl px-4'>
                <div className='relative overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 py-12 shadow-xl shadow-secondary/20 sm:px-10 lg:py-16'>
                    {/* Photos d'établissements autour du texte, sur grand écran */}
                    <div className='pointer-events-none absolute inset-0 hidden lg:block' aria-hidden='true'>
                        {photos.map((src, i) => {
                            const spot = SPOTS[i % SPOTS.length]
                            return (
                                <div
                                    key={src}
                                    className='absolute animate-float overflow-hidden rounded-full border-4 border-white bg-cream shadow-md'
                                    style={{ left: spot.left, top: spot.top, width: spot.size, height: spot.size, animationDelay: spot.delay }}>
                                    <Image src={src} alt='' fill sizes='80px' className='object-cover' />
                                </div>
                            )
                        })}
                    </div>

                    <div className='relative mx-auto flex max-w-xl flex-col items-center gap-5 text-center'>
                        <span className='inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary'>
                            <Icon icon='tabler:building' className='text-base' />
                            {schools.length > 0 ? `Déjà ${schools.length} établissements sur Edumada` : 'Espace établissements'}
                        </span>
                        <h2 className='font-bold text-secondary'>Vous êtes un établissement de formation ?</h2>
                        <p className='text-ink/80 leading-relaxed'>
                            Présentez vos formations, améliorez votre visibilité et permettez aux futurs étudiants de découvrir votre
                            établissement. La fiche est gratuite.
                        </p>
                        <div className='flex flex-col items-center gap-5 sm:flex-row'>
                            <Link
                                href='/signup/?type=etablissement'
                                className='inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-4 font-bold text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:bg-primary/90 hover:-translate-y-0.5'>
                                Référencer mon établissement
                                <Icon icon='tabler:arrow-right' className='text-lg' />
                            </Link>
                            <Link
                                href='/avantages/'
                                className='font-semibold text-secondary underline underline-offset-4 decoration-secondary/40 transition-colors duration-300 hover:text-primary hover:decoration-primary'>
                                Découvrir les avantages
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SchoolCta
