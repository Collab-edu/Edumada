'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { MAX_LOADING_MS, MIN_LOADING_MS } from './useOfferSearch'

/** Laisse le loader affiché 2 à 3 secondes après une recherche, comme sur la page /recherche. */
export function useSearchPacing() {
    const [pacing, setPacing] = useState(false)
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

    const startPacing = useCallback(() => {
        clearTimeout(timer.current)
        setPacing(true)
        timer.current = setTimeout(() => setPacing(false), MIN_LOADING_MS + Math.random() * (MAX_LOADING_MS - MIN_LOADING_MS))
    }, [])

    useEffect(() => () => clearTimeout(timer.current), [])

    return { pacing, startPacing }
}
