'use client'
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

type LayoutContextValue = {
    sidebarShow: boolean
    setSidebarShow: (visible: boolean) => void
    sidebarUnfoldable: boolean
    setSidebarUnfoldable: (unfoldable: boolean) => void
}

const LayoutContext = createContext<LayoutContextValue | null>(null)

/** État de la barre latérale (ouverte sur mobile, réduite sur grand écran). */
export function LayoutProvider({ children }: { children: ReactNode }) {
    const [sidebarShow, setSidebarShow] = useState(true)
    const [sidebarUnfoldable, setSidebarUnfoldable] = useState(false)
    const value = useMemo(() => ({ sidebarShow, setSidebarShow, sidebarUnfoldable, setSidebarUnfoldable }), [sidebarShow, sidebarUnfoldable])
    return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
}

export function useLayout(): LayoutContextValue {
    const context = useContext(LayoutContext)
    if (!context) throw new Error('useLayout doit être utilisé dans <LayoutProvider>.')
    return context
}
