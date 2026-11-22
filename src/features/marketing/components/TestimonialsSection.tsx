import SectionHeader from '@/components/ui/section-header'
import withBasePath from '@/lib/base-path'
import TestimonialMarquee, { type Testimonial } from '@/components/ui/marquee-01'

/** Exemples en attendant de vrais témoignages d'utilisateurs (photos : 21st.dev). */
const TESTIMONIALS: Testimonial[] = [
    {
        testimonial: 'J’ai comparé trois licences en informatique en une soirée, frais et conditions d’admission compris.',
        by: 'Fanja, bachelière à Antananarivo',
        imgSrc: withBasePath('/images/avis/avis-1.webp'),
    },
    {
        testimonial: 'Nous avons trouvé une crèche à dix minutes du bureau. La fiche donnait déjà les horaires et les tarifs.',
        by: 'Hery, papa de Mialy',
        imgSrc: withBasePath('/images/avis/avis-2.webp'),
    },
    {
        testimonial: 'Depuis notre inscription sur Edumada, nous recevons des demandes d’étudiants de tout le pays.',
        by: 'Directeur d’un institut privé, Toamasina',
        imgSrc: withBasePath('/images/avis/avis-3.webp'),
    },
    {
        testimonial: 'Je voulais changer de métier rapidement : j’ai trouvé une formation certifiante de six mois en comptabilité.',
        by: 'Tahiry, en reconversion',
        imgSrc: withBasePath('/images/avis/avis-4.webp'),
    },
    {
        testimonial: 'La page Orientation m’a aidé à comprendre quelle série choisir pour viser médecine.',
        by: 'Andry, élève de seconde',
        imgSrc: withBasePath('/images/avis/avis-5.webp'),
    },
    {
        testimonial: 'Enfin un site qui rassemble les écoles de Fianarantsoa au même endroit. Plus besoin de faire le tour de la ville.',
        by: 'Voahirana, maman de deux enfants',
        imgSrc: withBasePath('/images/avis/avis-6.webp'),
    },
    {
        testimonial: 'Mettre à jour nos formations et nos frais prend quelques minutes depuis notre espace.',
        by: 'Responsable des admissions, Mahajanga',
        imgSrc: withBasePath('/images/avis/avis-7.webp'),
    },
    {
        testimonial: 'J’ai filtré par budget et par ville : en deux clics, il ne restait que les BTS à ma portée.',
        by: 'Rado, étudiant à Antsirabe',
        imgSrc: withBasePath('/images/avis/avis-8.webp'),
    },
    {
        testimonial: 'Simple, clair et gratuit. Je l’ai conseillé à tous mes camarades de terminale.',
        by: 'Nomena, élève de terminale',
        imgSrc: withBasePath('/images/avis/avis-9.webp'),
    },
    {
        testimonial: 'Les fiches détaillées nous ont évité plusieurs déplacements inutiles avant l’inscription.',
        by: 'Lalaina, parent d’élève',
        imgSrc: withBasePath('/images/avis/avis-10.webp'),
    },
]

/** Bas de l'accueil : ce que disent les élèves, les parents et les établissements. */
export default function TestimonialsSection() {
    return (
        <section className='overflow-hidden'>
            <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                <SectionHeader
                    title='Ils ont trouvé leur voie avec Edumada'
                    description='Élèves, parents et établissements partagent leur expérience.'
                    className='text-center sm:justify-center'
                />
            </div>
            <TestimonialMarquee testimonials={TESTIMONIALS} />
        </section>
    )
}
