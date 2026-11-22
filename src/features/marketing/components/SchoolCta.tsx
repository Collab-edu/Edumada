'use client'
import Image from 'next/image'
import Link, { useT } from '@/i18n/client'
import { usePathname } from 'next/navigation'
import { Icon } from '@/components/ui/icon'
import { useSiteData } from '@/data/site-data'
import { imageOr } from '@/lib/media'
import { Eyebrow } from '@/components/ui/eyebrow'
import { stripLocale } from '@/i18n/config'

/** Emplacement des photos rondes autour du texte (en % de la carte) et taille en px. */
const SPOTS = [
    { left: '5%', top: '18%', size: 56},
    { left: '15%', top: '6%', size: 72},
    { left: '11%', top: '50%', size: 60},
    { left: '4%', top: '78%', size: 48},
    { left: '17%', top: '74%', size: 56},
    { left: '81%', top: '8%', size: 68},
    { left: '92%', top: '24%', size: 48},
    { left: '86%', top: '44%', size: 60},
    { left: '79%', top: '80%', size: 44},
    { left: '89%', top: '72%', size: 64},
]

/** Pages où le bandeau ferait doublon : il y mène déjà. Le pied de page reprend alors sa marge normale. */
export const hidesSchoolCta = (pathname: string | null) => !!pathname && ['/inscription-etablissement', '/tarifs'].some((page) => stripLocale(pathname).startsWith(page))

const SchoolCta = () => {
    const t = useT()
    const pathname = usePathname()
    const { data: schools } = useSiteData('SchoolData')
    const photos = [...new Set(schools.map((school) => imageOr(school.imageSrc, 160)))].slice(0, SPOTS.length)

    if (hidesSchoolCta(pathname)) return null
    // Accueil : texte du plan SEO (« établissement de formation à Madagascar »).
    const isHome = stripLocale(pathname ?? '/') === '/'

    return (
        <section id='school-cta-section' className='relative z-10 -mb-28 pb-0'>
            <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                <div className='relative overflow-hidden rounded-xl border border-gray-200 bg-white px-6 py-12 sm:px-10 lg:py-16'>
                    {/* Photos d'établissements autour du texte, sur grand écran */}
                    <div className='pointer-events-none absolute inset-0 hidden lg:block' aria-hidden='true'>
                        {photos.map((src, i) => {
                            const spot = SPOTS[i % SPOTS.length]
                            return (
                                <div
                                    key={src}
                                    className='absolute overflow-hidden rounded-full border-4 border-white bg-cream shadow-md'
                                    style={{ left: spot.left, top: spot.top, width: spot.size, height: spot.size}}>
                                    <Image src={src} alt='' fill sizes='80px' className='object-cover' />
                                </div>
                            )
                        })}
                    </div>

                    <div className='relative mx-auto flex max-w-xl flex-col items-center gap-5 text-center'>
                        <Eyebrow>{schools.length > 0 ? t('Déjà {n} établissements sur Edumada', { n: schools.length }) : t('Espace établissements')}</Eyebrow>
                        {isHome ? (
                            <>
                                <h2 className='font-bold text-secondary'>{t('Vous êtes un établissement de formation à Madagascar\u00a0?')}</h2>
                                <p className='text-black leading-relaxed'>
                                    {t('Rejoignez Edumada et présentez votre établissement aux étudiants, aux parents et aux personnes à la recherche d’une formation. Publiez vos informations, mettez en valeur vos programmes et facilitez les échanges avec vos futurs étudiants.')}
                                </p>
                                <p className='text-black leading-relaxed'>
                                    {t('La création d’une fiche établissement est gratuite. Vous pouvez ainsi commencer à développer votre présence sur une plateforme dédiée à l’éducation et à la formation à Madagascar.')}
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className='font-bold text-secondary'>{t('Vous êtes un établissement de formation ?')}</h2>
                                <p className='text-black leading-relaxed'>
                                    {t('Présentez vos formations, améliorez votre visibilité et permettez aux futurs étudiants de découvrir votre établissement. La fiche est gratuite.')}
                                </p>
                            </>
                        )}
                        <div className='flex flex-col items-center gap-5 sm:flex-row'>
                            <Link
                                href='/tarifs/'
                                className='inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-4 font-bold text-white transition duration-300 hover:bg-primary/90'>
                                {t('Référencer mon établissement')}
                                <Icon icon='tabler:arrow-right' className='text-lg' />
                            </Link>
                            <Link
                                href='/avantages/'
                                className='font-semibold text-secondary underline underline-offset-4 decoration-secondary/40 transition-colors duration-300 hover:text-primary hover:decoration-primary'>
                                {t('Découvrir les avantages')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SchoolCta
