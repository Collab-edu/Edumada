'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiEnabled } from '@/lib/api'
import { getBasePath } from '@/lib/base-path'

/**
 * Le site est exporté en pages statiques : une offre ou un établissement publié après le build
 * n'a pas encore de page. On redirige alors vers la version construite dans le navigateur.
 */
export default function FicheRedirect() {
    const router = useRouter()

    useEffect(() => {
        if (!apiEnabled) return
        const path = window.location.pathname.slice(getBasePath().length)
        const match = path.match(/^\/(formations|etablissements)\/([a-z0-9-]+)\/?$/)
        if (match && match[2] !== 'voir') {
            router.replace(`/${match[1]}/voir/?id=${match[2]}`)
        }
    }, [router])

    return null
}
