'use client'
import { useEffect, useMemo, useState } from 'react'
import { api, apiEnabled, type Paginated } from '@/lib/api'
import { useSiteData } from '@/data/site-data'
import type { FormationType } from '@/features/formations/types'
import { BUDGET_RANGES, matchesFilters, sortFormations, type SearchFilters, type SortValue } from './filters'

const PAGE_SIZE = 20

const REGISTRATION_VALUE: Record<string, string> = {
    'Inscriptions ouvertes': 'Ouvertes',
    'À venir': 'À venir',
}

/** Traduit les filtres de la page en paramètres de GET /offers (mêmes libellés que le site). */
export function toApiQuery(filters: SearchFilters, sort: SortValue) {
    return {
        q: filters.q.trim(),
        category: filters.categorie,
        domain: filters.domaine,
        city: filters.ville,
        near: filters.pos,
        type: filters.type,
        school: filters.school.trim(),
        feeRanges: BUDGET_RANGES.filter((r) => filters.budgets.includes(r.label)).map((r) => `${r.min}-${Number.isFinite(r.max) ? r.max : ''}`),
        durations: filters.durations,
        modalities: filters.modalities,
        diplomas: filters.diplomas,
        registration: REGISTRATION_VALUE[filters.registration] ?? '',
        languages: filters.languages,
        level: filters.admissionLevel === 'Tous les niveaux' ? '' : filters.admissionLevel,
        bacSeries: filters.bacSeries,
        housing: filters.housing,
        scholarships: filters.scholarships,
        childAge: filters.childAge,
        sort: sort === 'pertinence' ? '' : sort,
    }
}

/** Recherche autour d'un lieu sans offre (« Talatamaty ») : résultats triés par distance. */
export type NearPlace = { place: string; label: string; lat: number; lng: number }

type SearchResponse = Paginated<FormationType> & { near?: NearPlace | null; placeNotFound?: boolean }

type SearchState = {
    results: FormationType[]
    near: NearPlace | null
    placeNotFound: boolean
    total: number
    loading: boolean
    loadingMore: boolean
    hasMore: boolean
    /** true si l'API n'a pas répondu et que l'on filtre les données locales. */
    offline: boolean
    loadMore: () => void
}

/**
 * Résultats de la recherche : filtrés par l'API (avec pagination) quand elle est configurée,
 * sinon (ou en cas de panne) filtrés dans le navigateur sur les données locales.
 */
/** Durée affichée du chargement d'une recherche, en millisecondes. */
const MIN_LOADING_MS = 1000
const MAX_LOADING_MS = 3000

export function useOfferSearch(filters: SearchFilters, sort: SortValue): SearchState {
    const { data: formations, loading: localLoading } = useSiteData('FormationData')
    const { data: categories } = useSiteData('CategoryData')
    const { data: schools } = useSiteData('SchoolData')
    const [remote, setRemote] = useState<{ results: FormationType[]; total: number; page: number; lastPage: number; near: NearPlace | null; placeNotFound: boolean } | null>(null)
    const [loading, setLoading] = useState(apiEnabled)
    const [loadingMore, setLoadingMore] = useState(false)
    const [offline, setOffline] = useState(!apiEnabled)

    const query = useMemo(() => toApiQuery(filters, sort), [filters, sort])
    const queryKey = JSON.stringify(query)

    // Chaque nouvelle recherche affiche le chargement 1 à 3 s, même si la réponse arrive plus tôt.
    const [pacing, setPacing] = useState(true)
    useEffect(() => {
        setPacing(true)
        const timer = setTimeout(() => setPacing(false), MIN_LOADING_MS + Math.random() * (MAX_LOADING_MS - MIN_LOADING_MS))
        return () => clearTimeout(timer)
    }, [queryKey])

    useEffect(() => {
        if (!apiEnabled) return
        const controller = new AbortController()
        setLoading(true)
        // Petite attente pour ne pas interroger l'API à chaque lettre tapée.
        const timer = setTimeout(() => {
            api<SearchResponse>('/offers', { query: { ...query, perPage: PAGE_SIZE }, signal: controller.signal, token: null })
                .then((res) => {
                    setRemote({
                        results: res.data,
                        total: res.meta.total,
                        page: 1,
                        lastPage: res.meta.last_page,
                        near: res.near ?? null,
                        placeNotFound: !!res.placeNotFound,
                    })
                    setOffline(false)
                })
                .catch((error) => {
                    if (error?.name === 'AbortError') return
                    setOffline(true)
                    setRemote(null)
                })
                .finally(() => {
                    if (!controller.signal.aborted) setLoading(false)
                })
        }, 300)
        return () => {
            clearTimeout(timer)
            controller.abort()
        }
        // queryKey résume `query`.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryKey])

    const local = useMemo(() => {
        if (!offline) return []
        const kindsOf = (f: FormationType) => [categories.find((c) => c.id === f.category)?.shortLabel, schools.find((s) => s.id === f.schoolId)?.subCategory]
        return sortFormations(formations.filter((f) => matchesFilters(f, filters, kindsOf)), sort)
    }, [offline, formations, categories, schools, filters, sort])

    const loadMore = () => {
        if (!remote || remote.page >= remote.lastPage || loadingMore) return
        setLoadingMore(true)
        api<Paginated<FormationType>>('/offers', { query: { ...query, perPage: PAGE_SIZE, page: remote.page + 1 }, token: null })
            .then((res) =>
                setRemote((prev) => prev && { ...prev, results: [...prev.results, ...res.data], page: res.meta.current_page, lastPage: res.meta.last_page })
            )
            .catch(() => undefined)
            .finally(() => setLoadingMore(false))
    }

    if (offline) {
        return { results: local, total: local.length, loading: localLoading || pacing, loadingMore: false, hasMore: false, offline: apiEnabled, loadMore, near: null, placeNotFound: false }
    }
    return {
        results: remote?.results ?? [],
        total: remote?.total ?? 0,
        loading: loading || pacing,
        loadingMore,
        hasMore: !!remote && remote.page < remote.lastPage,
        offline: false,
        loadMore,
        near: remote?.near ?? null,
        placeNotFound: remote?.placeNotFound ?? false,
    }
}

export type SponsoredOffer = {
    campaignId: number
    title: string
    description: string | null
    callToAction: string | null
    offer: FormationType
}

/** Offres mises en avant par une campagne Premium, ciblées sur la recherche en cours. */
export function useSponsoredOffers(filters: SearchFilters): SponsoredOffer[] {
    const [items, setItems] = useState<SponsoredOffer[]>([])
    const key = `${filters.categorie}|${filters.domaine}|${filters.ville}`

    useEffect(() => {
        if (!apiEnabled) return
        let active = true
        api<{ data: SponsoredOffer[] }>('/sponsored', {
            query: { category: filters.categorie, domain: filters.domaine, city: filters.ville, limit: 2 },
            token: null,
        })
            .then((res) => active && setItems(res.data))
            .catch(() => active && setItems([]))
        return () => {
            active = false
        }
        // key résume les trois filtres de ciblage.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key])

    return items
}
