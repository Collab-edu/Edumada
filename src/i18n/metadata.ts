import type { Metadata } from 'next'
import { LOCALES, LOCALE_TAGS, localizePath, type Locale } from './config'
import { translate } from './translate'

type PageModule = {
    metadata?: Metadata
    // Paramètres propres à chaque page (id…) : vérifiés par la page elle-même.
    generateMetadata?: (props: { params: Promise<never> }) => Promise<Metadata> | Metadata
}

/** Liens hreflang d'une page vers ses trois versions (référencement multilingue). */
export function languageAlternates(path: string): Metadata['alternates'] {
    return {
        canonical: path,
        languages: Object.fromEntries([...LOCALES.map((l) => [LOCALE_TAGS[l], localizePath(path, l)]), ['x-default', localizePath(path, 'fr')]]),
    }
}

/**
 * Métadonnées d'une page dans une autre langue (/en/…, /mg/…) : celles de la page française,
 * titre et description traduits, avec les liens vers les autres langues.
 */
export function localizedMetadata(module: object, path: string) {
    const page = module as PageModule
    return async ({ params }: { params: Promise<Record<string, string>> }): Promise<Metadata> => {
        const resolved = await params
        const locale = resolved.lang as Locale
        const base = page.generateMetadata ? await page.generateMetadata({ params: Promise.resolve(resolved) as Promise<never> }) : (page.metadata ?? {})
        const tr = (value: unknown) => (typeof value === 'string' ? translate(locale, value) : value)
        // Chemin de la page, avec l'identifiant pour une fiche (/etablissements/[id]/).
        const concrete = path.replace(/\[(\w+)\]/g, (_, key: string) => resolved[key] ?? key)
        // Sans titre propre (accueil), la page garde celui de la mise en page de la langue.
        return {
            ...base,
            ...(base.title ? { title: tr(base.title) as Metadata['title'] } : {}),
            ...(base.description ? { description: tr(base.description) as Metadata['description'] } : {}),
            alternates: languageAlternates(concrete),
        }
    }
}
