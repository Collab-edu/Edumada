'use client'
import Image from 'next/image'
import withBasePath from '@/lib/base-path'
import { useT } from '@/i18n/client'
import { ButtonLink } from '@/components/ui/form'

const RegisterCta = () => {
    const t = useT()
    return (
        <section id='register-section'>
            <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                <div className='relative overflow-hidden rounded-xl bg-secondary'>
                    <Image
                        src={withBasePath('/images/pages/inscription-banniere.webp')}
                        alt=''
                        aria-hidden='true'
                        fill
                        className='object-cover opacity-25 mix-blend-luminosity'
                    />
                    {/* Dégradé pour garder le texte lisible à gauche */}
                    <div
                        aria-hidden='true'
                        className='absolute inset-0 bg-gradient-to-r from-secondary via-secondary/85 to-secondary/40'
                    />
                    <div className='relative flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-10 md:px-16 text-center md:text-left'>
                        <p className='text-white font-bold leading-tight'>
                            <span className='text-3xl lg:text-4xl'>{t('Inscrivez-vous !')}</span>{' '}
                            <span className='block lg:inline text-lg lg:text-xl mt-1 lg:mt-0 lg:ml-2'>
                                {t('pour étudier à la rentrée académique 2026.')}
                            </span>
                        </p>
                        <ButtonLink href='/inscription/' variant='secondary' className='shrink-0 px-8'>
                            {t('S’inscrire maintenant')}
                        </ButtonLink>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default RegisterCta
