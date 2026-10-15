import { Children, type ReactNode } from 'react'

interface AutoScrollProps {
    children: ReactNode
    /** Durée d'un tour complet, en secondes. Plus c'est grand, plus c'est lent. */
    duration?: number
    /** Classe appliquée à chaque élément (largeur de la carte, etc.). */
    itemClassName?: string
}

/**
 * Fait défiler ses enfants en boucle continue, de droite à gauche.
 * La liste est rendue deux fois pour que la boucle soit sans coupure ;
 * l'animation se met en pause au survol et est désactivée si l'utilisateur
 * a demandé à réduire les animations.
 */
const AutoScroll = ({ children, duration = 40, itemClassName = 'w-[300px]' }: AutoScrollProps) => {
    const items = Children.toArray(children)

    const renderItems = (hidden: boolean) =>
        items.map((child, i) => (
            <div
                key={i}
                aria-hidden={hidden || undefined}
                inert={hidden || undefined}
                className={`flex shrink-0 pr-5 [&>*]:w-full ${itemClassName}`}>
                {child}
            </div>
        ))

    return (
        <div className='group/scroll relative overflow-hidden py-3 [mask-image:linear-gradient(to_right,transparent,white_4px,white_calc(100%-4px),transparent)]'>
            <div
                className='flex w-max animate-auto-scroll group-hover/scroll:[animation-play-state:paused] motion-reduce:animate-none'
                style={{ animationDuration: `${duration}s` }}>
                {renderItems(false)}
                {renderItems(true)}
            </div>
        </div>
    )
}

export default AutoScroll
