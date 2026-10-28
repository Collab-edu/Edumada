import SectionHeader from '@/components/ui/section-header'
import StaggerTestimonials, { type Testimonial } from '@/components/ui/stagger-testimonials'

/** Exemples en attendant de vrais témoignages d'utilisateurs (photos : 21st.dev). */
const TESTIMONIALS: Testimonial[] = [
    {
        tempId: 0,
        testimonial: 'J’ai comparé trois licences en informatique en une soirée, frais et conditions d’admission compris.',
        by: 'Fanja, bachelière à Antananarivo',
        imgSrc: 'https://cdn.21st.dev/assets/mirror/10/10e2bfa5446e5c116e269b649b5f5e0106d96643f0a903048f3a056e40c35cd8.jpg',
    },
    {
        tempId: 1,
        testimonial: 'Nous avons trouvé une crèche à dix minutes du bureau. La fiche donnait déjà les horaires et les tarifs.',
        by: 'Hery, papa de Mialy',
        imgSrc: 'https://cdn.21st.dev/assets/mirror/f0/f02fed36023656a5b5df6f247c83c96c53bfa9db5b98085cdee93ffc938a5f37.jpg',
    },
    {
        tempId: 2,
        testimonial: 'Depuis notre inscription sur Edumada, nous recevons des demandes d’étudiants de tout le pays.',
        by: 'Directeur d’un institut privé, Toamasina',
        imgSrc: 'https://cdn.21st.dev/assets/mirror/5b/5b5b2f3487692d40f629010ea6448d150907f780d8c262c4ca194b7386115c2d.jpg',
    },
    {
        tempId: 3,
        testimonial: 'Je voulais changer de métier rapidement : j’ai trouvé une formation certifiante de six mois en comptabilité.',
        by: 'Tahiry, en reconversion',
        imgSrc: 'https://cdn.21st.dev/assets/mirror/fa/fae47bb0faba45d1e0696b6557ca36c551a738c7d6e3950e82bb69dd2f963a72.jpg',
    },
    {
        tempId: 4,
        testimonial: 'La page Orientation m’a aidé à comprendre quelle série choisir pour viser médecine.',
        by: 'Andry, élève de seconde',
        imgSrc: 'https://cdn.21st.dev/assets/mirror/4f/4fb45af36b546e069b72527fdf4d904855a2b11b301fa738c8bc4d235595c4df.jpg',
    },
    {
        tempId: 5,
        testimonial: 'Enfin un site qui rassemble les écoles de Fianarantsoa au même endroit. Plus besoin de faire le tour de la ville.',
        by: 'Voahirana, maman de deux enfants',
        imgSrc: 'https://cdn.21st.dev/assets/mirror/b2/b2cd3e4ad761fd9954c265df5f86090c4f17c388c07f78332e75edfd7420f66a.jpg',
    },
    {
        tempId: 6,
        testimonial: 'Mettre à jour nos formations et nos frais prend quelques minutes depuis notre espace.',
        by: 'Responsable des admissions, Mahajanga',
        imgSrc: 'https://cdn.21st.dev/assets/mirror/a4/a4dd47498f54944edb9cd8095fb751847193faac01d922bae494e68d0cf90f4f.jpg',
    },
    {
        tempId: 7,
        testimonial: 'J’ai filtré par budget et par ville : en deux clics, il ne restait que les BTS à ma portée.',
        by: 'Rado, étudiant à Antsirabe',
        imgSrc: 'https://cdn.21st.dev/assets/mirror/9a/9a3f3f88dac2ceb807e98d4cbe99acc9813da6d0ce2859b1cf026747727e1667.jpg',
    },
    {
        tempId: 8,
        testimonial: 'Simple, clair et gratuit. Je l’ai conseillé à tous mes camarades de terminale.',
        by: 'Nomena, élève de terminale',
        imgSrc: 'https://cdn.21st.dev/assets/mirror/be/be1b67757a13dfec4386e8627236a7194c6bcfb07502dbd82f727f6ccac46bcd.jpg',
    },
    {
        tempId: 9,
        testimonial: 'Les fiches détaillées nous ont évité plusieurs déplacements inutiles avant l’inscription.',
        by: 'Lalaina, parent d’élève',
        imgSrc: 'https://cdn.21st.dev/assets/mirror/b4/b48ca5758f41e9f512fa264f7fde87a13a6149e94230111e949268b4780279cc.jpg',
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
            <StaggerTestimonials testimonials={TESTIMONIALS} />
        </section>
    )
}
