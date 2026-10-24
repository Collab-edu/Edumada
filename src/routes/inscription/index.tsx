import SignUp from '@/features/auth/components/SignUp'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Inscription',
}

const SignupPage = () => {
    return (
        <>
            <section className='px-4 pt-32 pb-10 sm:pt-40'>
                <div className='mx-auto flex max-w-3xl flex-col items-center gap-5 text-center'>
                    <h1 className='text-4xl font-bold text-secondary md:text-6xl'>
                        Créez votre compte, <span className='block text-primary'>c&apos;est gratuit</span>
                    </h1>
                    <p className='max-w-2xl text-black'>
                        Enregistrez les formations qui vous intéressent, contactez les établissements et suivez vos candidatures depuis un seul
                        espace.
                    </p>
                </div>
            </section>

            <div className='mx-auto w-full max-w-xl px-4 pb-20'>
                <div className='rounded-2xl bg-white px-6 py-8 shadow-sm ring-1 ring-gray-100 sm:px-10 sm:py-10'>
                    <SignUp />
                </div>
            </div>
        </>
    )
}

export default SignupPage
