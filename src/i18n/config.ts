/**
 * Langues du site public. Le français est à la racine (/universites/), l'anglais et le
 * malgache sous un préfixe (/en/universites/, /mg/universites/).
 */
export const LOCALES = ['fr', 'en', 'mg'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'fr'

/** Langues avec un préfixe dans l'adresse. */
export const PREFIXED_LOCALES = ['en', 'mg'] as const satisfies readonly Locale[]

/** Nom de chaque langue, écrit dans cette langue (sélecteur). */
export const LOCALE_NAMES: Record<Locale, string> = { fr: 'Français', en: 'English', mg: 'Malagasy' }

/** Code de langue pour l'attribut lang et les liens hreflang. */
export const LOCALE_TAGS: Record<Locale, string> = { fr: 'fr-MG', en: 'en', mg: 'mg' }

const PREFIX = /^\/(en|mg)(?=\/|$)/

/** « /en/universites/ » → « en » ; sans préfixe → « fr ». */
export function localeFromPath(path: string): Locale {
    return (path.match(PREFIX)?.[1] as Locale | undefined) ?? DEFAULT_LOCALE
}

/** « /en/universites/ » → « /universites/ ». */
export function stripLocale(path: string): string {
    return path.replace(PREFIX, '') || '/'
}

/**
 * Adresse interne dans une langue : « /universites/ » → « /en/universites/ ».
 * Les liens externes, les ancres et les adresses déjà relatives sont laissés tels quels.
 */
export function localizePath(href: string, locale: Locale): string {
    if (!href.startsWith('/') || href.startsWith('//')) return href
    const path = stripLocale(href)
    if (locale === DEFAULT_LOCALE) return path
    return path === '/' ? `/${locale}/` : `/${locale}${path}`
}
