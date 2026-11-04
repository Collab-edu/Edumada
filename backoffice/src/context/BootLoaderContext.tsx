'use client'
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { EduFullLoader } from '@/components/EduLoader'

/** Au-delà, on rend la main : une API en panne ne doit pas bloquer tout le back-office. */
const MAX_WAIT_MS = 10_000

type BootLoaderValue = {
    booting: boolean
    hold: () => () => void
}

const BootLoaderContext = createContext<BootLoaderValue | null>(null)

/**
 * Un seul loader à l'ouverture : le plein écran reste affiché, sans redémarrer son animation,
 * tant que la session n'est pas prête (`ready`) puis tant que la page affiche des `Loading`.
 */
export function BootLoader({ ready, children }: { ready: boolean; children: ReactNode }) {
    const holds = useRef(0)
    const [booting, setBooting] = useState(true)
    const [releases, setReleases] = useState(0)

    const hold = useCallback(() => {
        holds.current += 1
        return () => {
            holds.current -= 1
            setReleases((n) => n + 1)
        }
    }, [])

    useEffect(() => {
        if (ready && holds.current === 0) setBooting(false)
    }, [ready, releases])

    useEffect(() => {
        if (!ready) return
        const timer = setTimeout(() => setBooting(false), MAX_WAIT_MS)
        return () => clearTimeout(timer)
    }, [ready])

    const value = useMemo(() => ({ booting, hold }), [booting, hold])

    return (
        <BootLoaderContext.Provider value={value}>
            {(booting || !ready) && <EduFullLoader />}
            {ready && children}
        </BootLoaderContext.Provider>
    )
}

/** Indique si le loader plein écran couvre encore ce chargement, et le retient tant qu'il dure. */
export function useBootHold() {
    const boot = useContext(BootLoaderContext)
    const booting = boot?.booting ?? false
    const hold = boot?.hold
    useLayoutEffect(() => (booting && hold ? hold() : undefined), [booting, hold])
    return booting
}
