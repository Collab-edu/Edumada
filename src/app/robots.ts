import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-url'

// Export statique : le fichier est écrit au build (out/robots.txt).
export const dynamic = 'force-static'

/** robots.txt : tout le site public est explorable, sauf l'espace personnel des étudiants. */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: { userAgent: '*', allow: '/', disallow: ['/espace/'] },
        sitemap: `${SITE_URL}/sitemap.xml`,
    }
}
