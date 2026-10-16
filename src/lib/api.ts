/**
 * Client de l'API Laravel d'Edumada (backend/).
 * L'adresse vient de NEXT_PUBLIC_API_URL (ex. http://localhost:8000/api/v1) ; sans elle,
 * le site fonctionne en mode statique avec les fichiers de public/data/.
 */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '')
export const apiEnabled = API_URL !== ''

const TOKEN_KEY = 'edumada_token'

export function getToken(): string | null {
    if (typeof window === 'undefined') return null
    try {
        return window.localStorage.getItem(TOKEN_KEY)
    } catch {
        return null
    }
}

export function setToken(token: string | null) {
    try {
        if (token) window.localStorage.setItem(TOKEN_KEY, token)
        else window.localStorage.removeItem(TOKEN_KEY)
    } catch {
        // Stockage indisponible (navigation privée) : la session ne durera que le temps de la page.
    }
}

/** Erreur renvoyée par l'API : statut HTTP, message et erreurs de validation par champ. */
export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public errors: Record<string, string[]> = {}
    ) {
        super(message)
    }

    /** Premier message d'erreur d'un champ (« email », « details.costs.status »…). */
    field(name: string): string | undefined {
        return this.errors[name]?.[0]
    }
}

type Query = Record<string, string | number | boolean | null | undefined | (string | number)[]>

export type ApiOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    body?: unknown
    query?: Query
    signal?: AbortSignal
    /** Jeton explicite (sinon celui du navigateur). */
    token?: string | null
}

/** Construit `?a=1&b[]=x&b[]=y` en ignorant les valeurs vides. */
export function toQueryString(query: Query = {}): string {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
        if (value === null || value === undefined || value === '') continue
        if (Array.isArray(value)) value.forEach((v) => params.append(`${key}[]`, String(v)))
        else params.set(key, String(value))
    }
    const text = params.toString()
    return text ? `?${text}` : ''
}

const NETWORK_ERROR = "Impossible de joindre Edumada. Vérifiez votre connexion et réessayez."

export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
    if (!apiEnabled) throw new ApiError("Le service en ligne d'Edumada n'est pas configuré.", 0)

    const token = options.token === undefined ? getToken() : options.token
    const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`
    if (options.body !== undefined && !isForm) headers['Content-Type'] = 'application/json'

    let response: Response
    try {
        response = await fetch(`${API_URL}${path}${toQueryString(options.query)}`, {
            method: options.method ?? 'GET',
            headers,
            body: options.body === undefined ? undefined : isForm ? (options.body as FormData) : JSON.stringify(options.body),
            signal: options.signal,
        })
    } catch (error) {
        if ((error as Error).name === 'AbortError') throw error
        throw new ApiError(NETWORK_ERROR, 0)
    }

    if (response.status === 204) return undefined as T

    const payload = await response.json().catch(() => null)
    if (!response.ok) {
        const fallback =
            response.status === 401
                ? 'Votre session a expiré. Reconnectez-vous.'
                : response.status === 404
                    ? 'Élément introuvable.'
                    : response.status === 429
                        ? 'Trop de tentatives. Patientez une minute puis réessayez.'
                        : 'Une erreur est survenue. Réessayez dans un instant.'
        throw new ApiError(payload?.message && response.status !== 500 ? payload.message : fallback, response.status, payload?.errors ?? {})
    }
    return payload as T
}

/** Télécharge un fichier protégé (export CSV, pièce jointe) avec le jeton de l'utilisateur. */
export async function downloadFile(path: string, fileName: string) {
    const response = await fetch(`${API_URL}${path}`, { headers: { Authorization: `Bearer ${getToken() ?? ''}` } })
    if (!response.ok) throw new ApiError('Téléchargement impossible.', response.status)
    const url = URL.createObjectURL(await response.blob())
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
}

/** Réponse paginée de Laravel. */
export type Paginated<T> = {
    data: T[]
    meta: { current_page: number; last_page: number; total: number; per_page: number }
}

/** Lit toutes les pages d'une liste (catalogue complet pour le build ou le cache du site). */
export async function fetchAllPages<T>(path: string, query: Query = {}, options: ApiOptions = {}): Promise<T[]> {
    const first = await api<Paginated<T>>(path, { ...options, query: { ...query, perPage: 100, page: 1 } })
    const pages = await Promise.all(
        Array.from({ length: first.meta.last_page - 1 }, (_, i) =>
            api<Paginated<T>>(path, { ...options, query: { ...query, perPage: 100, page: i + 2 } })
        )
    )
    return [first, ...pages].flatMap((page) => page.data)
}
