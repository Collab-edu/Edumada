'use client'
import { useEffect, useState } from 'react'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { I18N_ENABLED, LOCALE_NAMES, localizePath, stripLocale, type Locale } from './config'
import { useLocale } from './client'

const SHORT: Record<string, string> = { fr: 'FR', en: 'EN', mg: 'MG' }
/** Ordre d'affichage, comme avant l'activation : FR | MG | EN. */
const ORDER: Locale[] = ['fr', 'mg', 'en']

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

    if (!I18N_ENABLED) return null
    return (
        // Même rendu que l'aperçu affiché avant l'activation : « FR | MG | EN », langue active en rouge.
        <nav aria-label='Langue / Language / Fiteny' className={cn('flex items-center divide-x', tone === 'light' ? 'divide-white/20' : 'divide-gray-200', className)}>
            {ORDER.map((l) => (
                // next/link direct : le lien vise une autre langue que celle de la page.
                <NextLink
                    key={l}
                    href={`${localizePath(path, l)}${search ? `?${search}` : ''}`}
                    hrefLang={l}
                    lang={l}
                    title={LOCALE_NAMES[l]}
                    aria-current={l === locale ? 'true' : undefined}
                    className={cn(
                        'inline-flex min-h-8 items-center px-3 text-sm font-semibold tracking-wide transition-colors',
                        tone === 'light'
                            ? l === locale
                                ? 'text-white'
                                : 'text-white/70 hover:text-white'
                            : l === locale
                              ? 'text-primary'
                              : 'text-black hover:text-primary'
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
