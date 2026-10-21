import { FloatingElement, ParallaxFloating } from '@/components/ui/parallax-floating'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'

// Formes géométriques aux couleurs d'Edumada : sarcelle (secondary) et rouge (primary), très transparents.
const symbols = [
    { icon: 'tabler:diamonds', cls: 'left-[6%] top-[14%]', depth: 0.5, size: 'text-4xl', tone: 'text-secondary/20' },
    { icon: 'tabler:hexagon', cls: 'left-[24%] top-[28%]', depth: 1.5, size: 'text-2xl', tone: 'text-primary/25' },
    { icon: 'tabler:circle-dot', cls: 'right-[18%] top-[18%]', depth: 2.5, size: 'text-3xl', tone: 'text-secondary/20' },
    { icon: 'tabler:square-rotated', cls: 'left-[12%] bottom-[22%]', depth: 2, size: 'text-2xl', tone: 'text-primary/25' },
    { icon: 'tabler:triangle', cls: 'right-[6%] bottom-[18%]', depth: 1, size: 'text-4xl', tone: 'text-secondary/20' },
    { icon: 'tabler:square', cls: 'right-[34%] bottom-[10%]', depth: 3, size: 'text-xl', tone: 'text-primary/25' },
    { icon: 'tabler:pentagon-filled', cls: 'right-[9%] top-[45%]', depth: 1.8, size: 'text-2xl', tone: 'text-secondary/20' },
]

/** Fond de symboles flottants qui suivent la souris, chacun à sa profondeur (section héros de l'accueil). */
export default function ParallaxFloatingSymbols({ className }: { className?: string }) {
    return (
        <ParallaxFloating sensitivity={1.5} className={cn('overflow-hidden', className)}>
            {symbols.map(({ icon, cls, depth, size, tone }) => (
                <FloatingElement className={cls} depth={depth} key={icon}>
                    <Icon icon={icon} aria-hidden='true' className={cn(size, tone, 'select-none')} />
                </FloatingElement>
            ))}
        </ParallaxFloating>
    )
}
