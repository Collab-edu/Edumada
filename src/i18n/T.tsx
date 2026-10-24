'use client'
import { useT } from './client'

/**
 * Texte traduit dans une page rendue côté serveur (pages légales, titres) :
 * <T>Les domaines d'études</T>. Le texte français sert de clé, comme useT().
 */
export function T({ children, vars }: { children: string; vars?: Record<string, string | number> }) {
    const t = useT()
    return <>{t(children, vars)}</>
}

export default T
