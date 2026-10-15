import fs from 'node:fs'
import path from 'node:path'
import type { SiteData } from './site-data'

/**
 * Lecture des données au moment du build (composants serveur uniquement).
 * Sert à générer les pages statiques, comme les fiches d'établissement.
 */
export function readSiteData(): SiteData {
    const file = path.join(process.cwd(), 'public', 'data', 'data.json')
    return JSON.parse(fs.readFileSync(file, 'utf8')) as SiteData
}
