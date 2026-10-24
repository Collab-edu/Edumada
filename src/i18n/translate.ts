import type { Locale } from './config'
import en from './dictionaries/en'
import mg from './dictionaries/mg'

/**
 * Dictionnaires : la clé est le texte français tel qu'il est écrit dans le code, la valeur sa
 * traduction. Un texte absent reste en français (rien ne casse pendant la traduction).
 */
const DICTIONARIES: Record<Exclude<Locale, 'fr'>, Record<string, string>> = { en, mg }

export type TranslateVars = Record<string, string | number>

/** Remplace « {nom} » par sa valeur : t('{n} offres', { n: 3 }). */
const fill = (text: string, vars?: TranslateVars) => (vars ? text.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match)) : text)

export function translate(locale: Locale, text: string, vars?: TranslateVars): string {
    const translated = locale === 'fr' ? text : (DICTIONARIES[locale][text] ?? text)
    return fill(translated, vars)
}
