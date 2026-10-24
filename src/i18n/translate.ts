import type { Locale } from './config'
import en from './dictionaries/en'
import mg from './dictionaries/mg'

/**
 * Dictionnaires : la clé est le texte français tel qu'il est écrit dans le code, la valeur sa
 * traduction. Un texte absent reste en français (rien ne casse pendant la traduction).
 */
const DICTIONARIES: Record<Exclude<Locale, 'fr'>, Record<string, string>> = { en, mg }

/**
 * Textes avec un nombre, fabriqués à plusieurs endroits (« 3 offres », « 1 établissement ») :
 * reconnus par leur forme plutôt qu'écrits un par un dans le dictionnaire.
 */
const COUNTED: { fr: RegExp; en: [string, string]; mg: string }[] = [
    { fr: /^(\d+) offres?$/, en: ['offer', 'offers'], mg: 'tolotra' },
    { fr: /^(\d+) formations?$/, en: ['programme', 'programmes'], mg: 'fiofanana' },
    { fr: /^(\d+) établissements?$/, en: ['institution', 'institutions'], mg: 'toeram-pianarana' },
    { fr: /^(\d+) résultats?$/, en: ['result', 'results'], mg: 'valiny' },
    { fr: /^(\d+) avis$/, en: ['review', 'reviews'], mg: 'hevitra' },
]

const MONTHS = {
    fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
    en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    mg: ['Janoary', 'Febroary', 'Martsa', 'Aprily', 'Mey', 'Jona', 'Jolay', 'Aogositra', 'Septambra', 'Oktobra', 'Novambra', 'Desambra'],
}
const DATE = new RegExp(`^(1er|\\d{1,2}) (${MONTHS.fr.join('|')}) (\\d{4})$`)

/** Durées, âges, frais et dates (« 3 ans », « 6 mois », « 3 à 6 ans », « 1 800 000 Ar / an », « 15 janvier 2027 »). */
const SHAPES: { fr: RegExp; en: (m: RegExpMatchArray) => string; mg: (m: RegExpMatchArray) => string }[] = [
    { fr: /^([\d,.]+) ans?$/, en: (m) => `${m[1]} year${m[1] === '1' ? '' : 's'}`, mg: (m) => `${m[1]} taona` },
    { fr: /^([\d,.]+) mois$/, en: (m) => `${m[1]} month${m[1] === '1' ? '' : 's'}`, mg: (m) => `${m[1]} volana` },
    { fr: /^([\d,.]+) à ([\d,.]+) ans$/, en: (m) => `${m[1]} to ${m[2]} years`, mg: (m) => `${m[1]} ka hatramin’ny ${m[2]} taona` },
    { fr: /^([\d,.]+) mois à ([\d,.]+) ans?$/, en: (m) => `${m[1]} months to ${m[2]} years`, mg: (m) => `${m[1]} volana ka hatramin’ny ${m[2]} taona` },
    // Frais : « 1 800 000 Ar / an », « 180 000 Ar / mois ».
    { fr: /^(.+ Ar) \/ an$/, en: (m) => `${m[1]} / year`, mg: (m) => `${m[1]} / taona` },
    { fr: /^(.+ Ar) \/ mois$/, en: (m) => `${m[1]} / month`, mg: (m) => `${m[1]} / volana` },
    // Dates : « 1er septembre 2026 », « 15 janvier 2027 ».
    { fr: DATE, en: (m) => `${MONTHS.en[MONTHS.fr.indexOf(m[2])]} ${m[1].replace('er', '')}, ${m[3]}`, mg: (m) => `${m[1].replace('er', '')} ${MONTHS.mg[MONTHS.fr.indexOf(m[2])]} ${m[3]}` },
]

function counted(locale: Exclude<Locale, 'fr'>, text: string): string | undefined {
    for (const rule of COUNTED) {
        const match = text.match(rule.fr)
        if (!match) continue
        const n = Number(match[1])
        return locale === 'en' ? `${n} ${rule.en[n > 1 ? 1 : 0]}` : `${rule.mg} ${n}`
    }
    for (const shape of SHAPES) {
        const match = text.match(shape.fr)
        if (match) return shape[locale](match)
    }
    return undefined
}

export type TranslateVars = Record<string, string | number>

/** Remplace « {nom} » par sa valeur : t('{n} offres', { n: 3 }). */
const fill = (text: string, vars?: TranslateVars) => (vars ? text.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match)) : text)

export function translate(locale: Locale, text: string, vars?: TranslateVars): string {
    const translated = locale === 'fr' ? text : (DICTIONARIES[locale][text] ?? counted(locale, text) ?? text)
    return fill(translated, vars)
}
