import fs from 'node:fs'
import path from 'node:path'
import { apiEnabled } from '@/lib/api'
import type { FormationDetailType } from '@/features/formations/types'
import type { SiteData } from './site-data'
import { fetchCatalog, fetchOfferPage, mergeCatalog } from './catalog'

const dataDir = path.join(process.cwd(), 'public', 'data')
const readJson = <T,>(file: string): T => JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8')) as T

let siteData: Promise<SiteData> | null = null
let details: Promise<FormationDetailType[]> | null = null

/**
 * Données du site au moment du build (composants serveur uniquement), pour générer les pages statiques.
 * Avec NEXT_PUBLIC_API_URL, le catalogue vient de l'API ; si elle ne répond pas, le build continue
 * avec les fichiers de public/data/ et le signale.
 */
export function readSiteData(): Promise<SiteData> {
    siteData ??= (async () => {
        const base = readJson<SiteData>('data.json')
        if (!apiEnabled) return base
        try {
            return mergeCatalog(base, await fetchCatalog())
        } catch (error) {
            console.warn(`[edumada] API indisponible pendant le build, utilisation de public/data : ${(error as Error).message}`)
            return base
        }
    })()
    return siteData
}

/** Contenu détaillé des offres (absent de data.json pour garder l'accueil léger). */
export function readFormationDetails(): Promise<FormationDetailType[]> {
    details ??= (async () => {
        if (!apiEnabled) return readJson<FormationDetailType[]>('formation-details.json')
        try {
            const { FormationData } = await readSiteData()
            const result: FormationDetailType[] = []
            // Par lots de 8 requêtes pour ménager l'API.
            for (let i = 0; i < FormationData.length; i += 8) {
                const pages = await Promise.all(FormationData.slice(i, i + 8).map((f) => fetchOfferPage(f.id, null)))
                result.push(...pages.map((page) => page.details))
            }
            return result
        } catch (error) {
            console.warn(`[edumada] Détails des offres indisponibles, utilisation de public/data : ${(error as Error).message}`)
            return readJson<FormationDetailType[]>('formation-details.json')
        }
    })()
    return details
}
