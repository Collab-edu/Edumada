import { api, fetchAllPages } from '@/lib/api'
import type { CategoryType } from '@/features/categories/types'
import type { SchoolType, TestimonialType } from '@/features/etablissements/types'
import type { FormationDetailType, FormationType } from '@/features/formations/types'
import type { SiteData } from './site-data'

/** Domaine renvoyé par l'API, avec le nombre réel d'offres publiées. */
type ApiDomain = { id: string; name: string; icon: string | null; count: number }

/** Partie du catalogue servie par l'API ; le reste de SiteData (menus, textes) reste dans data.json. */
export type Catalog = Pick<SiteData, 'CategoryData' | 'SchoolData' | 'FormationData' | 'TestimonialData'> & {
    domains: ApiDomain[]
}

/** Fiche offre complète : `FormationType` + contenu détaillé + établissement. */
export type OfferPage = FormationType & { details: FormationDetailType; establishment: SchoolType }

/** Charge tout le catalogue public depuis l'API (sans jeton : seules les données publiées). */
export async function fetchCatalog(): Promise<Catalog> {
    const [categories, domains, schools, offers, reviews] = await Promise.all([
        api<{ data: CategoryType[] }>('/categories', { token: null }),
        api<{ data: ApiDomain[] }>('/domains', { token: null }),
        fetchAllPages<SchoolType>('/establishments', {}, { token: null }),
        fetchAllPages<FormationType>('/offers', {}, { token: null }),
        fetchAllPages<TestimonialType>('/reviews', {}, { token: null }),
    ])

    return {
        CategoryData: categories.data,
        SchoolData: schools,
        FormationData: offers,
        TestimonialData: reviews,
        domains: domains.data,
    }
}

/**
 * Remplace les données d'exemple par celles de l'API, en gardant la mise en page de data.json :
 * options du filtre « Domaine d'études » et nombre de formations par carte de domaine.
 */
export function mergeCatalog(base: SiteData, catalog: Catalog): SiteData {
    const countByDomain = new Map(catalog.domains.map((d) => [d.name, d.count]))

    return {
        ...base,
        CategoryData: catalog.CategoryData,
        SchoolData: catalog.SchoolData,
        FormationData: catalog.FormationData,
        TestimonialData: catalog.TestimonialData,
        HeroFilterData: base.HeroFilterData.map((filter) =>
            filter.param === 'domaine' && catalog.domains.length > 0
                ? { ...filter, options: [filter.options[0], ...catalog.domains.map((d) => d.name)] }
                : filter
        ),
        DomainData: base.DomainData.map((card) => ({ ...card, count: countByDomain.get(card.searchDomain) ?? 0 })),
    }
}

/** Fiche offre complète depuis l'API ; un jeton permet à l'équipe de prévisualiser un brouillon. */
export async function fetchOfferPage(id: string, token?: string | null): Promise<OfferPage> {
    const res = await api<{ data: OfferPage }>(`/offers/${encodeURIComponent(id)}`, { token })
    return res.data
}
