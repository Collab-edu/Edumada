import { useEffect, useState } from 'react'
import withBasePath from '@/lib/base-path'
import type { FooterLinkType, HeaderItem } from '@/types/navigation'
import type { DomainType } from '@/features/domaines/types'
import type { FormationType } from '@/features/formations/types'
import type { SchoolType } from '@/features/etablissements/types'
import type { HeroFilterType } from '@/features/recherche/types'

/** Contenu de `public/data/data.json`. Point d'entrée unique des données du site. */
export type SiteData = {
    HeaderData: HeaderItem[]
    FooterLinkData: FooterLinkType[]
    HeroFilterData: HeroFilterType[]
    DomainData: DomainType[]
    FormationData: FormationType[]
    SchoolData: SchoolType[]
    Companiesdata: { imgSrc: string }[]
}

let request: Promise<SiteData> | null = null

/**
 * Charge les données du site une seule fois, puis réutilise le résultat.
 * Le jour où une API remplacera data.json, seule cette fonction changera.
 */
export function getSiteData(): Promise<SiteData> {
    if (!request) {
        request = fetch(withBasePath('/data/data.json')).then((res) => {
            if (!res.ok) throw new Error(`Failed to fetch site data (${res.status})`)
            return res.json() as Promise<SiteData>
        })
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
