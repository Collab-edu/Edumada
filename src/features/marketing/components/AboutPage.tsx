'use client'
import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import { ButtonLink } from '@/components/ui/form'
import SectionHeader from '@/components/ui/section-header'
import { useSiteData } from '@/data/site-data'

const VALUES = [
    {
        icon: 'tabler:info-circle',
        title: 'Une information claire',
        text: 'Durée, coût, diplôme, conditions d’admission : les informations utiles sont présentées de la même façon sur chaque fiche.',
    },
    {
        icon: 'tabler:map-2',
        title: 'Tout Madagascar',
        text: 'Antananarivo, mais aussi les autres villes et régions : nous voulons rendre visibles les établissements de toute l’île.',
    },
    {
        icon: 'tabler:device-mobile',
        title: 'Pensé pour le mobile',
        text: 'Le site est conçu d’abord pour le téléphone, afin que chacun puisse chercher une formation où qu’il soit.',
    },
    {
        icon: 'tabler:heart-handshake',
        title: 'Gratuit pour les familles',
        text: 'Rechercher, comparer et contacter un établissement ne coûte rien aux étudiants et aux parents.',
    },
]

const AUDIENCES = [
    {
        icon: 'tabler:school',
        title: 'Étudiants',
        text: 'Trouvez la formation qui correspond à votre projet, après le bac ou pour apprendre un métier.',
        href: '/orientation/',
        cta: 'S’orienter',
    },
    {
        icon: 'tabler:users',
        title: 'Parents',
        text: 'Comparez les crèches, écoles, collèges et lycées près de chez vous pour vos enfants.',
        href: '/etablissements/',
        cta: 'Voir les établissements',
    },
    {
        icon: 'tabler:building',
        title: 'Établissements',
        text: 'Présentez vos formations et recevez les demandes des futurs étudiants directement.',
        href: '/tarifs/',
        cta: 'Nos formules',
    },
]

/** Page À propos : mission d'Edumada, chiffres clés, valeurs et publics. */
export default function AboutPage() {
    const { data: schools } = useSiteData('SchoolData')
    const { data: formations } = useSiteData('FormationData')
    const { data: domains } = useSiteData('DomainData')
    const cities = new Set(schools.map((school) => school.city).filter(Boolean))

    const figures = [
        { icon: 'tabler:building-community', value: schools.length, label: 'établissements' },
        { icon: 'tabler:book', value: formations.length, label: 'formations' },
        { icon: 'tabler:category', value: domains.length, label: 'domaines' },
        { icon: 'tabler:map-pin', value: cities.size, label: 'villes' },
    ]

    return (
        <>
            <section className='pt-28 pb-10 sm:pt-32'>
                <div className='container mx-auto max-w-7xl px-4'>
                    <div className='flex max-w-3xl flex-col gap-4'>
                        <p className='font-semibold uppercase tracking-wide text-primary'>À propos</p>
                        <h1 className='text-3xl md:text-5xl font-bold text-secondary'>Aider chacun à trouver sa formation à Madagascar</h1>
                        <p className='text-ink/70'>
                            Edumada réunit en un seul endroit les universités, écoles, centres de formation et établissements scolaires du pays, pour que
                            les étudiants et les familles puissent choisir en connaissance de cause.
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission et chiffres */}
            <section className='pt-0'>
                <div className='container mx-auto max-w-7xl px-4'>
                    <div className='grid gap-8 lg:grid-cols-2 lg:items-center'>
                        <div className='flex flex-col gap-4'>
                            <h2 className='font-bold'>Notre mission</h2>
                            <p className='text-ink/70'>
                                Choisir une formation est souvent difficile : les informations sont dispersées, incomplètes ou difficiles à comparer.
                                Edumada rassemble les fiches des établissements et de leurs formations, avec les mêmes repères pour tous.
                            </p>
                            <p className='text-ink/70'>
                                Notre objectif : que chaque jeune Malgache, où qu’il vive, puisse découvrir les possibilités qui s’offrent à lui et
                                contacter directement l’établissement qui l’intéresse.
                            </p>
                        </div>
                        <ul className='grid grid-cols-2 gap-4'>
                            {figures.map((figure) => (
                                <li
                                    key={figure.label}
                                    className='flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-5 shadow-[4px_4px_0_0_rgba(15,76,92,0.22)]'>
                                    <span className='flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                                        <Icon icon={figure.icon} className='text-2xl' />
                                    </span>
                                    <span className='text-3xl font-bold text-secondary'>{figure.value || '–'}</span>
                                    <span className='text-sm text-ink/70'>{figure.label}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Valeurs */}
            <section className='bg-secondary/[0.06]'>
                <div className='container mx-auto max-w-7xl px-4'>
                    <SectionHeader title='Ce qui nous guide' description='Quelques principes que nous appliquons sur tout le site.' />
                    <ul className='grid gap-5 sm:grid-cols-2 lg:grid-cols-4'>
                        {VALUES.map((value) => (
                            <li key={value.title} className='flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-6'>
                                <Icon icon={value.icon} className='text-3xl text-primary' />
                                <h3 className='text-lg font-semibold text-secondary'>{value.title}</h3>
                                <p className='text-sm text-ink/70'>{value.text}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Publics */}
            <section>
                <div className='container mx-auto max-w-7xl px-4'>
                    <SectionHeader title='Pour qui ?' description='Edumada s’adresse à tous ceux qui cherchent ou proposent une formation.' />
                    <ul className='grid gap-5 md:grid-cols-3'>
                        {AUDIENCES.map((audience) => (
                            <li key={audience.title}>
                                <Link
                                    href={audience.href}
                                    className='group flex h-full flex-col gap-3 rounded-xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40'>
                                    <Icon icon={audience.icon} className='text-3xl text-primary' />
                                    <h3 className='text-lg font-semibold text-secondary group-hover:text-primary duration-300'>{audience.title}</h3>
                                    <p className='text-sm text-ink/70'>{audience.text}</p>
                                    <span className='mt-auto inline-flex items-center gap-1 text-sm font-semibold text-primary'>
                                        {audience.cta}
                                        <Icon icon='tabler:chevron-right' className='text-base transition-transform duration-300 group-hover:translate-x-1' />
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Contact */}
            <section className='pt-0 pb-20'>
                <div className='container mx-auto max-w-7xl px-4'>
                    <div className='flex flex-col gap-4 rounded-2xl bg-secondary p-8 text-white md:flex-row md:items-center md:justify-between'>
                        <div>
                            <h2 className='text-2xl font-bold text-white'>Une question ou une idée ?</h2>
                            <p className='text-white/80'>L’équipe Edumada est à votre écoute.</p>
                        </div>
                        <ButtonLink href='/contact/' className='shrink-0'>
                            <Icon icon='tabler:mail' className='text-lg' />
                            Nous contacter
                        </ButtonLink>
                    </div>
                </div>
            </section>
        </>
    )
}
