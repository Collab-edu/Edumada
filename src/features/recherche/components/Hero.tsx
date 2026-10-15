import HeroFilters from './HeroFilters'
import { DotPattern } from '@/components/ui/dot-pattern'
import Image from 'next/image'
import withBasePath from '@/lib/base-path'

const Banner = () => {
    return (
        <section id='Home' className='relative bg-offwhite min-h-screen flex items-center pt-28 pb-20'>
            {/* Halos de couleur flous pour donner de la profondeur */}
            <div aria-hidden='true' className='pointer-events-none absolute inset-0 overflow-hidden'>
                <div className='absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full bg-cream blur-3xl opacity-90' />
                <div className='absolute -bottom-40 -right-24 h-[560px] w-[560px] rounded-full bg-success/40 blur-3xl' />
                <div className='absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl' />
            </div>
            <DotPattern
                width={22}
                height={22}
                cx={1.5}
                cy={1.5}
                cr={1.5}
                className='fill-secondary/25 [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_85%)]'
            />
            <div className='relative w-full px-6 lg:px-8'>
                <div className='container'>
                    <div className='flex flex-col gap-4 text-center'>
                        <h1 className='text-[45px] leading-tight font-bold tracking-tight max-w-4xl mx-auto'>
                            Trouvez votre formation à Madagascar et construisez votre{' '}
                            <span className='text-primary'>avenir</span>.
                        </h1>
                        <p className='text-base leading-7 text-ink max-w-3xl mx-auto'>
                            Explorez les formations, comparez les établissements et trouvez le
                            parcours adapté à vos ambitions, à votre budget et à votre projet
                            professionnel.
                        </p>
                        <div className='backdrop-blur-md bg-white/30 border border-white/30 rounded-lg shadow-md px-5 py-3 w-fit mx-auto'>
                            <div className='flex items-center justify-center gap-4'>
                                <div className='hidden sm:block -space-x-2 overflow-hidden'>
                                    <Image
                                        className='inline-block h-9 w-9 rounded-full ring-2 ring-white'
                                        src='https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                                        alt='img1'
                                        width={12}
                                        height={12}
                                    />

                                    <Image
                                        className='inline-block h-9 w-9 rounded-full ring-2 ring-white'
                                        src='https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                                        alt='img2'
                                        width={12}
                                        height={12}
                                    />
                                    <Image
                                        className='inline-block h-9 w-9 rounded-full ring-2 ring-white'
                                        src='https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80'
                                        alt='img3'
                                        width={12}
                                        height={12}
                                    />
                                    <Image
                                        className='inline-block h-9 w-9 rounded-full ring-2 ring-white'
                                        src='https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                                        alt='img4'
                                        width={12}
                                        height={12}
                                    />
                                    <Image
                                        className='inline-block h-9 w-9 rounded-full ring-2 ring-white'
                                        src='https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
                                        alt='img5'
                                        width={12}
                                        height={12}
                                    />
                                </div>
                                <div>
                                    <div className='flex items-center justify-center sm:justify-start'>
                                        <h3 className='text-lg font-semibold mr-2'>4.6</h3>
                                        <Image
                                            src={withBasePath('/images/banner/Stars.svg')}
                                            alt='stars-icon'
                                            width={70}
                                            height={12}
                                            className='h-3.5 w-auto'
                                        />
                                    </div>
                                    <div>
                                        {/* TODO : chiffres d'exemple du template, à remplacer par de vrais avis */}
                                        <h3 className='text-xs text-ink/70'>Noté par 25 000 personnes sur Google.</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FILTRES */}
                    <HeroFilters />
                </div>
            </div>
        </section>
    )
}

export default Banner
