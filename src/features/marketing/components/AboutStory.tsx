import Image from 'next/image'
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
    { icon: 'tabler:school', title: 'Étudiants', text: 'Trouver la formation qui correspond à son projet, après le bac ou pour apprendre un métier.' },
    { icon: 'tabler:users', title: 'Parents', text: 'Choisir une crèche, une école, un collège ou un lycée près de chez soi.' },
    { icon: 'tabler:building', title: 'Établissements', text: 'Présenter ses formations et recevoir les demandes des futurs élèves.' },
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
                <div className='container mx-auto max-w-7xl px-4 flex flex-col gap-10'>
                    <h2 className='max-w-2xl text-3xl font-bold leading-tight md:text-4xl'>
                        Nous voulons que chaque jeune choisisse sa formation <span className='text-primary'>en connaissance de cause</span>
                    </h2>
                    <div className='grid gap-8 md:grid-cols-2 md:gap-14'>
                        <div className='flex flex-col gap-4'>
                            <p className='text-black'>
                                À Madagascar, trouver une formation se fait souvent au hasard : une affiche, une publication sur les réseaux sociaux, le
                                conseil d’un proche. Les informations sont dispersées, incomplètes et difficiles à comparer.
                            </p>
                            <p className='text-black'>
                                Edumada rassemble ces informations au même endroit, présentées de la même façon, pour que chacun puisse comparer avant de
                                décider.
                            </p>
                        </div>
                        <div className='flex flex-col gap-5 rounded-3xl border border-gray-200 bg-white p-6'>
                            <span className='text-xs font-semibold uppercase tracking-wide text-primary'>Le constat</span>
                            <div className='flex flex-wrap items-center gap-3'>
                                {SCATTERED.map((item) => (
                                    <span
                                        key={item.label}
                                        className={`${item.rotate} rounded-lg border border-dashed border-gray-300 bg-offwhite px-3 py-1.5 text-sm text-ink/50 line-through decoration-primary/60`}>
                                        {item.label}
                                    </span>
                                ))}
                            </div>
                            <div className='flex items-center gap-3'>
                                <Icon icon='tabler:arrow-narrow-right' className='text-2xl text-primary' />
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
                        <div className='relative pb-8 pr-4 sm:pr-10'>
                            <div className='relative h-72 overflow-hidden rounded-3xl sm:h-96'>
                                <Image src={PHOTO} alt='Étudiants qui comparent des formations' fill sizes='(min-width: 1024px) 50vw, 100vw' className='object-cover' />
                            </div>
                            <figure className='absolute bottom-0 left-6 max-w-[16rem] rounded-2xl bg-white px-5 py-4 shadow-lg'>
                                <blockquote className='text-sm font-semibold text-secondary'>« Bien choisir, ensemble. »</blockquote>
                                <figcaption className='mt-1 text-xs text-ink/60'>L’équipe Edumada</figcaption>
                            </figure>
                            {schools > 0 && (
                                <div className='absolute right-0 top-6 rounded-2xl bg-primary px-4 py-3 text-white shadow-lg'>
                                    <span className='block text-2xl font-bold leading-none'>{schools}</span>
                                    <span className='text-xs text-white/85'>établissements réunis</span>
                                </div>
                            )}
                        </div>

                        <div className='flex flex-col gap-5'>
                            <h2 className='text-3xl font-bold leading-tight md:text-4xl'>Nous rapprochons les jeunes et les établissements</h2>
                            <p className='text-black'>Trois engagements guident tout ce que nous construisons :</p>
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
                            <blockquote className='border-l-4 border-primary pl-4 italic text-secondary'>
                                « Que chaque jeune, à Antananarivo comme en région, puisse voir toutes les possibilités qui s’offrent à lui avant de faire
                                son choix. »
                            </blockquote>
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
                    <div className='relative mx-auto flex max-w-2xl flex-col items-center gap-3 text-center'>
                        <Icon icon='tabler:sparkles' className='absolute -left-2 top-0 hidden text-2xl text-primary/60 sm:block' aria-hidden='true' />
                        <Icon icon='tabler:sparkles' className='absolute -right-4 bottom-2 hidden text-xl text-secondary/40 sm:block' aria-hidden='true' />
                        <h2 className='text-3xl font-bold leading-tight md:text-4xl'>Une plateforme pour tous ceux qui cherchent ou proposent une formation</h2>
                        <p className='text-black'>Étudiants, familles et établissements : chacun y trouve ce dont il a besoin.</p>
                    </div>
                    <ul className='mt-12 grid gap-10 md:grid-cols-3'>
                        {AUDIENCES.map((audience) => (
                            <li key={audience.title} className='flex flex-col items-center gap-3 text-center'>
                                <span className='flex h-16 w-16 items-center justify-center rounded-full bg-cream text-primary'>
                                    <Icon icon={audience.icon} className='text-3xl' />
                                </span>
                                <h3 className='text-lg font-semibold text-secondary'>{audience.title}</h3>
                                <p className='max-w-xs text-black'>{audience.text}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>
        </>
    )
}
