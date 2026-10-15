'use client'
import Link from 'next/link'
import { useState } from 'react'
import SocialSignIn from './SocialSignIn'
import Logo from '@/components/layout/header/Logo'
import Loader from '@/components/ui/loader'

const Signin = () => {
    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
        checkboxToggle: false,
    })
    // La connexion n'est pas encore branchée : il n'y a pas de backend d'authentification.
    const [loading] = useState(false)

    return (
        <>
            <div className='mb-10 text-center mx-auto inline-block max-w-[160px]'>
                <Logo />
            </div>

            <SocialSignIn />

            <span className="z-1 relative my-8 block text-center before:content-[''] before:absolute before:h-px before:w-[40%] before:bg-black/20 before:left-0 before:top-3 after:content-[''] after:absolute after:h-px after:w-[40%] after:bg-black/20 after:top-3 after:right-0">
                <span className='text-body-secondary relative z-10 inline-block px-3 text-base text-black'>
                    OR
                </span>
            </span>

            <form onSubmit={(e) => e.preventDefault()}>
                <div className='mb-[22px]'>
                    <input
                        type='email'
                        placeholder='Email'
                        onChange={(e) =>
                            setLoginData({ ...loginData, email: e.target.value })
                        }
                        className='w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black'
                    />
                </div>
                <div className='mb-[22px]'>
                    <input
                        type='password'
                        placeholder='Password'
                        onChange={(e) =>
                            setLoginData({ ...loginData, password: e.target.value })
                        }
                        className='w-full rounded-md border border-solid bg-transparent px-5 py-3 text-base text-dark outline-hidden transition border-gray-200 placeholder:text-black/30 focus:border-primary focus-visible:shadow-none text-black'
                    />
                </div>
                <div className='mb-9'>
                    <button
                        // onClick={loginUser}
                        type='submit'
                        className='bg-primary w-full py-3 rounded-lg text-18 font-medium border text-white border-primary hover:text-primary hover:bg-transparent hover:cursor-pointer transition duration-300 ease-in-out'>
                        Sign In {loading && <Loader />}
                    </button>
                </div>
            </form>

            <Link
                href='/'
                className='mb-2 inline-block text-base text-primary hover:underline'>
                Forgot Password?
            </Link>
            <p className='text-body-secondary text-black text-base'>
                Not a member yet?{' '}
                <Link href='/' className='text-primary hover:underline'>
                    Sign Up
                </Link>
            </p>
        </>
    )
}

export default Signin
