import type { Locale } from './config'
import en from './dictionaries/en'
import mg from './dictionaries/mg'
import { translateWith, type TranslateVars } from './translate-core'

export type { TranslateVars } from './translate-core'

/**
 * Traduction côté serveur (métadonnées, mises en page des langues) : tous les dictionnaires.
 * Ne pas importer depuis un composant client, qui embarquerait les deux dictionnaires (voir client.tsx).
 */
const DICTIONARIES: Record<Exclude<Locale, 'fr'>, Record<string, string>> = { en, mg }

export function translate(locale: Locale, text: string, vars?: TranslateVars): string {
    return translateWith(locale === 'fr' ? null : DICTIONARIES[locale], locale, text, vars)
}
