'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Icon } from '@/components/ui/icon'
import withBasePath from '@/lib/base-path'
import { useSiteData } from '@/data/site-data'
import { SOCIAL_LINKS } from './social-links'


const Footer = () => {
    const { data: footerlink } = useSiteData('FooterLinkData')

    return (
        <div className='bg-secondary' id='first-section'>
            <div className='container pt-60 pb-10'>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-16 xl:gap-8'>
                    <div className='col-span-4 flex flex-col gap-5'>
                        <div>
                            <Image
                                src={withBasePath('/images/logo/edumada-logo-white.svg')}
                                alt='Edumada'
                                width={828}
                                height={270}
                                className='h-14 w-auto'
                            />
                        </div>
                        <p className='text-white text-base font-medium leading-7'>
                            Trouvez votre formation à Madagascar <br /> et construisez votre avenir.
                        </p>
                        <div className='flex gap-4'>
                            {SOCIAL_LINKS.map((social) => (
                                <Link
                                    key={social.label}
                                    href={social.href}
                                    scroll={false}
                                    aria-label={social.label}
                                    className='bg-white/20 rounded-full p-2 text-white hover:bg-cream hover:text-primary duration-300'>
                                    <Icon icon={social.icon} className='text-2xl inline-block' />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* CLOUMN-2/3 */}
                    <div className='col-span-4'>
                        <div className='flex gap-20'>
                            {footerlink.map((product, i) => (
                                <div key={i} className='group relative col-span-2'>
                                    <p className='text-white text-base font-semibold mb-9'>
                                        {product.section}
                                    </p>
                                    <ul>
                                        {product.links.map((item, i) => (
                                            <li key={i} className='mb-1'>
                                                <Link
                                                    href={item.href}
                                                    scroll={item.href !== "/"}
                                                    className='inline-block py-2 text-white/60 hover:text-white text-sm font-normal'>
                                                    {item.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* CLOUMN-4 */}

                    <div className='col-span-4'>
                        <h3 className='text-white text-xl font-semibold mb-6'>
                            Restez informé
                        </h3>
                        <div className='relative text-white focus-within:text-white flex flex-row-reverse w-[50%] lg:w-full'>
                            <input
                                type='email'
                                name='email'
                                aria-label='Adresse e-mail'
                                className='py-4 text-sm w-full text-white bg-white/15 rounded-md pl-4 focus:outline-hidden bg-emailbg focus:text-white placeholder:text-white/60'
                                placeholder='Votre adresse e-mail'
                                autoComplete='email'
                            />
                            <div className='absolute inset-y-0 right-0 flex items-center pr-2'>
                                <button
                                    type='submit'
                                    aria-label="S'abonner"
                                    className='p-1 focus:outline-hidden focus:shadow-outline'>
                                    <Icon
                                        icon='tabler:send'
                                        className='text-white text-2xl inline-block me-2'
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='py-3'>
                {/* L'année est calculée au rendu : on tolère l'écart entre build statique et navigateur. */}
                <p className='text-center text-white/60' suppressHydrationWarning>
                    © {new Date().getFullYear()} Edumada. Tous droits réservés.
                </p>
            </div>
        </div>
    )
}

export default Footer
