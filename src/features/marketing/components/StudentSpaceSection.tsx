'use client'
import Image from 'next/image'
import { Icon } from '@/components/ui/icon'
import { ButtonLink } from '@/components/ui/form'
import withBasePath from '@/lib/base-path'
import { useT } from '@/i18n/client'

const FEATURES = [
    { icon: 'tabler:heart', text: 'Enregistrez vos formations favorites' },
    { icon: 'tabler:file-check', text: 'Suivez vos demandes et candidatures' },
    { icon: 'tabler:message-circle', text: 'Retrouvez les réponses des établissements' },
    { icon: 'tabler:user-cog', text: 'Gérez votre profil en toute simplicité' },
]

/** Section « Espace étudiant » : aperçu sur téléphone et ce que l'on peut y faire. */
export default function StudentSpaceSection() {
    const t = useT()

    return (
        <section>
            <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                <div className='grid items-center gap-10 lg:grid-cols-2 lg:gap-16'>
                    {/* Aperçu de l'espace étudiant : vraie image de téléphone, comme sur l'accueil et la page Avantages. */}
                    <div className='relative mx-auto w-full max-w-[17rem] py-4 lg:max-w-[21rem]'>
                        <div aria-hidden='true' className='absolute top-1/4 -left-12 h-[62%] w-[120%] rotate-[-14deg] rounded-[3.5rem] bg-primary/15' />
                        <Image
                            src={withBasePath('/images/espace-etudiant/espace-etudiant.webp')}
                            alt={t('Espace étudiant Edumada sur téléphone : recherche, démarches suivies et formations favorites')}
                            width={600}
                            height={967}
                            sizes='(min-width: 1024px) 336px, 272px'
                            className='relative h-auto w-full'
                        />
                    </div>

                    {/* Avantages */}
                    <div className='flex flex-col gap-6 rounded-xl border border-primary/15 bg-cream/60 p-6 sm:p-8'>
                        <div className='flex flex-col gap-3'>
                            <span className='flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white'>
                                <Icon icon='tabler:layout-dashboard' className='text-2xl' />
                            </span>
                            <h2 className='font-bold'>{t('Votre espace étudiant')}</h2>
                            <p className='text-black'>{t('Un compte gratuit pour garder vos formations à portée de main et suivre vos démarches.')}</p>
                        </div>
                        <ul className='flex flex-col gap-4'>
                            {FEATURES.map((feature) => (
                                <li key={feature.text} className='flex items-center gap-3 font-medium text-secondary'>
                                    <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-sm'>
                                        <Icon icon={feature.icon} className='text-lg' />
                                    </span>
                                    {t(feature.text)}
                                </li>
                            ))}
                        </ul>
                        <ButtonLink href='/inscription/' className='w-full justify-center sm:w-auto sm:self-start'>
                            {t('Créer mon compte gratuit')}
                        </ButtonLink>
                    </div>
                </div>
            </div>
        </section>
    )
}
