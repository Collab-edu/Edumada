'use client'

import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { Icon } from '@/components/ui/icon'
import Signin from '@/features/auth/components/SignIn'
import SignUp from '@/features/auth/components/SignUp'
import { useSiteData } from '@/data/site-data'
import Link from 'next/link'
import { useAuth } from '@/features/auth/AuthProvider'
import { SPACE_HOME } from '@/features/auth/types'
import { cn } from '@/lib/utils'
import Logo from './Logo'
import HeaderLink from './HeaderLink'
import MobileHeaderLink from './MobileHeaderLink'
import { CONTACT, SOCIAL_LINKS } from '../social-links'

/** Bouton carré à icône de la barre principale (recherche, compte, favoris). */
const iconButtonClassName =
    'relative flex h-11 w-11 items-center justify-center rounded-lg bg-white text-secondary shadow-[0_6px_20px_-6px_rgba(15,76,92,0.25)] transition-colors duration-300 hover:bg-primary hover:text-white hover:cursor-pointer'

function IconButton({
    label,
    icon,
    href,
    onClick,
    badge,
    className,
}: {
    label: string
    icon: string
    href?: string
    onClick?: () => void
    badge?: number
    className?: string
}) {
    const content = (
        <>
            <Icon icon={icon} className='text-[22px]' />
            {!!badge && (
                <span className='absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-white'>
                    {badge}
                </span>
            )}
        </>
    )
    return href ? (
        <Link href={href} aria-label={label} title={label} className={cn(iconButtonClassName, className)}>
            {content}
        </Link>
    ) : (
        <button type='button' onClick={onClick} aria-label={label} title={label} className={cn(iconButtonClassName, className)}>
            {content}
        </button>
    )
}

/** Fenêtre modale (connexion, inscription). */
function Modal({ panelRef, label, onClose, children }: { panelRef: RefObject<HTMLDivElement | null>; label: string; onClose: () => void; children: ReactNode }) {
    return (
        <div className='fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50'>
            <div ref={panelRef} className='relative mx-4 w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl bg-white px-6 sm:px-8 pt-14 pb-8 text-center'>
                <button onClick={onClose} className='absolute top-0 right-0 mr-8 mt-8' aria-label={label}>
                    <Icon icon='material-symbols:close-rounded' width={24} height={24} className='text-black hover:text-primary inline-block hover:cursor-pointer' />
                </button>
                {children}
            </div>
        </div>
    )
}

const Header: React.FC = () => {
    const { data: headerData } = useSiteData('HeaderData')
    const { user, logout, favorites } = useAuth()

    const [navbarOpen, setNavbarOpen] = useState(false)
    const [sticky, setSticky] = useState(false)
    const [isSignInOpen, setIsSignInOpen] = useState(false)
    const [isSignUpOpen, setIsSignUpOpen] = useState(false)

    const signInRef = useRef<HTMLDivElement>(null)
    const signUpRef = useRef<HTMLDivElement>(null)
    const mobileMenuRef = useRef<HTMLDivElement>(null)

    const handleScroll = () => {
        setSticky(window.scrollY >= 10)
    }

    const handleClickOutside = (event: MouseEvent) => {
        if (signInRef.current && !signInRef.current.contains(event.target as Node)) {
            setIsSignInOpen(false)
        }
        if (signUpRef.current && !signUpRef.current.contains(event.target as Node)) {
            setIsSignUpOpen(false)
        }
        if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && navbarOpen) {
            setNavbarOpen(false)
        }
    }

    useEffect(() => {
        window.addEventListener('scroll', handleScroll)
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            window.removeEventListener('scroll', handleScroll)
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [navbarOpen, isSignInOpen, isSignUpOpen])

    useEffect(() => {
        if (isSignInOpen || isSignUpOpen || navbarOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
    }, [isSignInOpen, isSignUpOpen, navbarOpen])

    const openSignIn = () => setIsSignInOpen(true)

    return (
        <header className='fixed top-0 z-40 w-full'>
            {/* Barre supérieure (grand écran) : repères à gauche, réseaux et bouton établissement à droite. Masquée au défilement. */}
            <div className={cn('hidden lg:block bg-secondary text-white overflow-hidden transition-[max-height] duration-300', sticky ? 'max-h-0' : 'max-h-12')}>
                <div className='container mx-auto max-w-7xl px-4 flex h-10 items-center justify-between text-sm'>
                    <div className='flex items-center gap-8'>
                        <a href={`mailto:${CONTACT.email}`} className='flex items-center gap-2 hover:text-primary duration-300'>
                            <Icon icon='tabler:mail' className='text-lg text-primary' />
                            {CONTACT.email}
                        </a>
                        <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} className='flex items-center gap-2 hover:text-primary duration-300'>
                            <Icon icon='tabler:phone' className='text-lg text-primary' />
                            {CONTACT.phone}
                        </a>
                        <span className='flex items-center gap-2'>
                            <Icon icon='tabler:map-pin' className='text-lg text-primary' />
                            Partout à Madagascar
                        </span>
                    </div>
                    <div className='flex h-full items-center gap-5'>
                        <div className='flex items-center gap-4'>
                            {SOCIAL_LINKS.map((social) => (
                                <Link key={social.label} href={social.href} scroll={false} aria-label={social.label} className='text-white/90 hover:text-primary duration-300'>
                                    <Icon icon={social.icon} className='text-lg' />
                                </Link>
                            ))}
                        </div>
                        <Link href='/signup/?type=etablissement' className='flex h-full items-center bg-primary px-5 font-semibold hover:bg-primary/90 duration-300'>
                            Référencer mon établissement
                        </Link>
                    </div>
                </div>
            </div>

            {/* Barre principale : logo, menu, boutons à icônes */}
            <div className={cn('py-4 transition-all duration-300', sticky ? 'bg-white shadow-lg' : 'bg-transparent')}>
                <div className='container relative mx-auto max-w-7xl px-4 flex items-center justify-between'>
                    <Logo />
                    <nav className='hidden lg:flex grow justify-center items-center gap-8 mx-8'>
                        {headerData.map((item, index) => (
                            <HeaderLink key={index} item={item} />
                        ))}
                    </nav>
                    <div className='flex items-center gap-3'>
                        <IconButton label='Rechercher une formation' icon='tabler:search' href='/recherche' className='hidden sm:flex' />
                        {user && <IconButton label='Mon espace' icon='tabler:user' href={SPACE_HOME[user.role]} />}
                        {/* Favoris : espace étudiant (connexion d'abord pour un visiteur). */}
                        {user?.role === 'student' ? (
                            <IconButton label='Mes favoris' icon='tabler:heart' href='/espace/etudiant/favoris/' badge={favorites.length} className='hidden sm:flex' />
                        ) : (
                            !user && <IconButton label='Mes favoris' icon='tabler:heart' onClick={openSignIn} className='hidden sm:flex' />
                        )}
                        {user ? (
                            <button onClick={logout} className='hidden lg:block px-2 py-2 text-sm font-medium text-secondary hover:text-primary hover:cursor-pointer'>
                                Déconnexion
                            </button>
                        ) : (
                            <>
                                <button
                                    onClick={openSignIn}
                                    className='hidden lg:block bg-transparent text-primary border border-primary hover:bg-primary hover:text-white duration-300 px-6 py-2 rounded-lg hover:cursor-pointer'>
                                    Connexion
                                </button>
                                <button
                                    onClick={() => setIsSignUpOpen(true)}
                                    className='hidden lg:block bg-primary text-white border border-primary hover:bg-transparent hover:text-primary duration-300 px-6 py-2 rounded-lg font-medium hover:cursor-pointer'>
                                    Inscription
                                </button>
                                {/* Petit écran : accès au compte par l'icône (Connexion et Inscription sont aussi dans le menu). */}
                                <IconButton label='Connexion' icon='tabler:user' onClick={openSignIn} className='lg:hidden' />
                            </>
                        )}
                        <button onClick={() => setNavbarOpen(!navbarOpen)} className='block lg:hidden p-2 rounded-lg' aria-label='Ouvrir le menu'>
                            <span className='block w-6 h-0.5 bg-black'></span>
                            <span className='block w-6 h-0.5 bg-black mt-1.5'></span>
                            <span className='block w-6 h-0.5 bg-black mt-1.5'></span>
                        </button>
                    </div>
                </div>
            </div>

            {isSignInOpen && (
                <Modal panelRef={signInRef} label='Fermer la fenêtre de connexion' onClose={() => setIsSignInOpen(false)}>
                    <Signin onSuccess={() => setIsSignInOpen(false)} />
                </Modal>
            )}
            {isSignUpOpen && (
                <Modal panelRef={signUpRef} label="Fermer la fenêtre d'inscription" onClose={() => setIsSignUpOpen(false)}>
                    <SignUp studentOnly onSuccess={() => setIsSignUpOpen(false)} />
                </Modal>
            )}

            {navbarOpen && <div className='fixed top-0 left-0 w-full h-full bg-black/50 z-40' />}
            <div
                ref={mobileMenuRef}
                className={`lg:hidden fixed top-0 right-0 h-full w-full bg-white shadow-lg transform transition-transform duration-300 max-w-xs ${navbarOpen ? 'translate-x-0' : 'translate-x-full'} z-50`}>
                <div className='flex items-center justify-between p-4'>
                    <Logo />
                    <button onClick={() => setNavbarOpen(false)} className='bg-black/30 rounded-full p-1 text-white' aria-label='Fermer le menu'>
                        <Icon icon={'material-symbols:close-rounded'} width={24} height={24} />
                    </button>
                </div>
                <nav className='flex flex-col items-start p-4'>
                    {headerData.map((item, index) => (
                        <MobileHeaderLink key={index} item={item} />
                    ))}
                    <div className='mt-4 flex flex-col gap-4 w-full'>
                        {user ? (
                            <>
                                <Link
                                    href={SPACE_HOME[user.role]}
                                    onClick={() => setNavbarOpen(false)}
                                    className='inline-flex items-center justify-center gap-2 bg-primary text-white px-4 py-3 rounded-lg border border-primary font-medium'>
                                    <Icon icon='tabler:user-circle' className='text-xl' /> Mon espace
                                </Link>
                                <button
                                    onClick={() => {
                                        setNavbarOpen(false)
                                        logout()
                                    }}
                                    className='px-4 py-3 rounded-lg border border-secondary/20 font-medium text-secondary hover:cursor-pointer'>
                                    Déconnexion
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className='bg-primary text-white px-4 py-2 rounded-lg border border-primary hover:text-primary hover:bg-transparent hover:cursor-pointer transition duration-300 ease-in-out'
                                    onClick={() => {
                                        setIsSignInOpen(true)
                                        setNavbarOpen(false)
                                    }}>
                                    Connexion
                                </button>
                                <button
                                    className='bg-primary text-white px-4 py-2 rounded-lg border border-primary hover:text-primary hover:bg-transparent hover:cursor-pointer transition duration-300 ease-in-out'
                                    onClick={() => {
                                        setIsSignUpOpen(true)
                                        setNavbarOpen(false)
                                    }}>
                                    Inscription
                                </button>
                            </>
                        )}
                        <Link
                            href='/signup/?type=etablissement'
                            onClick={() => setNavbarOpen(false)}
                            className='px-4 py-2 text-center rounded-lg border border-secondary/30 font-medium text-secondary'>
                            Référencer mon établissement
                        </Link>
                    </div>
                </nav>
            </div>
        </header>
    )
}

export default Header
