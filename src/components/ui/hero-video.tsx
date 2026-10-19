import { cn } from '@/lib/utils'

/**
 * Vidéo d'illustration en boucle, sans son : lecture automatique y compris sur mobile (muted + playsInline).
 * L'image `poster` s'affiche pendant le chargement, ou si la vidéo ne peut pas être lue.
 */
export function HeroVideo({ src, poster, label, className }: { src: string; poster: string; label: string; className?: string }) {
    return (
        <div className={cn('relative overflow-hidden rounded-2xl bg-secondary', className)}>
            <video
                className='absolute inset-0 h-full w-full object-cover'
                src={src}
                poster={poster}
                autoPlay
                muted
                loop
                playsInline
                preload='metadata'
                aria-label={label}
            />
        </div>
    )
}

export default HeroVideo
