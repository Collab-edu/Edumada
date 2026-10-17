'use client'
import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * Barre de progression en haut de l'écran : elle démarre au clic sur un lien interne et
 * s'arrête quand la nouvelle page est affichée. Sans elle, un clic paraît sans effet
 * pendant le chargement (connexion lente, ou compilation de la page en développement).
 */
export default function NavigationProgress() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')

    // La nouvelle page est affichée : on termine la barre.
    useEffect(() => {
        setState((current) => (current === 'loading' ? 'done' : current))
    }, [pathname, searchParams])

    useEffect(() => {
        if (state !== 'done') return
        const timer = setTimeout(() => setState('idle'), 300)
        return () => clearTimeout(timer)
    }, [state])

    useEffect(() => {
        const onClick = (event: MouseEvent) => {
            // Écouté en phase de capture : Next.js annule ensuite le clic pour naviguer sans recharger.
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
            const link = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
            if (!link || link.target === '_blank' || link.hasAttribute('download')) return
            const url = new URL(link.href, window.location.href)
            if (url.origin !== window.location.origin) return
            // Même page (ancre ou lien vers la page courante) : pas de chargement.
            if (url.pathname === window.location.pathname && url.search === window.location.search) return
            setState('loading')
        }
        document.addEventListener('click', onClick, true)
        return () => document.removeEventListener('click', onClick, true)
    }, [])

    if (state === 'idle') return null

    return (
        <div className='pointer-events-none fixed inset-x-0 top-0 z-[100] h-1' role='progressbar' aria-label='Chargement de la page'>
            <div
                className={
                    state === 'loading'
                        ? 'h-full animate-nav-progress bg-primary shadow-[0_0_8px] shadow-primary'
                        : 'h-full w-full bg-primary opacity-0 transition-[width,opacity] duration-300'
                }
            />
        </div>
    )
}
