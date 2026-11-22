'use client'
import { useT } from '@/i18n/client'

const FIELDS = [
    'Le droit et les sciences politiques.',
    'L’informatique et les technologies.',
    'La gestion et l’administration.',
    'Le commerce et le marketing.',
    'La comptabilité et la finance.',
    'La médecine et les sciences de la santé.',
    'L’agriculture et l’environnement.',
    'Le tourisme et l’hôtellerie.',
    'Les sciences humaines et la communication.',
]

/** Page Orientation : les quatre repères pour choisir sa formation, en détail. */
export default function OrientationGuide() {
    const t = useT()
    return (
        <section className='pt-0 pb-12 lg:pb-16'>
            <div className='container mx-auto grid max-w-site gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-x-16 lg:px-8'>
                <div className='flex flex-col gap-4'>
                    <h2 className='text-2xl font-bold leading-tight text-secondary md:text-3xl'>{t('1. Identifier ses centres d’intérêt')}</h2>
                    <p className='text-black'>
                        {t('Avant de choisir une filière, prenez le temps de réfléchir aux matières que vous appréciez, aux activités qui vous motivent et aux métiers qui pourraient vous intéresser. Si vous aimez les sciences et les nouvelles technologies, vous pouvez explorer les formations en informatique, en ingénierie ou en sciences appliquées. Si vous êtes attiré par les activités commerciales et organisationnelles, les domaines de la gestion, du commerce, de la comptabilité et du marketing peuvent constituer des pistes intéressantes.')}
                    </p>
                </div>

                <div className='flex flex-col gap-4'>
                    <h2 className='text-2xl font-bold leading-tight text-secondary md:text-3xl'>{t('2. Découvrir les différentes filières après le bac')}</h2>
                    <p className='text-black'>
                        {t('Les possibilités d’études supérieures à Madagascar sont nombreuses. Selon votre niveau et votre projet, vous pouvez notamment vous orienter vers :')}
                    </p>
                    <ul className='flex flex-col gap-2 text-black'>
                        {FIELDS.map((field) => (
                            <li key={field} className='flex gap-3'>
                                <span aria-hidden='true' className='mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary' />
                                {t(field)}
                            </li>
                        ))}
                    </ul>
                    <p className='text-black'>
                        {t('Chaque établissement possède ses propres programmes et conditions d’admission. Il est donc important de consulter les informations avant de déposer une candidature.')}
                    </p>
                </div>

                <div className='flex flex-col gap-4'>
                    <h2 className='text-2xl font-bold leading-tight text-secondary md:text-3xl'>{t('3. Choisir entre études supérieures et formation professionnelle')}</h2>
                    <p className='text-black'>
                        {t('Les études universitaires permettent généralement d’approfondir des connaissances théoriques et pratiques dans un domaine sur plusieurs années. Les formations professionnelles sont davantage orientées vers l’acquisition de compétences spécifiques et la préparation à un métier. Le choix dépend notamment de votre objectif : obtenir un diplôme universitaire, développer une compétence technique, préparer une reconversion ou accéder au marché du travail.')}
                    </p>
                </div>

                <div className='flex flex-col gap-4'>
                    <h2 className='text-2xl font-bold leading-tight text-secondary md:text-3xl'>{t('4. Comparer les établissements avant de s’inscrire')}</h2>
                    <p className='text-black'>
                        {t('Avant de choisir une école ou une université, vérifiez plusieurs éléments : la reconnaissance du diplôme, les programmes enseignés, la durée des études, les frais de scolarité, les conditions d’admission et les possibilités de stage. N’hésitez pas à contacter directement les établissements pour obtenir des informations actualisées.')}
                    </p>
                </div>
            </div>
        </section>
    )
}
