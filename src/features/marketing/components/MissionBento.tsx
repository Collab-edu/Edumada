import Image from 'next/image'
import { Icon } from '@/components/ui/icon'
import withBasePath from '@/lib/base-path'

const PHOTO_MAIN = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=70'
const PHOTO_CLARIFY = 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=70'

/** Là où l'information se trouve aujourd'hui, dispersée. */
const SCATTERED = [
    { label: 'Affiches', rotate: '-rotate-3' },
    { label: 'Réseaux sociaux', rotate: 'rotate-2' },
    { label: 'Bouche-à-oreille', rotate: '-rotate-1' },
    { label: 'Sites incomplets', rotate: 'rotate-3' },
]

type MissionBentoProps = {
    figures: { value: number; label: string }[]
    cities: string[]
}

/** « Pourquoi nous avons créé Edumada » en mosaïque : mission, constat, engagements, chiffres et villes. */
export default function MissionBento({ figures, cities }: MissionBentoProps) {
    return (
        <section>
            <div className='container mx-auto max-w-7xl px-4'>
                <div className='grid auto-rows-[minmax(11rem,auto)] gap-4 md:grid-cols-2 lg:grid-cols-4'>
                    {/* Mission, sur la photo */}
                    <div className='relative min-h-[26rem] overflow-hidden rounded-3xl md:col-span-2 lg:row-span-2'>
                        <Image src={PHOTO_MAIN} alt='Étudiants diplômés lançant leur toque' fill sizes='(min-width: 1024px) 50vw, 100vw' className='object-cover' />
                        <div className='absolute inset-0 bg-gradient-to-t from-secondary via-secondary/60 to-transparent' />
                        <div className='absolute inset-x-0 bottom-0 flex flex-col gap-3 p-6 sm:p-8'>
                            <span className='w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur-sm'>
                                Notre mission
                            </span>
                            <h2 className='text-3xl font-bold leading-tight text-white md:text-4xl'>Pourquoi nous avons créé Edumada</h2>
                            <p className='max-w-md text-white/85'>
                                Pour qu’aucun jeune ne choisisse sa formation au hasard, faute d’avoir trouvé la bonne information.
                            </p>
                        </div>
                    </div>

                    {/* Le constat */}
                    <div className='flex flex-col justify-between gap-5 rounded-3xl border border-gray-200 bg-white p-6 md:col-span-2'>
                        <div className='flex flex-col gap-2'>
                            <span className='text-xs font-semibold uppercase tracking-wide text-primary'>Le constat</span>
                            <p className='text-lg font-semibold leading-snug text-secondary'>
                                À Madagascar, l’information sur les formations est dispersée et difficile à comparer.
                            </p>
                        </div>
                        <div className='flex flex-wrap items-center gap-3'>
                            {SCATTERED.map((item) => (
                                <span
                                    key={item.label}
                                    className={`${item.rotate} rounded-lg border border-dashed border-gray-300 bg-offwhite px-3 py-1.5 text-sm text-ink/50 line-through decoration-primary/60`}>
                                    {item.label}
                                </span>
                            ))}
                            <Icon icon='tabler:arrow-narrow-right' className='text-2xl text-primary' />
                            <span className='inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-sm font-semibold text-white'>
                                <Image src={withBasePath('/images/logo/edumada-logo-white.svg')} alt='' width={828} height={270} className='h-5 w-auto' />
                                Tout au même endroit
                            </span>
                        </div>
                    </div>

                    {/* 01 Rassembler */}
                    <div className='flex flex-col justify-between gap-4 rounded-3xl bg-secondary p-6 text-white'>
                        <div className='flex items-start justify-between'>
                            <span className='flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-primary'>
                                <Icon icon='tabler:building-community' className='text-2xl' />
                            </span>
                            <span className='text-4xl font-bold text-white/20'>01</span>
                        </div>
                        <div className='flex flex-col gap-1'>
                            <h3 className='text-lg font-semibold text-white'>Rassembler</h3>
                            <p className='!text-sm text-white/75'>Universités, centres de formation, crèches et écoles : toute l’offre du pays.</p>
                        </div>
                    </div>

                    {/* Chiffres */}
                    <div className='flex flex-col justify-between gap-4 rounded-3xl bg-primary p-6 text-white'>
                        <span className='text-xs font-semibold uppercase tracking-wide text-white/80'>Déjà sur Edumada</span>
                        <ul className='flex flex-col gap-2'>
                            {figures.map((figure) => (
                                <li key={figure.label} className='flex items-baseline gap-2'>
                                    <span className='text-3xl font-bold leading-none'>{figure.value || '–'}</span>
                                    <span className='text-sm text-white/85'>{figure.label}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 02 Clarifier, sur photo */}
                    <div className='relative min-h-[11rem] overflow-hidden rounded-3xl'>
                        <Image src={PHOTO_CLARIFY} alt='' fill sizes='(min-width: 1024px) 25vw, 100vw' className='object-cover' />
                        <div className='absolute inset-0 bg-secondary/75' />
                        <div className='relative flex h-full flex-col justify-between gap-4 p-6 text-white'>
                            <div className='flex items-start justify-between'>
                                <span className='flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur-sm'>
                                    <Icon icon='tabler:scale' className='text-2xl' />
                                </span>
                                <span className='text-4xl font-bold text-white/30'>02</span>
                            </div>
                            <div className='flex flex-col gap-1'>
                                <h3 className='text-lg font-semibold text-white'>Clarifier</h3>
                                <p className='!text-sm text-white/80'>Durée, coût, diplôme, admission : les mêmes repères sur chaque fiche.</p>
                            </div>
                        </div>
                    </div>

                    {/* 03 Rapprocher */}
                    <div className='flex flex-col justify-between gap-4 rounded-3xl bg-cream p-6'>
                        <div className='flex items-start justify-between'>
                            <span className='flex h-11 w-11 items-center justify-center rounded-xl bg-white text-primary shadow-sm'>
                                <Icon icon='tabler:device-mobile-message' className='text-2xl' />
                            </span>
                            <span className='text-4xl font-bold text-primary/25'>03</span>
                        </div>
                        <div className='flex flex-col gap-1'>
                            <h3 className='text-lg font-semibold text-secondary'>Rapprocher</h3>
                            <p className='!text-sm text-black'>Un contact direct avec l’établissement, depuis un simple téléphone.</p>
                        </div>
                    </div>

                    {/* Citation et villes */}
                    <div className='flex flex-col justify-between gap-5 rounded-3xl border border-gray-200 bg-white p-6 md:col-span-2'>
                        <div className='flex gap-3'>
                            <Icon icon='tabler:quote' className='shrink-0 text-4xl text-primary/30' />
                            <p className='text-lg font-semibold leading-snug text-secondary'>
                                Que chaque jeune, à Antananarivo comme en région, puisse voir toutes les possibilités qui s’offrent à lui avant de
                                faire son choix.
                            </p>
                        </div>
                        {cities.length > 0 && (
                            <ul className='flex flex-wrap gap-2'>
                                {cities.map((city) => (
                                    <li key={city} className='inline-flex items-center gap-1 rounded-full bg-offwhite px-3 py-1 text-sm text-secondary'>
                                        <Icon icon='tabler:map-pin' className='text-sm text-primary' />
                                        {city}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
