'use client'
import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { cn } from '@/lib/utils'

type Pointer = { x: MotionValue<number>; y: MotionValue<number>; sensitivity: number }

const ParallaxContext = createContext<Pointer | null>(null)

/**
 * Calque de flottement en parallaxe : la souris (position dans la fenêtre, de -1 à 1) déplace
 * chaque élément selon sa profondeur. Sans effet au toucher ni si l'utilisateur réduit les animations.
 */
export function ParallaxFloating({ children, sensitivity = 1, className }: { children: ReactNode; sensitivity?: number; className?: string }) {
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const reduced = useReducedMotion()

    useEffect(() => {
        if (reduced) return
        const move = (e: PointerEvent) => {
            if (e.pointerType !== 'mouse') return
            x.set((e.clientX / window.innerWidth) * 2 - 1)
            y.set((e.clientY / window.innerHeight) * 2 - 1)
        }
        window.addEventListener('pointermove', move, { passive: true })
        return () => window.removeEventListener('pointermove', move)
    }, [reduced, x, y])

    return (
        <ParallaxContext.Provider value={{ x, y, sensitivity }}>
            <div aria-hidden='true' className={cn('pointer-events-none absolute inset-0', className)}>
                {children}
            </div>
        </ParallaxContext.Provider>
    )
}

/** Élément flottant : plus `depth` est grand, plus il se déplace (effet de premier plan). */
export function FloatingElement({ children, depth = 1, className }: { children: ReactNode; depth?: number; className?: string }) {
    const pointer = useContext(ParallaxContext)
    if (!pointer) throw new Error('FloatingElement doit être placé dans <ParallaxFloating>.')
    const amplitude = 12 * depth * pointer.sensitivity
    const x = useSpring(useTransform(pointer.x, (v) => v * amplitude), { stiffness: 60, damping: 18 })
    const y = useSpring(useTransform(pointer.y, (v) => v * amplitude), { stiffness: 60, damping: 18 })

    return (
        <motion.div className={cn('absolute will-change-transform', className)} style={{ x, y }}>
            {children}
        </motion.div>
    )
}
