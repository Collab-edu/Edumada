import Image from 'next/image'
import { Caveat } from 'next/font/google'
import HeroFilters from './HeroFilters'
import HeroLogos from './HeroLogos'
import MobileSearch from './MobileSearch'

/** Écriture manuscrite de la phrase d'accroche (décorative). */
const handwriting = Caveat({ subsets: ['latin'], weight: ['500'], display: 'swap' })

const HERO_IMAGE = 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=2000&q=75'

/**
 * Essai : hero de l'accueil en photo plein cadre (étudiants en extérieur), contenu centré,
 * barre de recherche à cheval sur le bas de la photo, puis les logos des établissements qui défilent.
 */
export default function HeroPhoto() {
    return (
        <section id='Home' className='relative flex min-h-svh flex-col bg-offwhite pb-8 sm:pb-10'>
            {/* Photo et voile : clair au centre pour le texte, la photo se dévoile sur les bords */}
            {/* La photo occupe la hauteur restante : le hero tient tout l'écran à l'ouverture. */}
            <div className='relative flex flex-1 flex-col justify-center overflow-hidden pt-28 pb-10 sm:pt-32 sm:pb-40 lg:pb-44'>
                <Image src={HERO_IMAGE} alt='' fill priority sizes='100vw' className='object-cover object-[65%_center]' />
                <div aria-hidden='true' className='absolute inset-0 bg-white/80 sm:bg-transparent sm:bg-[radial-gradient(ellipse_at_50%_45%,rgba(255,255,255,0.93)_0%,rgba(255,255,255,0.78)_40%,rgba(255,255,255,0.35)_80%)]' />
                <div aria-hidden='true' className='absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/70 to-transparent' />

                {/* Vague rouge (bas à gauche) et courbe claire qui ferme la photo */}
                <svg aria-hidden='true' viewBox='0 0 1440 160' preserveAspectRatio='none' className='absolute inset-x-0 bottom-0 hidden h-24 w-full sm:block lg:h-32'>
                    <path d='M0 40 C 180 150, 330 160, 470 160 L 0 160 Z' className='fill-primary' />
                    <path d='M0 120 C 240 170, 520 150, 820 110 C 1080 75, 1280 70, 1440 40 L 1440 160 L 0 160 Z' className='fill-offwhite' />
                </svg>

                <div className='relative container mx-auto max-w-7xl px-4'>
                    {/* Phrase manuscrite (grand écran) */}
                    <p
                        aria-hidden='true'
                        className={`${handwriting.className} absolute top-24 right-6 hidden -rotate-12 text-right text-3xl leading-tight text-white drop-shadow-[0_2px_8px_rgba(15,76,92,0.9)] lg:block xl:text-4xl`}>
                        Plus qu&apos;une formation…
                        <br />
                        un avenir !
                        <svg viewBox='0 0 160 20' className='ml-auto block h-4 w-40'>
                            <path d='M2 16 C 50 4, 110 2, 158 6' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' />
                        </svg>
                    </p>

                    <div className='relative mx-auto max-w-3xl text-center'>
                        {/* Traits rouges décoratifs */}
                        <svg aria-hidden='true' viewBox='0 0 40 40' className='absolute -top-6 left-0 hidden h-10 w-10 text-primary sm:block lg:-left-6'>
                            <path d='M8 22 L 20 26 M12 10 L 22 20 M26 4 L 28 16' fill='none' stroke='currentColor' strokeWidth='3.5' strokeLinecap='round' />
                        </svg>
                        <h1 className='text-[28px] leading-[1.2] font-extrabold text-secondary sm:text-[32px] lg:text-[35px]'>
                            Trouvez votre formation à Madagascar et construisez votre <span className='text-primary'>avenir</span>.
                        </h1>

                        {/* Mobile : la recherche juste sous le titre (la barre complète est masquée). */}
                        <div className='mt-5 sm:hidden'>
                            <MobileSearch />
                        </div>

                        <div className='relative mt-5 sm:mt-6'>
                            <p className='mx-auto max-w-2xl text-base leading-7 text-ink sm:text-lg'>
                                Explorez les formations, comparez les établissements et trouvez le parcours adapté à vos ambitions, à votre budget et à votre projet
                                professionnel.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Barre de recherche à cheval sur la photo */}
            <div className='relative z-10 container mx-auto max-w-7xl px-4 sm:-mt-36 lg:-mt-40'>
                <HeroFilters />
            </div>

            {/* Logos des établissements qui défilent */}
            <div className='relative mt-8 sm:mt-10'>
                <HeroLogos />
            </div>
        </section>
    )
}
