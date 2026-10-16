'use client'
import { useEffect, useState } from 'react'
import { api, ApiError, apiEnabled } from '@/lib/api'

/** Actualité publiée, telle que renvoyée par l'API (GET /articles). */
export type Article = {
    id: string
    title: string
    category: string
    categoryLabel: string
    excerpt: string
    /** Absent de la liste : seulement sur la page de l'article. */
    content?: string
    coverImage: string | null
    publishedAt: string | null
}

/** Mêmes rubriques que Article::CATEGORIES côté API. */
export const ARTICLE_CATEGORIES = [
    { value: 'actualite', label: 'Actualité' },
    { value: 'orientation', label: 'Orientation' },
    { value: 'conseils', label: 'Conseils' },
    { value: 'evenement', label: 'Événement' },
]

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

/** « 18 octobre 2026 ». */
export const formatArticleDate = (iso: string | null) => (iso ? dateFormatter.format(new Date(iso)) : '')

/** Liste des actualités publiées, filtrée par rubrique. */
export function useArticles(category: string) {
    const [articles, setArticles] = useState<Article[]>([])
    const [loading, setLoading] = useState(apiEnabled)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!apiEnabled) return
        const controller = new AbortController()
        setLoading(true)
        setError(null)
        api<{ data: Article[] }>('/articles', { query: { category, per_page: 50 }, signal: controller.signal, token: null })
            .then((res) => setArticles(res.data))
            .catch((err) => (err as Error).name !== 'AbortError' && setError((err as ApiError).message))
            .finally(() => !controller.signal.aborted && setLoading(false))
        return () => controller.abort()
    }, [category])

    return { articles, loading, error }
}

/** Un article publié ; `notFound` si l'identifiant ne correspond à rien. */
export function useArticle(id: string) {
    const [article, setArticle] = useState<Article | null>(null)
    const [loading, setLoading] = useState(apiEnabled && !!id)
    const [error, setError] = useState<{ status: number; message: string } | null>(null)

    useEffect(() => {
        if (!apiEnabled || !id) return
        const controller = new AbortController()
        setLoading(true)
        api<{ data: Article }>(`/articles/${encodeURIComponent(id)}`, { signal: controller.signal, token: null })
            .then((res) => setArticle(res.data))
            .catch((err) => (err as Error).name !== 'AbortError' && setError({ status: (err as ApiError).status, message: (err as ApiError).message }))
            .finally(() => !controller.signal.aborted && setLoading(false))
        return () => controller.abort()
    }, [id])

    return { article, loading, error }
}
