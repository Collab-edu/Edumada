/**
 * Client de l'API Laravel d'Edumada (dossier backend/).
 * Adresse : NEXT_PUBLIC_API_URL (ex. http://localhost:8000/api/v1).
 */
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1').replace(/\/+$/, '')
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/+$/, '')

const TOKEN_KEY = 'edumada_backoffice_token'

export function getToken(): string | null {
    try {
        return localStorage.getItem(TOKEN_KEY)
    } catch {
        return null
    }
}

export function setToken(token: string | null) {
    try {
        if (token) localStorage.setItem(TOKEN_KEY, token)
        else localStorage.removeItem(TOKEN_KEY)
    } catch {
        // Stockage indisponible : la session ne durera que le temps de l'onglet.
    }
}

/** Erreur de l'API : statut HTTP, message et erreurs de validation par champ. */
export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public errors: Record<string, string[]> = {}
    ) {
        super(message)
    }

    field(name: string): string | undefined {
        return this.errors[name]?.[0]
    }

    /** Premier message utile (validation ou message général). */
    get summary(): string {
        return Object.values(this.errors)[0]?.[0] ?? this.message
    }
}

/** Message lisible d'une erreur quelconque. */
export const errorMessage = (error: unknown): string =>
    error instanceof ApiError ? error.summary : error instanceof Error ? error.message : 'Une erreur est survenue.'

export type Query = Record<string, string | number | boolean | null | undefined | (string | number)[]>

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

type ApiOptions = { method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; body?: unknown; query?: Query }

/** Appel de l'API. Une session expirée (401) renvoie à l'écran de connexion. */
export async function api<T = unknown>(path: string, { method = 'GET', body, query }: ApiOptions = {}): Promise<T> {
    const token = getToken()
    const isForm = typeof FormData !== 'undefined' && body instanceof FormData
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`
    if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json'

    let response: Response
    try {
        response = await fetch(`${API_URL}${path}${toQueryString(query)}`, {
            method,
            headers,
            body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
        })
    } catch {
        throw new ApiError("Impossible de joindre l'API Edumada. Vérifiez qu'elle est démarrée.", 0)
    }

    if (response.status === 204) return undefined as T
    const payload = await response.json().catch(() => null)

    if (response.status === 401 && token) {
        setToken(null)
        window.dispatchEvent(new Event('edumada:logout'))
    }
    if (!response.ok) {
        const fallback =
            ({
                401: 'Session expirée : reconnectez-vous.',
                403: "Vous n'avez pas accès à cette action.",
                404: 'Élément introuvable.',
                429: 'Trop de tentatives, patientez une minute.',
            } as Record<number, string>)[response.status] ?? 'Une erreur est survenue.'
        throw new ApiError(payload?.message && response.status !== 500 ? payload.message : fallback, response.status, payload?.errors ?? {})
    }
    return payload as T
}

/** Téléchargement d'un fichier protégé (export CSV, pièce jointe). */
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

/** Erreur de validation d'un champ, si l'erreur vient de l'API. */
export const fieldError = (error: unknown, name: string): string | undefined => (error instanceof ApiError ? error.field(name) : undefined)

/** Erreur générale (sans erreurs de champ), à afficher en tête de formulaire. */
export const isGeneralError = (error: unknown) => !!error && !(error instanceof ApiError && Object.keys(error.errors).length > 0)
