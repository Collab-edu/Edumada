'use client'

import { useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/ui/icon'
import Signin from '@/features/auth/components/SignIn'
import SignUp from '@/features/auth/components/SignUp'
import { useSiteData } from '@/data/site-data'
import Link from 'next/link'
import { useAuth } from '@/features/auth/AuthProvider'
import { SPACE_HOME } from '@/features/auth/types'
import Logo from './Logo'
import HeaderLink from './HeaderLink'
import MobileHeaderLink from './MobileHeaderLink'

const Header: React.FC = () => {
    const { data: headerData } = useSiteData('HeaderData')
    const { user, logout } = useAuth()

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
        if (
            signInRef.current &&
            !signInRef.current.contains(event.target as Node)
        ) {
            setIsSignInOpen(false)
        }
        if (
            signUpRef.current &&
            !signUpRef.current.contains(event.target as Node)
        ) {
            setIsSignUpOpen(false)
        }
        if (
            mobileMenuRef.current &&
            !mobileMenuRef.current.contains(event.target as Node) &&
            navbarOpen
        ) {
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

    return (
        <header
            className={`fixed top-0 z-40 w-full transition-all duration-300 ${sticky ? ' shadow-lg bg-white py-4' : 'shadow-none py-4'
                }`}>
            <div>
                <div className='container relative mx-auto max-w-7xl px-4 flex items-center justify-between'>
                    <Logo />
                    <nav className='hidden lg:flex grow justify-center items-center gap-8 mx-8 xl:mx-0 xl:absolute xl:left-1/2 xl:-translate-x-1/2'>
                        {headerData.map((item, index) => (
                            <HeaderLink key={index} item={item} />
                        ))}
                    </nav>
                    <div className='flex items-center gap-4'>
                        {user ? (
                            <div className='hidden lg:flex items-center gap-3'>
                                <Link
                                    href={SPACE_HOME[user.role]}
                                    className='inline-flex items-center gap-2 bg-primary text-white border border-primary hover:bg-transparent hover:text-primary duration-300 px-5 py-2 rounded-lg font-medium'>
                                    <Icon icon='tabler:user-circle' className='text-xl' /> Mon espace
                                </Link>
                                <button
                                    onClick={logout}
                                    className='px-3 py-2 font-medium text-secondary hover:text-primary hover:cursor-pointer'>
                                    Déconnexion
                                </button>
                            </div>
                        ) : (
                        <>
                        <button
                            className='hidden lg:block bg-transparent text-primary border hover:bg-primary border-primary hover:text-white duration-300 px-6 py-2 rounded-lg hover:cursor-pointer'
                            onClick={() => {
                                setIsSignInOpen(true)
                            }}>
                            Connexion
                        </button>
                        {isSignInOpen && (
                            <div className='fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50'>
                                <div
                                    ref={signInRef}
                                    className='relative mx-4 w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl px-6 sm:px-8 pt-14 pb-8 text-center bg-white'>
                                    <button
                                        onClick={() => setIsSignInOpen(false)}
                                        className='absolute top-0 right-0 mr-8 mt-8 dark:invert'
                                        aria-label='Fermer la fenêtre de connexion'>
                                        <Icon
                                            icon='material-symbols:close-rounded'
                                            width={24}
                                            height={24}
                                            className='text-black hover:text-primary inline-block hover:cursor-pointer'
                                        />
                                    </button>
                                    <Signin onSuccess={() => setIsSignInOpen(false)} />
                                </div>
                            </div>
                        )}
                        <button
                            className='hidden lg:block bg-primary text-white text-base font-medium hover:bg-transparent duration-300 hover:text-primary border border-primary px-6 py-2 rounded-lg hover:cursor-pointer'
                            onClick={() => {
                                setIsSignUpOpen(true)
                            }}>
                            Inscription
                        </button>
                        {isSignUpOpen && (
                            <div className='fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center z-50'>
                                <div
                                    ref={signUpRef}
                                    className='relative mx-4 w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl bg-white px-6 sm:px-8 pt-14 pb-8 text-center'>
                                    <button
                                        onClick={() => setIsSignUpOpen(false)}
                                        className='absolute top-0 right-0 mr-8 mt-8 dark:invert'
                                        aria-label="Fermer la fenêtre d'inscription">
                                        <Icon
                                            icon='material-symbols:close-rounded'
                                            width={24}
                                            height={24}
                                            className='text-black hover:text-primary inline-block hover:cursor-pointer'
                                        />
                                    </button>
                                    <SignUp onSuccess={() => setIsSignUpOpen(false)} />
                                </div>
                            </div>
                        )}
                        </>
                        )}
                        <button
                            onClick={() => setNavbarOpen(!navbarOpen)}
                            className='block lg:hidden p-2 rounded-lg'
                            aria-label='Ouvrir le menu'>
                            <span className='block w-6 h-0.5 bg-black'></span>
                            <span className='block w-6 h-0.5 bg-black mt-1.5'></span>
                            <span className='block w-6 h-0.5 bg-black mt-1.5'></span>
                        </button>
                    </div>
                </div>
                {navbarOpen && (
                    <div className='fixed top-0 left-0 w-full h-full bg-black/50 z-40' />
                )}
                <div
                    ref={mobileMenuRef}
                    className={`lg:hidden fixed top-0 right-0 h-full w-full bg-white shadow-lg transform transition-transform duration-300 max-w-xs ${navbarOpen ? 'translate-x-0' : 'translate-x-full'
                        } z-50`}>
                    <div className='flex items-center justify-between p-4'>
                        <h2 className='text-[26px] font-bold text-midnight_text'>
                            <Logo />
                        </h2>
                        {/*  */}
                        <button
                            onClick={() => setNavbarOpen(false)}
                            className='bg-black/30 rounded-full p-1 text-white'
                            aria-label='Fermer le menu'>
                            <Icon
                                icon={'material-symbols:close-rounded'}
                                width={24}
                                height={24}
                            />
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
                                className='bg-primary text-white px-4 py-2 rounded-lg border  border-primary hover:text-primary hover:bg-transparent hover:cursor-pointer transition duration-300 ease-in-out'
                                onClick={() => {
                                    setIsSignInOpen(true)
                                    setNavbarOpen(false)
                                }}>
                                Connexion
                            </button>
                            <button
                                className='bg-primary text-white px-4 py-2 rounded-lg border  border-primary hover:text-primary hover:bg-transparent hover:cursor-pointer transition duration-300 ease-in-out'
                                onClick={() => {
                                    setIsSignUpOpen(true)
                                    setNavbarOpen(false)
                                }}>
                                Inscription
                            </button>
                            </>
                            )}
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    )
}

export default Header
