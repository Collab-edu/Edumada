'use client'
import { useEffect, useState } from 'react'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LOCALES, LOCALE_NAMES, localizePath, stripLocale } from './config'
import { useLocale } from './client'

const SHORT: Record<string, string> = { fr: 'FR', en: 'EN', mg: 'MG' }

/**
 * Sélecteur FR · EN · MG : la même page dans une autre langue. `tone` : « light » sur la barre
 * sombre de l'en-tête, « dark » dans le menu mobile.
 */
export default function LanguageSwitcher({ tone = 'dark', className }: { tone?: 'light' | 'dark'; className?: string }) {
    const locale = useLocale()
    const pathname = usePathname() ?? '/'
    const path = stripLocale(pathname)
    // Paramètres de la page (?id=…, filtres) gardés en changeant de langue ; lus après le rendu statique.
    const [search, setSearch] = useState('')
    useEffect(() => setSearch(window.location.search.replace(/^\?/, '')), [pathname])

    return (
        <nav aria-label='Langue / Language / Fiteny' className={cn('flex items-center gap-1', className)}>
            {LOCALES.map((l) => (
                // next/link direct : le lien vise une autre langue que celle de la page.
                <NextLink
                    key={l}
                    href={`${localizePath(path, l)}${search ? `?${search}` : ''}`}
                    hrefLang={l}
                    lang={l}
                    title={LOCALE_NAMES[l]}
                    aria-current={l === locale ? 'true' : undefined}
                    className={cn(
                        'inline-flex min-h-8 min-w-9 items-center justify-center rounded-md px-2 text-xs font-bold tracking-wide transition-colors',
                        tone === 'light'
                            ? l === locale
                                ? 'bg-white text-secondary'
                                : 'text-white/80 hover:bg-white/10 hover:text-white'
                            : l === locale
                              ? 'bg-secondary text-white'
                              : 'text-secondary hover:bg-offwhite'
                    )}>
                    {SHORT[l]}
                </NextLink>
            ))}
        </nav>
    )
}

/** Langue de la page sur la balise <html> (lecteurs d'écran, traduction automatique). */
export function HtmlLang() {
    const locale = useLocale()
    useEffect(() => {
        document.documentElement.lang = locale
    }, [locale])
    return null
}
