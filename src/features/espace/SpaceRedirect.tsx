'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageSkeleton } from '@/components/ui/page-state'
import { useAuth } from '@/features/auth/AuthProvider'
import { SPACE_HOME } from '@/features/auth/types'

/** /espace : envoie chacun vers son espace (étudiant, établissement, administration) ou vers la connexion. */
export default function SpaceRedirect() {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (loading) return
        router.replace(user ? SPACE_HOME[user.role] : '/signin/?next=/espace/')
    }, [loading, user, router])

    return <PageSkeleton />
}
