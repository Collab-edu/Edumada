'use client'
import { forwardRef, useCallback, useMemo, type ComponentProps } from 'react'
import NextLink from 'next/link'
import { usePathname, useRouter as useNextRouter } from 'next/navigation'
import { localeFromPath, localizePath, type Locale } from './config'
import { translate, type TranslateVars } from './translate'

/** Langue de la page, lue dans l'adresse (« /en/… » → anglais). */
export function useLocale(): Locale {
    return localeFromPath(usePathname() ?? '/')
}

/** Fonction de traduction de la page : t('Rechercher') → « Search » sur /en/. */
export function useT() {
    const locale = useLocale()
    return useCallback((text: string, vars?: TranslateVars) => translate(locale, text, vars), [locale])
}

/** Adresse interne dans la langue de la page. */
export function useLocalizePath() {
    const locale = useLocale()
    return useCallback((href: string) => localizePath(href, locale), [locale])
}

/** Lien interne qui reste dans la langue de la page (remplace next/link sur le site). */
const Link = forwardRef<HTMLAnchorElement, ComponentProps<typeof NextLink>>(function Link({ href, ...props }, ref) {
    const localize = useLocalizePath()
    const target = typeof href === 'string' ? localize(href) : href.pathname ? { ...href, pathname: localize(href.pathname) } : href
    return <NextLink ref={ref} href={target} {...props} />
})

export default Link

/** Routeur dont push / replace restent dans la langue de la page. */
export function useRouter() {
    const router = useNextRouter()
    const localize = useLocalizePath()
    return useMemo(
        () => ({
            ...router,
            push: (href: string, options?: Parameters<typeof router.push>[1]) => router.push(localize(href), options),
            replace: (href: string, options?: Parameters<typeof router.replace>[1]) => router.replace(localize(href), options),
        }),
        [router, localize]
    )
}
