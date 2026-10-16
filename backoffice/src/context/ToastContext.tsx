'use client'
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ComponentProps, type ReactElement, type ReactNode } from 'react'
import { CToast, CToastBody, CToastClose, CToaster } from '@coreui/react'

type Toast = { success: (message: string) => void; error: (message: string) => void; info: (message: string) => void }

const ToastContext = createContext<Toast | null>(null)

/** Notifications du back-office : toast.success('…'), toast.error('…'). */
export function ToastProvider({ children }: { children: ReactNode }) {
    const [toast, setToast] = useState<ReactElement<ComponentProps<typeof CToast>> | undefined>()
    const counter = useRef(0)

    const push = useCallback((message: string, color: 'success' | 'danger' | 'info') => {
        counter.current += 1
        setToast(
            <CToast key={counter.current} autohide delay={color === 'danger' ? 7000 : 4000} color={color} className='text-white align-items-center'>
                <div className='d-flex'>
                    <CToastBody>{message}</CToastBody>
                    <CToastClose className='me-2 m-auto' white />
                </div>
            </CToast>
        )
    }, [])

    const value = useMemo<Toast>(
        () => ({
            success: (m) => push(m, 'success'),
            error: (m) => push(m, 'danger'),
            info: (m) => push(m, 'info'),
        }),
        [push]
    )

    return (
        <ToastContext.Provider value={value}>
            {children}
            <CToaster push={toast} placement='bottom-end' className='p-3' />
        </ToastContext.Provider>
    )
}

export function useToast(): Toast {
    const context = useContext(ToastContext)
    if (!context) throw new Error('useToast doit être utilisé dans <ToastProvider>.')
    return context
}
