'use client'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import PagePhoto, { type PagePhotoName } from './page-photo'

/** La vidéo n'est chargée que sur un écran assez large, sans économiseur de données ni demande de réduire les animations. */
function canPlayVideo(): boolean {
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    return window.matchMedia('(min-width: 768px) and (prefers-reduced-motion: no-preference)').matches && !connection?.saveData
}

/**
 * En-tête illustré : la photo s'affiche tout de suite (élément LCP) ; sur tablette et ordinateur, une vidéo
 * en boucle, sans son, la recouvre en fondu dès qu'elle joue. Sur téléphone, seule la photo est téléchargée
 * (une vidéo HD pèse plusieurs Mo).
 */
export function HeroVideo({ src, poster, label, className }: { src: string; poster: PagePhotoName; label: string; className?: string }) {
    const [withVideo, setWithVideo] = useState(false)
    const [playing, setPlaying] = useState(false)

    useEffect(() => setWithVideo(canPlayVideo()), [])

    return (
        <div className={cn('relative overflow-hidden rounded-xl bg-secondary', className)}>
            <PagePhoto name={poster} alt={label} priority sizes='(min-width: 1024px) 1200px, 100vw' />
            {withVideo && (
                <video
                    className={cn('absolute inset-0 h-full w-full object-cover transition-opacity duration-500', playing ? 'opacity-100' : 'opacity-0')}
                    src={src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload='auto'
                    aria-hidden='true'
                    onPlaying={() => setPlaying(true)}
                />
            )}
        </div>
    )
}

export default HeroVideo
