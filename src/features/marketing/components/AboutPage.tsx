import Image from 'next/image'
import { Icon } from '@/components/ui/icon'
import { CONTACT } from '@/components/layout/social-links'
import SchoolFaq from '@/features/etablissements/components/SchoolFaq'
import type { FaqItem } from '@/features/etablissements/faq'
import withBasePath from '@/lib/base-path'

const IMAGES = {
    student: 'https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?auto=format&fit=facearea&facepad=2&w=400&h=400&q=80',
    group: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&h=600&q=70',
    campus: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=70',
    workshop: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=70',
}

const FAQ: { title: string; id: string; items: FaqItem[] }[] = [
    {
        title: 'Accès et utilisation',
        id: 'acces',
        items: [
            {
                question: 'Edumada est-il gratuit ?',
                answer: 'Oui. Rechercher, comparer les formations et contacter un établissement est gratuit pour les étudiants et les parents.',
            },
            {
                question: 'Dois-je créer un compte ?',
                answer: 'Non pour consulter le site. Un compte gratuit est demandé seulement pour postuler à une formation et suivre votre dossier.',
            },
            {
                question: 'Dans quelles villes Edumada est-il disponible ?',
                answer: 'Partout à Madagascar. On trouve déjà des établissements à Antananarivo, Antsirabe, Antsiranana, Fianarantsoa, Mahajanga, Toamasina et Toliara.',
            },
        ],
    },
    {
        title: 'Recherche de formation',
        id: 'recherche',
        items: [
            {
                question: 'Comment chercher une formation ?',
                answer: 'Utilisez la page Recherche : filtrez par domaine, ville, durée ou budget, puis ouvrez la fiche de la formation qui vous intéresse.',
            },
            {
                question: 'Quels types d’établissements trouve-t-on ?',
                answer: 'Universités et grandes écoles, centres de formation professionnelle, crèches, écoles primaires, collèges et lycées.',
            },
            {
                question: 'Les informations sont-elles à jour ?',
                answer: 'Les fiches sont tenues par les établissements eux-mêmes. Vérifiez toujours les dates et les frais auprès de l’établissement avant de vous inscrire.',
            },
        ],
    },
    {
        title: 'Établissements',
        id: 'etablissements',
        items: [
            {
                question: 'Comment référencer mon établissement ?',
                answer: 'Créez un compte établissement, complétez votre fiche puis envoyez-la : l’équipe Edumada la vérifie avant sa mise en ligne.',
            },
            {
                question: 'Combien ça coûte ?',
                answer: 'La formule Gratuit permet de publier jusqu’à 3 offres. Les formules Pro et Premium ajoutent plus d’offres et de visibilité.',
            },
        ],
    },
]

/** Page À propos : citation, présentation d'Edumada et questions fréquentes. */
export default function AboutPage() {
    return (
        <>
            {/* Citation */}
            <section className='pt-28 pb-10 sm:pt-32'>
                <div className='container mx-auto max-w-7xl px-4'>
                    <div className='grid gap-10 lg:grid-cols-2 lg:items-center'>
                        <div className='relative flex flex-col gap-4'>
                            <Icon icon='tabler:quote' className='text-6xl text-secondary/20' />
                            <h1 className='text-3xl md:text-5xl font-bold text-secondary'>
                                Nous croyons que trouver sa formation à Madagascar <span className='text-primary'>ne devrait pas être difficile.</span>
                            </h1>
                            <p className='text-ink/70'>L’équipe Edumada</p>
                        </div>
                        <div className='relative mx-auto h-72 w-72 sm:h-80 sm:w-80'>
                            <div className='absolute left-0 top-0 h-44 w-44 overflow-hidden rounded-full border-4 border-white bg-cream shadow-lg sm:h-48 sm:w-48'>
                                <Image src={IMAGES.student} alt='Étudiante' fill sizes='200px' className='object-cover' />
                            </div>
                            <div className='absolute bottom-0 right-0 h-44 w-44 overflow-hidden rounded-full border-4 border-white bg-cream shadow-lg sm:h-48 sm:w-48'>
                                <Image src={IMAGES.group} alt='Étudiants' fill sizes='200px' className='object-cover' />
                            </div>
                            <div className='absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white p-3 shadow-md'>
                                <Image src={withBasePath('/images/logo/edumada-logo.svg')} alt='Edumada' width={828} height={270} className='h-auto w-full' />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Présentation */}
            <section>
                <div className='container mx-auto max-w-7xl px-4 flex flex-col gap-16'>
                    <div className='grid gap-8 lg:grid-cols-2 lg:items-center'>
                        <div className='flex flex-col gap-4'>
                            <h2 className='font-bold'>Edumada, c’est quoi ?</h2>
                            <p className='border-l-4 border-primary pl-4 font-semibold text-secondary'>
                                La plateforme pour trouver sa formation ou son établissement à Madagascar.
                            </p>
                            <p className='text-ink/70'>
                                Edumada réunit les universités, écoles, centres de formation et établissements scolaires du pays. Comparez la durée, le
                                coût, le diplôme et les conditions d’admission, puis contactez directement l’établissement qui vous intéresse.
                            </p>
                        </div>
                        <div className='relative h-60 overflow-hidden rounded-2xl shadow-[6px_6px_0_0_rgba(15,76,92,0.22)] sm:h-80'>
                            <Image src={IMAGES.campus} alt='Campus universitaire' fill sizes='(min-width: 1024px) 50vw, 100vw' className='object-cover' />
                        </div>
                    </div>

                    <div className='grid gap-8 lg:grid-cols-2 lg:items-center'>
                        <div className='flex flex-col gap-4 lg:order-2'>
                            <h2 className='font-bold'>Pourquoi Edumada ?</h2>
                            <p className='border-l-4 border-primary pl-4 font-semibold text-secondary'>
                                Parce que choisir sa formation ne devrait pas se faire au hasard.
                            </p>
                            <p className='text-ink/70'>
                                À Madagascar, les informations sur les formations sont souvent dispersées entre réseaux sociaux, affiches et bouche à
                                oreille. Nous avons créé Edumada pour les rassembler au même endroit, présentées de la même façon, et accessibles depuis
                                un simple téléphone.
                            </p>
                        </div>
                        <div className='relative h-60 overflow-hidden rounded-2xl shadow-[6px_6px_0_0_rgba(15,76,92,0.22)] sm:h-80 lg:order-1'>
                            <Image src={IMAGES.workshop} alt='Apprenants en formation' fill sizes='(min-width: 1024px) 50vw, 100vw' className='object-cover' />
                        </div>
                    </div>
                </div>
            </section>

            {/* Questions fréquentes */}
            <section className='pb-20'>
                <div className='container mx-auto max-w-7xl px-4'>
                    <div className='grid gap-8 lg:grid-cols-[16rem_1fr] lg:gap-12'>
                        <div className='flex flex-col gap-4 lg:sticky lg:top-28 lg:self-start'>
                            <h2 className='font-bold'>Questions fréquentes</h2>
                            <p className='text-ink/70'>Chercher, comparer, référencer : l’essentiel en quelques réponses.</p>
                            <ul className='flex flex-wrap gap-2 lg:flex-col lg:gap-1'>
                                {FAQ.map((group) => (
                                    <li key={group.id}>
                                        <a
                                            href={`#${group.id}`}
                                            className='inline-block rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-secondary hover:text-primary duration-300 lg:border-0 lg:bg-transparent lg:px-0'>
                                            {group.title}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className='flex flex-col gap-10'>
                            {FAQ.map((group) => (
                                <div key={group.id} id={group.id} className='flex flex-col gap-4 scroll-mt-28'>
                                    <h3 className='text-lg font-semibold text-secondary'>{group.title}</h3>
                                    <SchoolFaq items={group.items} />
                                </div>
                            ))}
                            <p className='text-ink/70'>
                                Pas trouvé votre réponse ? Écrivez-nous :{' '}
                                <a href={`mailto:${CONTACT.email}`} className='font-semibold text-primary underline underline-offset-4'>
                                    {CONTACT.email}
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}
