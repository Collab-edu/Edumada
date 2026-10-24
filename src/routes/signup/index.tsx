'use client'
import { useEffect } from 'react'

/** Ancienne adresse /signup/ : redirige vers /inscription/ en gardant les paramètres (next, type…). */
export default function SignupRedirect() {
    useEffect(() => {
        window.location.replace(`${window.location.pathname.replace(/\/signup\/?$/, '/inscription/')}${window.location.search}`)
    }, [])
    return null
}
