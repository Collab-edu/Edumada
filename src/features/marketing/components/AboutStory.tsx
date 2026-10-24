import Image from 'next/image'
import Link from '@/i18n/client'
import { DotPattern } from '@/components/ui/dot-pattern'
import { Icon } from '@/components/ui/icon'
import withBasePath from '@/lib/base-path'

const PHOTO = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=70'

/** Là où l'information se trouve aujourd'hui, dispersée. */
const SCATTERED = [
    { label: 'Affiches', rotate: '-rotate-3' },
    { label: 'Réseaux sociaux', rotate: 'rotate-2' },
    { label: 'Bouche-à-oreille', rotate: '-rotate-1' },
    { label: 'Sites incomplets', rotate: 'rotate-3' },
]

const COMMITMENTS = [
    { title: 'Rassembler', text: 'universités, centres de formation, crèches et écoles, au même endroit.' },
    { title: 'Clarifier', text: 'durée, coût, diplôme et admission présentés de la même façon sur chaque fiche.' },
    { title: 'Rapprocher', text: 'un contact direct avec l’établissement, sans intermédiaire.' },
]

const AUDIENCES = [
    {
        icon: 'tabler:school',
        title: 'Étudiants',
        text: 'Trouver la formation qui correspond à son projet, après le bac ou pour apprendre un métier.',
        link: { href: '/recherche/', label: 'Rechercher une formation' },
    },
    {
        icon: 'tabler:users',
        title: 'Parents',
        text: 'Choisir une crèche, une école, un collège ou un lycée près de chez soi.',
        link: { href: '/etablissements/', label: 'Voir les établissements' },
    },
    {
        icon: 'tabler:building',
        title: 'Établissements',
        text: 'Présenter ses formations et recevoir les demandes des futurs élèves.',
        link: { href: '/avantages/', label: 'Découvrir les avantages' },
    },
]

type AboutStoryProps = {
    figures: { value: number; label: string }[]
    cities: string[]
}

/** Récit de la page À propos : le constat, notre réponse, puis les publics d'Edumada. */
export default function AboutStory({ figures, cities }: AboutStoryProps) {
    const schools = figures[0]?.value ?? 0

    return (
        <>
            {/* Le constat */}
            <section>
                <div className='container mx-auto max-w-7xl px-4'>
                    <div className='grid gap-10 md:grid-cols-[1fr_auto] md:items-center md:gap-16'>
                        <div className='flex max-w-2xl flex-col gap-5'>
                            <h2 className='text-3xl font-bold leading-tight md:text-4xl'>
                                Nous voulons que chaque jeune choisisse sa formation <span className='text-primary'>en connaissance de cause</span>
                            </h2>
                            <p className='text-black'>
                                À Madagascar, trouver une formation se fait souvent au hasard : une affiche, une publication sur les réseaux sociaux, le
                                conseil d’un proche. Les informations sont dispersées, incomplètes et difficiles à comparer.
                            </p>
                            <p className='text-black'>
                                Edumada rassemble ces informations au même endroit, présentées de la même façon, pour que chacun puisse comparer avant de
                                décider.
                            </p>
                        </div>
                        <div className='mx-auto flex aspect-square w-full max-w-[19rem] flex-col items-center justify-center gap-5 rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-[4px_4px_0_0_rgba(15,76,92,0.22)]'>
                            <span className='text-xs font-semibold uppercase tracking-wide text-primary'>Le constat</span>
                            <div className='flex flex-wrap items-center justify-center gap-3'>
                                {SCATTERED.map((item) => (
                                    <span
                                        key={item.label}
                                        className={`${item.rotate} rounded-lg border border-dashed border-gray-300 bg-offwhite px-3 py-1.5 text-sm text-ink/50 line-through decoration-primary/60`}>
                                        {item.label}
                                    </span>
                                ))}
                            </div>
                            <div className='flex flex-col items-center gap-3'>
                                <Icon icon='tabler:arrow-narrow-down' className='text-2xl text-primary' />
                                <span className='inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-sm font-semibold text-white'>
                                    <Image src={withBasePath('/images/logo/edumada-logo-white.svg')} alt='' width={828} height={270} className='h-5 w-auto' />
                                    Tout au même endroit
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Notre réponse */}
            <section>
                <div className='container mx-auto max-w-7xl px-4'>
                    <div className='grid items-center gap-12 lg:grid-cols-2 lg:gap-16'>
                        <div className='relative pr-4 sm:pr-10'>
                            <div className='relative h-72 overflow-hidden rounded-3xl sm:h-96'>
                                <Image src={PHOTO} alt='Étudiants qui comparent des formations' fill sizes='(min-width: 1024px) 50vw, 100vw' className='object-cover' />
                            </div>
                            {schools > 0 && (
                                <div className='absolute right-0 top-6 rounded-2xl bg-primary px-4 py-3 text-white shadow-lg'>
                                    <span className='block text-2xl font-bold leading-none'>{schools}</span>
                                    <span className='text-xs text-white/85'>établissements réunis</span>
                                </div>
                            )}
                        </div>

                        <div className='flex flex-col gap-5'>
                            <h2 className='text-3xl font-bold leading-tight md:text-4xl'>Nous rapprochons les jeunes et les établissements</h2>
                            <p className='text-black'>
                                Edumada est présent partout à Madagascar, pour que l’offre des régions soit aussi visible que celle de la capitale. Trois
                                engagements guident notre travail :
                            </p>
                            <ol className='flex flex-col gap-3'>
                                {COMMITMENTS.map((item, index) => (
                                    <li key={item.title} className='flex gap-3 text-black'>
                                        <span className='font-bold text-primary'>0{index + 1}</span>
                                        <span>
                                            <strong className='font-semibold text-secondary'>{item.title}</strong> : {item.text}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                            {cities.length > 0 && (
                                <ul className='flex flex-wrap gap-2'>
                                    {cities.map((city) => (
                                        <li key={city} className='inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm text-secondary shadow-sm'>
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

            {/* Pour qui ? */}
            <section>
                <div className='container mx-auto max-w-7xl px-4'>
                    <div className='relative overflow-hidden rounded-3xl bg-secondary px-6 py-12 sm:px-10 lg:py-16'>
                        <DotPattern width={22} height={22} cr={1.2} className='fill-white/10' />
                        <div className='pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border-[40px] border-white/5' aria-hidden='true' />
                        <div className='pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full border-[32px] border-primary/20' aria-hidden='true' />

                        <div className='relative mx-auto flex max-w-2xl flex-col items-center gap-3 text-center'>
                            <span className='text-sm font-semibold uppercase tracking-wide text-primary'>Pour qui ?</span>
                            <h2 className='text-3xl font-bold leading-tight text-white md:text-4xl'>
                                Une plateforme pour tous ceux qui cherchent ou proposent une formation
                            </h2>
                            <p className='text-white/75'>Étudiants, familles et établissements : chacun y trouve ce dont il a besoin.</p>
                        </div>

                        <ul className='relative mt-12 grid gap-5 md:grid-cols-3'>
                            {AUDIENCES.map((audience) => (
                                <li key={audience.title}>
                                    <Link
                                        href={audience.link.href}
                                        className='group flex h-full flex-col gap-3 rounded-2xl bg-white p-6 transition-transform duration-300 hover:-translate-y-1'>
                                        <span className='flex h-14 w-14 items-center justify-center rounded-2xl bg-cream text-primary'>
                                            <Icon icon={audience.icon} className='text-3xl' />
                                        </span>
                                        <h3 className='text-lg font-semibold text-secondary'>{audience.title}</h3>
                                        <p className='text-black'>{audience.text}</p>
                                        <span className='mt-auto inline-flex items-center gap-1 text-sm font-semibold text-primary'>
                                            {audience.link.label}
                                            <Icon icon='tabler:arrow-right' className='text-base transition-transform duration-300 group-hover:translate-x-1' />
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>
        </>
    )
}
