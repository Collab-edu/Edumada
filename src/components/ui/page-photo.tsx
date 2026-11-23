/* eslint-disable @next/next/no-img-element -- export statique : next/image ne redimensionne pas, le srcSet est fait à la main. */
import withBasePath from '@/lib/base-path'
import { cn } from '@/lib/utils'

/** Photos hébergées sur le site, en 640 et 1200 px de large (public/images/pages/<nom>-<largeur>.webp). */
export type PagePhotoName =
    | 'etablissements'
    | 'etudiants'
    | 'etudiants-groupe'
    | 'formation-pro'
    | 'enfants-classe'
    | 'orientation'
    | 'universites'
    | 'creches'
    | 'ecoles'
    | 'petite-enfance'
    | 'stages'

/** Adresse et versions d'une photo : le navigateur télécharge la plus petite qui suffit à l'écran. */
export function pagePhoto(name: PagePhotoName) {
    const url = (width: number) => withBasePath(`/images/pages/${name}-${width}.webp`)
    return { src: url(1200), srcSet: `${url(640)} 640w, ${url(1200)} 1200w` }
}

/**
 * Photo qui remplit son cadre (le parent doit être en position relative).
 * `priority` : photo d'en-tête, téléchargée en premier (élément LCP de la page).
 */
export default function PagePhoto({ name, alt, sizes, priority = false, className }: { name: PagePhotoName; alt: string; sizes: string; priority?: boolean; className?: string }) {
    return (
        <img
            {...pagePhoto(name)}
            alt={alt}
            sizes={sizes}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : undefined}
            decoding='async'
            className={cn('absolute inset-0 h-full w-full object-cover', className)}
        />
    )
}
