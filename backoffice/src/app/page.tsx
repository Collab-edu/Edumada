'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EduFullLoader } from '@/components/EduLoader'

/** La racine mène au tableau de bord (ou à la connexion, via le garde de session). */
export default function Home() {
    const router = useRouter()
    useEffect(() => router.replace('/dashboard/'), [router])
    return <EduFullLoader />
}
