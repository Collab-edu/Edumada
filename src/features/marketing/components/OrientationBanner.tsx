'use client'
import Image from 'next/image'
import { Icon } from '@/components/ui/icon'
import { ButtonLink } from '@/components/ui/form'
import { useT } from '@/i18n/client'

const PHOTO = 'https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?auto=format&fit=crop&w=600&h=700&q=75'

const POINTS = [
    { icon: 'tabler:route', text: 'Une démarche simple, en quatre étapes' },
    { icon: 'tabler:category', text: 'Les formations classées par domaine' },
    { icon: 'tabler:scale', text: 'Des fiches pour comparer les établissements' },
]

/** Bandeau vers la page Orientation : accroche, photo et points forts. */
export default function OrientationBanner() {
    const t = useT()
    return (
        <section>
            <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                <div className='relative grid overflow-hidden rounded-2xl bg-secondary md:grid-cols-[1fr_14rem_1fr] lg:grid-cols-[1fr_18rem_1fr]'>
                    <div className='mobile-center flex flex-col items-start gap-4 p-6 sm:p-8'>
                        <span className='inline-flex items-center gap-2 text-sm font-semibold text-primary'>
                            <Icon icon='tabler:compass' className='text-lg' />
                            Orientation
                        </span>
                        <h2 className='font-bold text-white'>{t('Un accompagnement à chaque étape')}</h2>
                        <p className='text-white/75'>{t('Des repères et des outils pour vous aider à faire le bon choix de formation.')}</p>
                        <ButtonLink href='/orientation/'>
                            {t('Commencer')}
                            <Icon icon='tabler:arrow-right' className='text-lg' />
                        </ButtonLink>
                    </div>

                    <div className='relative hidden md:block' aria-hidden='true'>
                        <div className='absolute -right-1 bottom-6 h-32 w-20 rotate-12 rounded-2xl bg-primary' />
                        <div className='absolute inset-x-2 bottom-0 top-8 overflow-hidden rounded-t-full border-4 border-b-0 border-white/15'>
                            <Image src={PHOTO} alt='' fill sizes='18rem' className='object-cover' />
                        </div>
                    </div>

                    <ul className='flex flex-col justify-center gap-4 border-t border-white/10 p-6 sm:p-8 md:border-t-0'>
                        {POINTS.map((point) => (
                            <li key={point.text} className='flex items-center gap-3 text-white'>
                                <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-primary'>
                                    <Icon icon={point.icon} className='text-xl' />
                                </span>
                                <span className='font-medium'>{t(point.text)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    )
}
