'use client'
import type { ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/features/auth/AuthProvider'

/** Contextes globaux du site : session de l'utilisateur et notifications. */
export default function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            {children}
            <Toaster
                position='bottom-center'
                toastOptions={{
                    className: 'text-base',
                    style: { color: '#334155' },
                    success: { iconTheme: { primary: '#0f4c5c', secondary: '#fff' } },
                    error: { iconTheme: { primary: '#ff3b52', secondary: '#fff' } },
                }}
            />
        </AuthProvider>
    )
}
