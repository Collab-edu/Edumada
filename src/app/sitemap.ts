import type { MetadataRoute } from 'next'
import { readSiteData } from '@/data/server'
import { SITE_URL } from '@/lib/site-url'
import { I18N_ENABLED, LOCALE_TAGS, LOCALES, localizePath } from '@/i18n/config'

// Export statique : le fichier est écrit au build (out/sitemap.xml).
export const dynamic = 'force-static'

/** Pages publiques indexables (mêmes adresses que leurs balises canonical). */
const PAGES = [
    '/',
    '/universites/',
    '/formation-professionnelle/',
    '/ecoles/',
    '/creches/',
    '/petite-enfance/',
    '/etablissements/',
    '/domaines/',
    '/orientation/',
    '/orientation/test/',
    '/recherche/',
    '/stages/',
    '/actualites/',
    '/avantages/',
    '/tarifs/',
    '/a-propos/',
    '/contact/',
    '/conditions/',
    '/confidentialite/',
]

/**
 * sitemap.xml : pages publiques, fiches établissements et fiches formations générées au build.
 * Multilingue actif : chaque page en français, anglais et malgache, avec les liens entre les trois (hreflang).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const data = await readSiteData()
    const schools = data.SchoolData.map((school) => `/etablissements/${school.id}/`)
    const formations = data.FormationData.map((formation) => `/etablissements/${formation.schoolId}/${formation.urlSlug}/`)
    const paths = [...PAGES, ...schools, ...formations]
    if (!I18N_ENABLED) return paths.map((path) => ({ url: `${SITE_URL}${path}` }))

    return paths.flatMap((path) => {
        const languages = Object.fromEntries(LOCALES.map((locale) => [LOCALE_TAGS[locale], `${SITE_URL}${localizePath(path, locale)}`]))
        return LOCALES.map((locale) => ({ url: `${SITE_URL}${localizePath(path, locale)}`, alternates: { languages } }))
    })
}
