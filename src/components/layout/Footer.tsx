'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Icon } from '@/components/ui/icon'
import withBasePath from '@/lib/base-path'
import { useSiteData } from '@/data/site-data'
import { usePathname } from 'next/navigation'
import { hidesSchoolCta } from '@/features/marketing/components/SchoolCta'
import { SOCIAL_LINKS } from './social-links'

/** Pied de page : newsletter en haut, logo et colonnes de liens, puis copyright et réseaux sociaux. */
const Footer = () => {
    const { data: footerlink } = useSiteData('FooterLinkData')
    // Le bandeau « établissements » chevauche le haut du pied de page, sauf là où il est masqué.
    const overlapped = !hidesSchoolCta(usePathname())

    return (
        <footer className='bg-secondary' id='first-section'>
            <div className={`container mx-auto max-w-7xl px-4 pb-8 ${overlapped ? 'pt-44' : 'pt-16'}`}>
                {/* Newsletter */}
                <div className='flex flex-col gap-6 border-b border-white/10 pb-10 md:flex-row md:items-center md:justify-between'>
                    <div className='flex flex-col gap-1'>
                        <h3 className='text-xl font-semibold text-white'>Restez informé</h3>
                        <p className='text-white/70'>Nouvelles formations et dates d&apos;inscription, directement par e-mail. Pas de spam.</p>
                    </div>
                    <form className='flex w-full flex-col gap-2 sm:flex-row md:w-auto' onSubmit={(e) => e.preventDefault()}>
                        <input
                            type='email'
                            name='email'
                            aria-label='Adresse e-mail'
                            placeholder='Votre adresse e-mail'
                            autoComplete='email'
                            className='w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/50 focus:border-white/50 focus:outline-hidden md:w-72'
                        />
                        <button type='submit' className='shrink-0 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-primary/90 hover:cursor-pointer'>
                            S&apos;abonner
                        </button>
                    </form>
                </div>

                {/* Logo et liens */}
                <div className='grid gap-10 py-12 lg:grid-cols-12'>
                    <div className='flex flex-col gap-4 lg:col-span-4'>
                        <Image src={withBasePath('/images/logo/edumada-logo-white.svg')} alt='Edumada' width={828} height={270} className='h-12 w-auto self-start' />
                        <p className='max-w-xs text-white/70'>Trouvez votre formation à Madagascar et construisez votre avenir.</p>
                    </div>
                    <div className='grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8'>
                        {footerlink.map((section) => (
                            <div key={section.section}>
                                <h3 className='mb-4 text-sm font-semibold text-white'>{section.section}</h3>
                                <ul className='flex flex-col gap-1'>
                                    {section.links.map((item) => (
                                        <li key={item.label}>
                                            <Link
                                                href={item.href}
                                                scroll={item.href !== '/'}
                                                className='inline-block py-1.5 text-sm text-white/60 transition-colors duration-300 hover:text-white'>
                                                {item.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Copyright et réseaux sociaux */}
                <div className='flex flex-col-reverse gap-6 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between'>
                    {/* L'année est calculée au rendu : on tolère l'écart entre build statique et navigateur. */}
                    <p className='!text-sm text-white/60' suppressHydrationWarning>
                        © {new Date().getFullYear()} Edumada. Tous droits réservés.
                    </p>
                    <div className='flex gap-3'>
                        {SOCIAL_LINKS.map((social) => (
                            <Link
                                key={social.label}
                                href={social.href}
                                scroll={false}
                                aria-label={social.label}
                                className='flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-white transition-colors duration-300 hover:border-white hover:bg-white hover:text-secondary'>
                                <Icon icon={social.icon} className='text-xl' />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
