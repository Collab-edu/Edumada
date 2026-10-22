import ForgotPassword from '@/features/auth/components/ForgotPassword'
import Breadcrumb from '@/components/ui/breadcrumb'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Mot de passe oublié',
}

export default function Page() {
    return (
        <>
            <Breadcrumb pageName='Mot de passe oublié' />

            <div className='mx-auto w-full max-w-md px-4 pb-20'>
                <div className='rounded-2xl bg-white px-6 py-8 shadow-sm ring-1 ring-gray-100 sm:px-8'>
                    <ForgotPassword />
                </div>
            </div>
        </>
    )
}
