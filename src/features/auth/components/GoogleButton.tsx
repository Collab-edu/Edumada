'use client'
import { useEffect, useRef } from 'react'

/** Identifiant client OAuth de Google (vide : bouton masqué). */
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''

type GoogleId = {
    initialize: (options: { client_id: string; callback: (response: { credential: string }) => void; ux_mode?: 'popup' }) => void
    renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void
}
declare global {
    interface Window {
        google?: { accounts: { id: GoogleId } }
    }
}

let script: Promise<GoogleId> | null = null

/** Charge une seule fois la bibliothèque « Se connecter avec Google ». */
function loadGoogle(): Promise<GoogleId> {
    script ??= new Promise((resolve, reject) => {
        const tag = document.createElement('script')
        tag.src = 'https://accounts.google.com/gsi/client'
        tag.async = true
        tag.onload = () => (window.google ? resolve(window.google.accounts.id) : reject(new Error('Google indisponible')))
        tag.onerror = () => {
            script = null
            reject(new Error('Google indisponible'))
        }
        document.head.appendChild(tag)
    })
    return script
}

/** Nom et adresse du compte Google choisi, lus dans le jeton (affichage seulement : l'API le vérifie). */
export function readGoogleCredential(credential: string): { email: string; firstName: string; lastName: string } {
    try {
        const base64 = credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
        const bytes = Uint8Array.from(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')), (c) => c.charCodeAt(0))
        const claims = JSON.parse(new TextDecoder().decode(bytes)) as Record<string, string>
        return { email: claims.email ?? '', firstName: claims.given_name ?? '', lastName: claims.family_name ?? '' }
    } catch {
        return { email: '', firstName: '', lastName: '' }
    }
}

/**
 * Bouton officiel « S'inscrire avec Google » / « Continuer avec Google » : renvoie le jeton
 * d'identité du compte choisi. Rien n'est affiché tant que Google n'est pas configuré.
 */
export default function GoogleButton({ onCredential, text = 'continue_with' }: { onCredential: (credential: string) => void; text?: 'signup_with' | 'continue_with' }) {
    const container = useRef<HTMLDivElement>(null)
    const callback = useRef(onCredential)
    callback.current = onCredential

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID || !container.current) return
        let active = true
        loadGoogle()
            .then((google) => {
                if (!active || !container.current) return
                google.initialize({ client_id: GOOGLE_CLIENT_ID, callback: (response) => callback.current(response.credential), ux_mode: 'popup' })
                google.renderButton(container.current, {
                    type: 'standard',
                    theme: 'outline',
                    size: 'large',
                    shape: 'rectangular',
                    text,
                    locale: 'fr',
                    logo_alignment: 'center',
                    width: Math.min(container.current.offsetWidth || 400, 400),
                })
            })
            .catch(() => undefined)
        return () => {
            active = false
        }
    }, [text])

    if (!GOOGLE_CLIENT_ID) return null
    return <div ref={container} className='flex min-h-11 w-full justify-center' />
}
