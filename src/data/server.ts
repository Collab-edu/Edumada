import fs from 'node:fs'
import path from 'node:path'
import type { FormationDetailType } from '@/features/formations/types'
import type { SiteData } from './site-data'

const dataDir = path.join(process.cwd(), 'public', 'data')
const readJson = <T,>(file: string): T => JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8')) as T

/**
 * Lecture des données au moment du build (composants serveur uniquement).
 * Sert à générer les pages statiques : fiches d'établissement et de formation.
 */
export function readSiteData(): SiteData {
    return readJson<SiteData>('data.json')
}

/** Contenu détaillé des formations, absent de data.json pour garder l'accueil léger. */
export function readFormationDetails(): FormationDetailType[] {
    return readJson<FormationDetailType[]>('formation-details.json')
}
