import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import type { ReactNode } from 'react'
import Providers from './providers'
import './globals.scss'

// Polices d'Edumada, comme sur le site : Plus Jakarta Sans (titres), Inter (textes et formulaires).
const heading = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['600', '700', '800'], display: 'swap', variable: '--edu-font-heading' })
const body = Inter({ subsets: ['latin'], display: 'swap', variable: '--edu-font-body' })

export const metadata: Metadata = {
    title: 'Edumada · Back-office',
    description: 'Gestion des établissements et administration de la plateforme Edumada.',
    icons: { icon: '/favicon.svg' },
    robots: { index: false, follow: false },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0f4c5c' }

// Applique le thème mémorisé avant le premier rendu (évite le flash clair → sombre).
const themeScript = `try{var m=localStorage.getItem('edumada-backoffice-theme');m=m?JSON.parse(m):'light';if(m==='auto'){m=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-coreui-theme',m)}catch(e){}`

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang='fr' suppressHydrationWarning className={`${heading.variable} ${body.variable}`}>
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeScript }} />
            </head>
            <body>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
