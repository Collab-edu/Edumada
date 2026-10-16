'use client'
import type { ReactNode } from 'react'
import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/context/ToastContext'

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
        </ToastProvider>
    )
}
