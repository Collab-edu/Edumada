import type { MetadataRoute } from 'next'
import { readSiteData } from '@/data/server'
import { SITE_URL } from '@/lib/site-url'

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

/** sitemap.xml : pages publiques, fiches établissements et fiches formations générées au build. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const data = await readSiteData()
    const schools = data.SchoolData.map((school) => `/etablissements/${school.id}/`)
    const formations = data.FormationData.map((formation) => `/etablissements/${formation.schoolId}/${formation.urlSlug}/`)
    return [...PAGES, ...schools, ...formations].map((path) => ({ url: `${SITE_URL}${path}` }))
}
