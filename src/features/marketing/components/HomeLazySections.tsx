'use client'
import dynamic from 'next/dynamic'
import WhenVisible from '@/components/ui/when-visible'

/*
 * Sections du bas de l'accueil : leur code n'est téléchargé et leurs cartes (répétées pour le défilement
 * en boucle) ne sont construites qu'à l'approche de l'écran. Le haut de page devient interactif plus vite.
 * Hauteurs réservées : celles des sections affichées sur téléphone.
 */
const FormationsSection = dynamic(() => import('@/features/formations/components/FormationsSection'), { ssr: false })
const SchoolsSection = dynamic(() => import('@/features/etablissements/components/SchoolsSection'), { ssr: false })
const TestimonialsSection = dynamic(() => import('./TestimonialsSection'), { ssr: false })

export function LazyFormationsSection() {
    return (
        <WhenVisible minHeight={690}>
            <FormationsSection />
        </WhenVisible>
    )
}

export function LazySchoolsSection() {
    return (
        <WhenVisible minHeight={760}>
            <SchoolsSection />
        </WhenVisible>
    )
}

export function LazyTestimonialsSection() {
    return (
        <WhenVisible minHeight={670}>
            <TestimonialsSection />
        </WhenVisible>
    )
}
