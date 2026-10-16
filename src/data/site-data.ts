import { useEffect, useState } from 'react'
import withBasePath from '@/lib/base-path'
import { apiEnabled } from '@/lib/api'
import type { FooterLinkType, HeaderItem } from '@/types/navigation'
import type { DomainType } from '@/features/domaines/types'
import type { FormationType } from '@/features/formations/types'
import type { CategoryType } from '@/features/categories/types'
import type { SchoolType, TestimonialType } from '@/features/etablissements/types'
import type { HeroFilterType } from '@/features/recherche/types'
import { fetchCatalog, mergeCatalog } from './catalog'

/** Contenu de `public/data/data.json`. Point d'entrée unique des données du site. */
export type SiteData = {
    HeaderData: HeaderItem[]
    FooterLinkData: FooterLinkType[]
    HeroFilterData: HeroFilterType[]
    DomainData: DomainType[]
    FormationData: FormationType[]
    CategoryData: CategoryType[]
    SchoolData: SchoolType[]
    TestimonialData: TestimonialType[]
    Companiesdata: { imgSrc: string }[]
}

let request: Promise<SiteData> | null = null

/** D'où viennent les données affichées : l'API, ou les fichiers d'exemple si elle est indisponible. */
export let siteDataSource: 'api' | 'fichiers' = 'fichiers'

async function loadSiteData(): Promise<SiteData> {
    const res = await fetch(withBasePath('/data/data.json'))
    if (!res.ok) throw new Error(`Failed to fetch site data (${res.status})`)
    const base = (await res.json()) as SiteData
    if (!apiEnabled) return base

    try {
        const data = mergeCatalog(base, await fetchCatalog())
        siteDataSource = 'api'
        return data
    } catch (error) {
        // API injoignable : le site reste utilisable avec les données de data.json.
        console.warn('API Edumada indisponible, affichage des données locales.', error)
        return base
    }
}

/**
 * Charge les données du site une seule fois, puis réutilise le résultat :
 * menus et textes depuis data.json, catalogue depuis l'API quand elle est configurée.
 */
export function getSiteData(): Promise<SiteData> {
    if (!request) {
        request = loadSiteData()
        // En cas d'échec, on autorise une nouvelle tentative au prochain appel.
        request.catch(() => {
            request = null
        })
    }
    return request
}

/** Lit une clé des données du site depuis un composant client. */
export function useSiteData<K extends keyof SiteData>(key: K) {
    const [data, setData] = useState<SiteData[K]>([] as unknown as SiteData[K])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let active = true
        getSiteData()
            .then((all) => {
                if (active) setData(all[key])
            })
            .catch((error) => console.error('Error fetching site data:', error))
            .finally(() => {
                if (active) setLoading(false)
            })
        return () => {
            active = false
        }
    }, [key])

    return { data, loading }
}
