import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import { ButtonLink } from '@/components/ui/form'
import SectionHeader from '@/components/ui/section-header'
import StudentSpaceSection from '@/features/marketing/components/StudentSpaceSection'

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

            {/* Profils */}
            <section className='bg-secondary/[0.06]'>
                <div className='container mx-auto max-w-7xl px-4'>
                    <SectionHeader title='Par où commencer ?' description='Choisissez la situation qui vous ressemble.' />
                    <ul className='grid gap-5 md:grid-cols-3'>
                        {PROFILES.map((profile) => (
                            <li key={profile.title}>
                                <Link
                                    href={profile.href}
                                    className='group flex h-full flex-col gap-3 rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40'>
                                    <Icon icon={profile.icon} className='text-3xl text-primary' />
                                    <h3 className='text-lg font-semibold text-secondary group-hover:text-primary duration-300'>{profile.title}</h3>
                                    <p className='text-sm text-black'>{profile.text}</p>
                                    <span className='mt-auto inline-flex items-center gap-1 text-sm font-semibold text-primary'>
                                        {profile.cta}
                                        <Icon icon='tabler:chevron-right' className='text-base transition-transform duration-300 group-hover:translate-x-1' />
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
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
