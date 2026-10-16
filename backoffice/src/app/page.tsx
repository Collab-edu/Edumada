'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loading } from '@/components/ui'

/** La racine mène au tableau de bord (ou à la connexion, via le garde de session). */
export default function Home() {
    const router = useRouter()
    useEffect(() => router.replace('/dashboard/'), [router])
    return <Loading />
}
