'use client'
import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * N'affiche ses enfants qu'à l'approche de l'écran (une seule fois), pour alléger le chargement
 * des pages longues sur téléphone. En attendant, réserve la hauteur indiquée pour que la page ne saute pas.
 * Sans IntersectionObserver (très vieux navigateurs), le contenu s'affiche tout de suite.
 */
export default function WhenVisible({ children, minHeight, margin = '600px' }: { children: ReactNode; minHeight: number; margin?: string }) {
    const ref = useRef<HTMLDivElement>(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const element = ref.current
        if (!element || !('IntersectionObserver' in window)) return setVisible(true)
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true)
                    observer.disconnect()
                }
            },
            { rootMargin: `${margin} 0px` }
        )
        observer.observe(element)
        return () => observer.disconnect()
    }, [margin])

    if (visible) return <>{children}</>
    return <div ref={ref} aria-hidden='true' style={{ minHeight }} />
}
