import SignUp from '@/features/auth/components/SignUp'
import { Metadata } from 'next'
import { T } from '@/i18n/T'

export const metadata: Metadata = {
    title: 'Inscription',
}

const SignupPage = () => {
    return (
        <>
            <section className='px-4 pt-32 pb-10 sm:pt-40'>
                <div className='mx-auto flex max-w-3xl flex-col items-center gap-5 text-center'>
                    <h1 className='text-4xl font-bold text-secondary md:text-6xl'>
                        <T>Créez votre compte,</T> <span className='block text-primary'><T>c&apos;est gratuit</T></span>
                    </h1>
                    <p className='max-w-2xl text-black'>
                        <T>Enregistrez les formations qui vous intéressent, contactez les établissements et suivez vos candidatures depuis un seul espace.</T>
                    </p>
                </div>
            </section>

            <div className='mx-auto w-full max-w-xl px-4 pb-20'>
                <div className='rounded-xl bg-white px-6 py-8 shadow-sm ring-1 ring-gray-100 sm:px-10 sm:py-10'>
                    <SignUp />
                </div>
            </div>
        </>
    )
}

export default SignupPage
