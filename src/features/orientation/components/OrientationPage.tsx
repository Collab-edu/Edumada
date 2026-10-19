import Link from 'next/link'
import { DotPattern } from '@/components/ui/dot-pattern'
import HeroVideo from '@/components/ui/hero-video'
import { Icon } from '@/components/ui/icon'
import { ButtonLink } from '@/components/ui/form'
import StudentSpaceSection from '@/features/marketing/components/StudentSpaceSection'

/** Les questions à se poser avant de comparer les formations. */
/** Vidéo libre de droits (Pexels), en attendant une vidéo d'Edumada. */
const HERO_VIDEO = 'https://videos.pexels.com/video-files/7092235/7092235-hd_1920_1080_30fps.mp4'
const HERO_POSTER = 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1600&q=70'

const QUESTIONS = [
    { label: 'Quel métier ?', rotate: '-rotate-3' },
    { label: 'Quel niveau ?', rotate: 'rotate-2' },
    { label: 'Quel budget ?', rotate: '-rotate-1' },
    { label: 'Quelle ville ?', rotate: 'rotate-3' },
]

const STEPS = [
    {
        icon: 'tabler:bulb',
        title: 'Partez de vos envies',
        text: 'Ce que vous aimez faire, vos matières fortes, le métier qui vous attire : notez-les avant de comparer les formations.',
        link: { href: '/domaines/', label: 'Explorer les domaines' },
    },
    {
        icon: 'tabler:route',
        title: 'Choisissez un type de parcours',
        text: 'Études longues à l’université, formation professionnelle courte, ou établissement scolaire : chaque voie mène à des métiers différents.',
        link: { href: '/recherche/', label: 'Voir les formations' },
    },
    {
        icon: 'tabler:scale',
        title: 'Comparez les établissements',
        text: 'Durée, coût, diplôme délivré, conditions d’admission, ville : consultez les fiches et comparez avant de décider.',
        link: { href: '/etablissements/', label: 'Voir les établissements' },
    },
    {
        icon: 'tabler:message-circle',
        title: 'Contactez l’établissement',
        text: 'Posez vos questions directement à l’établissement, vérifiez les dates d’inscription et préparez votre dossier.',
        link: null,
    },
]

const PROFILES = [
    {
        icon: 'tabler:school',
        title: 'Après le bac',
        text: 'Licences, masters, BTS et grandes écoles : trouvez l’enseignement supérieur qui correspond à votre projet.',
        href: `/recherche?categorie=${encodeURIComponent('Enseignement supérieur')}`,
        cta: 'Enseignement supérieur',
    },
    {
        icon: 'tabler:tools',
        title: 'Apprendre un métier rapidement',
        text: 'Formations courtes et certifiantes pour entrer vite dans la vie active ou changer de métier.',
        href: '/formation-professionnelle/',
        cta: 'Formation professionnelle',
    },
    {
        icon: 'tabler:backpack',
        title: 'Pour votre enfant',
        text: 'Crèches, écoles primaires, collèges et lycées : trouvez un établissement près de chez vous.',
        href: '/etablissements/',
        cta: 'Crèches et écoles',
    },
]

/** Page Orientation : la démarche pour choisir une formation, puis des entrées par profil. */
export default function OrientationPage() {
    return (
        <>
            <section className='pt-28 pb-10 sm:pt-32'>
                <div className='container mx-auto max-w-7xl px-4'>
                    <div className='flex max-w-3xl flex-col gap-4'>
                        <p className='font-semibold uppercase tracking-wide text-primary'>Orientation</p>
                        <h1 className='text-3xl md:text-5xl font-bold text-secondary'>Trouvez la voie qui vous correspond</h1>
                        <p className='text-black'>
                            Choisir une formation est une décision importante. Voici une démarche simple, en quatre étapes, pour avancer sereinement et
                            comparer les possibilités à Madagascar.
                        </p>
                    </div>
                    <HeroVideo src={HERO_VIDEO} poster={HERO_POSTER} label='Cours dans une salle de classe' className='mt-10 h-56 sm:h-80 lg:h-96' />
                </div>
            </section>

            {/* Étapes */}
            <section className='pt-0'>
                <div className='container mx-auto max-w-7xl px-4'>
                    <ol className='grid gap-5 sm:grid-cols-2 lg:grid-cols-4'>
                        {STEPS.map((step, index) => (
                            <li
                                key={step.title}
                                className='flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-[4px_4px_0_0_rgba(15,76,92,0.22)]'>
                                <div className='flex items-center justify-between'>
                                    <span className='flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                                        <Icon icon={step.icon} className='text-2xl' />
                                    </span>
                                    <span className='text-sm font-semibold text-ink/40'>Étape {index + 1}</span>
                                </div>
                                <h2 className='text-lg font-semibold text-secondary'>{step.title}</h2>
                                <p className='text-sm text-black'>{step.text}</p>
                                {step.link && (
                                    <Link href={step.link.href} className='mt-auto inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline'>
                                        {step.link.label}
                                        <Icon icon='tabler:chevron-right' className='text-base' />
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            {/* Les bonnes questions */}
            <section>
                <div className='container mx-auto max-w-7xl px-4'>
                    <div className='grid gap-10 md:grid-cols-[1fr_auto] md:items-center md:gap-16'>
                        <div className='flex max-w-2xl flex-col gap-5'>
                            <h2 className='text-3xl font-bold leading-tight md:text-4xl'>
                                Avant de choisir, posez-vous <span className='text-primary'>les bonnes questions</span>
                            </h2>
                            <p className='text-black'>
                                Le bon choix ne dépend pas seulement de la réputation d’un établissement. Il dépend de votre projet, de votre niveau, de
                                votre budget et de l’endroit où vous voulez étudier.
                            </p>
                            <p className='text-black'>
                                Prenez le temps d’y répondre : vous saurez quelles formations comparer, et lesquelles écarter.
                            </p>
                        </div>
                        <div className='mx-auto flex aspect-square w-full max-w-[19rem] flex-col items-center justify-center gap-5 rounded-3xl border border-gray-200 bg-white p-6 text-center shadow-[4px_4px_0_0_rgba(15,76,92,0.22)]'>
                            <span className='text-xs font-semibold uppercase tracking-wide text-primary'>Vos questions</span>
                            <div className='flex flex-wrap items-center justify-center gap-3'>
                                {QUESTIONS.map((item) => (
                                    <span
                                        key={item.label}
                                        className={`${item.rotate} rounded-lg border border-dashed border-gray-300 bg-offwhite px-3 py-1.5 text-sm text-secondary`}>
                                        {item.label}
                                    </span>
                                ))}
                            </div>
                            <div className='flex flex-col items-center gap-3'>
                                <Icon icon='tabler:arrow-narrow-down' className='text-2xl text-primary' />
                                <span className='inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-sm font-semibold text-white'>
                                    <Icon icon='tabler:route' className='text-base' />
                                    Votre parcours
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Par où commencer ? */}
            <section>
                <div className='container mx-auto max-w-7xl px-4'>
                    <div className='relative overflow-hidden rounded-3xl bg-secondary px-6 py-12 sm:px-10 lg:py-16'>
                        <DotPattern width={22} height={22} cr={1.2} className='fill-white/10' />
                        <div className='pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border-[40px] border-white/5' aria-hidden='true' />
                        <div className='pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full border-[32px] border-primary/20' aria-hidden='true' />

                        <div className='relative mx-auto flex max-w-2xl flex-col items-center gap-3 text-center'>
                            <span className='text-sm font-semibold uppercase tracking-wide text-primary'>Par où commencer ?</span>
                            <h2 className='text-3xl font-bold leading-tight text-white md:text-4xl'>Choisissez la situation qui vous ressemble</h2>
                            <p className='text-white/75'>Chaque profil vous mène directement aux formations ou aux établissements qui vous concernent.</p>
                        </div>

                        <ul className='relative mt-12 grid gap-5 md:grid-cols-3'>
                            {PROFILES.map((profile) => (
                                <li key={profile.title}>
                                    <Link
                                        href={profile.href}
                                        className='group flex h-full flex-col gap-3 rounded-2xl bg-white p-6 transition-transform duration-300 hover:-translate-y-1'>
                                        <span className='flex h-14 w-14 items-center justify-center rounded-2xl bg-cream text-primary'>
                                            <Icon icon={profile.icon} className='text-3xl' />
                                        </span>
                                        <h3 className='text-lg font-semibold text-secondary'>{profile.title}</h3>
                                        <p className='text-black'>{profile.text}</p>
                                        <span className='mt-auto inline-flex items-center gap-1 text-sm font-semibold text-primary'>
                                            {profile.cta}
                                            <Icon icon='tabler:arrow-right' className='text-base transition-transform duration-300 group-hover:translate-x-1' />
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            <StudentSpaceSection />

            {/* Appel à la recherche */}
            <section className='pb-20'>
                <div className='container mx-auto max-w-7xl px-4'>
                    <div className='flex flex-col gap-4 rounded-2xl bg-secondary p-8 text-white md:flex-row md:items-center md:justify-between'>
                        <div>
                            <h2 className='text-2xl font-bold text-white'>Vous savez déjà ce que vous cherchez ?</h2>
                            <p className='text-white/80'>Filtrez les formations par domaine, ville, durée et budget.</p>
                        </div>
                        <ButtonLink href='/recherche/' className='shrink-0'>
                            <Icon icon='tabler:search' className='text-lg' />
                            Rechercher une formation
                        </ButtonLink>
                    </div>
                </div>
            </section>
        </>
    )
}
