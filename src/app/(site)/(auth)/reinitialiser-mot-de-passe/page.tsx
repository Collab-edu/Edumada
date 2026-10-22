import ResetPassword from '@/features/auth/components/ResetPassword'
import Breadcrumb from '@/components/ui/breadcrumb'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Nouveau mot de passe',
}

export default function Page() {
    return (
        <>
            <Breadcrumb pageName='Nouveau mot de passe' />

            <div className='mx-auto w-full max-w-md px-4 pb-20'>
                <div className='rounded-2xl bg-white px-6 py-8 shadow-sm ring-1 ring-gray-100 sm:px-8'>
                    <ResetPassword />
                </div>
            </div>
        </>
    )
}
