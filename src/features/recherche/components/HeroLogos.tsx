'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import withBasePath from '@/lib/base-path'
import AutoScroll from '@/components/ui/auto-scroll'
import { apiEnabled, fetchAllPages } from '@/lib/api'
import type { SchoolType } from '@/features/etablissements/types'

/** Une image déposée a une adresse complète ; un chemin (« /images/… ») est servi par le site. */
const logoSrc = (logo: string) => (logo.startsWith('/') ? withBasePath(logo) : logo)

/** Logos des établissements Premium qui défilent en continu, en bas du hero de l'accueil. */
export default function HeroLogos() {
    const [schools, setSchools] = useState<SchoolType[] | null>(apiEnabled ? null : [])

    useEffect(() => {
        if (!apiEnabled) return
        let active = true
        fetchAllPages<SchoolType>('/establishments', { plan: 'premium' }, { token: null })
            .then((data) => active && setSchools(data.filter((school) => school.logo)))
            .catch(() => active && setSchools([]))
        return () => {
            active = false
        }
    }, [])

    // Hauteur réservée pendant le chargement : le hero ne saute pas.
    if (schools === null) return <div className='h-16' aria-hidden='true' />
    if (schools.length === 0) return null

    return (
        <AutoScroll duration={120} minItemsPerLoop={12} itemClassName='w-40 sm:w-56'>
            {schools.map((school) => (
                <div key={school.id} className='flex h-16 items-center justify-center'>
                    <Image src={logoSrc(school.logo ?? '')} alt={school.name} width={200} height={64} className='h-11 w-auto max-w-full object-contain sm:h-14' />
                </div>
            ))}
        </AutoScroll>
    )
}
