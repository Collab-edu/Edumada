'use client'
import { forwardRef, use, useCallback, useMemo, type ComponentProps } from 'react'
import NextLink from 'next/link'
import { usePathname, useRouter as useNextRouter } from 'next/navigation'
import { localeFromPath, localizePath, type Locale } from './config'
import { translateWith, type Dictionary, type TranslateVars } from './translate-core'

/** Langue de la page, lue dans l'adresse (« /en/… » → anglais). */
export function useLocale(): Locale {
    return localeFromPath(usePathname() ?? '/')
}

/**
 * Dictionnaires chargés à la demande : chacun forme un fichier à part, téléchargé seulement sur les
 * pages de sa langue. Les pages françaises n'en chargent aucun.
 */
const LOADERS: Record<Exclude<Locale, 'fr'>, () => Promise<Dictionary>> = {
    en: () => import('./dictionaries/en').then((m) => m.default),
    mg: () => import('./dictionaries/mg').then((m) => m.default),
}
/** Promesse marquée comme déjà résolue : use() la lit sans attendre (convention de React). */
type TrackedPromise<T> = Promise<T> & { status?: 'fulfilled'; value?: T }
const resolved = <T,>(value: T): TrackedPromise<T> => Object.assign(Promise.resolve(value), { status: 'fulfilled' as const, value })

const DICTIONARIES: Partial<Record<Locale, TrackedPromise<Dictionary | null>>> = { fr: resolved(null) }

function dictionaryPromise(locale: Locale): TrackedPromise<Dictionary | null> {
    if (!DICTIONARIES[locale]) {
        const promise: TrackedPromise<Dictionary | null> = LOADERS[locale as Exclude<Locale, 'fr'>]()
            // Fichier introuvable (réseau coupé) : la page reste en français plutôt que de planter.
            .catch(() => ({}))
            .then((dictionary) => Object.assign(promise, { status: 'fulfilled' as const, value: dictionary }).value!)
        DICTIONARIES[locale] = promise
    }
    return DICTIONARIES[locale]!
}

/**
 * Dictionnaire de la langue (null en français). Toujours lu de la même façon, par use() :
 * immédiat une fois chargé ; sinon le rendu attend son arrivée (au chargement d'une page /en/ ou /mg/,
 * le HTML déjà traduit reste affiché pendant ce temps).
 */
function useDictionary(locale: Locale): Dictionary | null {
    return use(dictionaryPromise(locale))
}

/** Fonction de traduction de la page : t('Rechercher') → « Search » sur /en/. */
export function useT() {
    const locale = useLocale()
    const dictionary = useDictionary(locale)
    return useCallback((text: string, vars?: TranslateVars) => translateWith(dictionary, locale, text, vars), [dictionary, locale])
}

/** Adresse interne dans la langue de la page. */
export function useLocalizePath() {
    const locale = useLocale()
    return useCallback((href: string) => localizePath(href, locale), [locale])
}

/**
 * Lien interne qui reste dans la langue de la page (remplace next/link sur le site).
 * Sans préchargement : les visiteurs ne paient que les données des pages qu'ils ouvrent.
 */
const Link = forwardRef<HTMLAnchorElement, ComponentProps<typeof NextLink>>(function Link({ href, ...props }, ref) {
    const localize = useLocalizePath()
    const target = typeof href === 'string' ? localize(href) : href.pathname ? { ...href, pathname: localize(href.pathname) } : href
    return <NextLink ref={ref} href={target} prefetch={false} {...props} />
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
