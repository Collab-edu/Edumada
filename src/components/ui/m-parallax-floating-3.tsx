import { FloatingElement, ParallaxFloating } from '@/components/ui/parallax-floating'
import { cn } from '@/lib/utils'

// Symboles aux couleurs d'Edumada : sarcelle (secondary) et rouge (primary), très transparents.
const symbols = [
    { char: '◈', cls: 'left-[6%] top-[14%]', depth: 0.5, size: 'text-4xl', tone: 'text-secondary/20' },
    { char: '⬡', cls: 'left-[24%] top-[28%]', depth: 1.5, size: 'text-2xl', tone: 'text-primary/25' },
    { char: '◎', cls: 'right-[18%] top-[18%]', depth: 2.5, size: 'text-3xl', tone: 'text-secondary/20' },
    { char: '◇', cls: 'left-[12%] bottom-[22%]', depth: 2, size: 'text-2xl', tone: 'text-primary/25' },
    { char: '△', cls: 'right-[6%] bottom-[18%]', depth: 1, size: 'text-4xl', tone: 'text-secondary/20' },
    { char: '□', cls: 'right-[34%] bottom-[10%]', depth: 3, size: 'text-xl', tone: 'text-primary/25' },
    { char: '⬟', cls: 'right-[9%] top-[45%]', depth: 1.8, size: 'text-2xl', tone: 'text-secondary/20' },
]

/** Fond de symboles flottants qui suivent la souris, chacun à sa profondeur (section héros de l'accueil). */
export default function ParallaxFloatingSymbols({ className }: { className?: string }) {
    return (
        <ParallaxFloating sensitivity={1.5} className={cn('overflow-hidden', className)}>
            {symbols.map(({ char, cls, depth, size, tone }) => (
                <FloatingElement className={cls} depth={depth} key={char}>
                    <span className={cn(size, tone, 'select-none')}>{char}</span>
                </FloatingElement>
            ))}
        </ParallaxFloating>
    )
}
