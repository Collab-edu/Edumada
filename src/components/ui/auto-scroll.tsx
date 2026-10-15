import { Children, type ReactNode } from 'react'

interface AutoScrollProps {
    children: ReactNode
    /** Durée d'un tour complet, en secondes. Plus c'est grand, plus c'est lent. */
    duration?: number
    /** Classe appliquée à chaque élément (largeur de la carte, etc.). */
    itemClassName?: string
    /**
     * Nombre minimum d'éléments par tour : une liste plus courte est répétée
     * pour que la bande soit toujours plus large que l'écran (pas de vide en fin de boucle).
     */
    minItemsPerLoop?: number
}

/**
 * Fait défiler ses enfants en boucle continue, de droite à gauche.
 * La liste est rendue deux fois pour que la boucle soit sans coupure ;
 * l'animation se met en pause au survol et est désactivée si l'utilisateur
 * a demandé à réduire les animations. Les copies sont ignorées par les lecteurs d'écran.
 */
const AutoScroll = ({ children, duration = 40, itemClassName = 'w-[300px]', minItemsPerLoop = 6 }: AutoScrollProps) => {
    const items = Children.toArray(children)
    if (items.length === 0) return null

    const repeats = Math.max(1, Math.ceil(minItemsPerLoop / items.length))
    const loop = Array.from({ length: repeats }, () => items).flat()

    const renderItems = (copy: number) =>
        loop.map((child, i) => {
            // Seule la toute première occurrence de chaque élément est accessible.
            const hidden = copy > 0 || i >= items.length
            return (
                <div
                    key={`${copy}-${i}`}
                    aria-hidden={hidden || undefined}
                    inert={hidden || undefined}
                    className={`flex shrink-0 pr-5 [&>*]:w-full ${itemClassName}`}>
                    {child}
                </div>
            )
        })

    return (
        <div className='group/scroll relative overflow-hidden py-3 [mask-image:linear-gradient(to_right,transparent,white_4px,white_calc(100%-4px),transparent)]'>
            <div
                className='flex w-max animate-auto-scroll group-hover/scroll:[animation-play-state:paused] motion-reduce:animate-none'
                style={{ animationDuration: `${duration * repeats}s` }}>
                {renderItems(0)}
                {renderItems(1)}
            </div>
        </div>
    )
}

export default AutoScroll
