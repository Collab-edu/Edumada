/**
 * Client de l'API Laravel d'Edumada (dossier backend/).
 * Adresse : VITE_API_URL (ex. http://localhost:8000/api/v1).
 */
export const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1').replace(
  /\/+$/,
  '',
)
export const SITE_URL = (import.meta.env.VITE_SITE_URL ?? 'http://localhost:3000').replace(
  /\/+$/,
  '',
)

const TOKEN_KEY = 'edumada_backoffice_token'

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export const setToken = (token) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Stockage indisponible : la session ne durera que le temps de l'onglet.
  }
}

/** Erreur de l'API : statut HTTP, message et erreurs de validation par champ. */
export class ApiError extends Error {
  constructor(message, status, errors = {}) {
    super(message)
    this.status = status
    this.errors = errors
  }

  field(name) {
    return this.errors[name]?.[0]
  }

  /** Premier message utile (validation ou message général). */
  get summary() {
    return Object.values(this.errors)[0]?.[0] ?? this.message
  }
}

export function toQueryString(query = {}) {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return
    if (Array.isArray(value)) value.forEach((v) => params.append(`${key}[]`, v))
    else params.set(key, value)
  })
  const text = params.toString()
  return text ? `?${text}` : ''
}

/** Appel de l'API. Une session expirée (401) renvoie à l'écran de connexion. */
export async function api(path, { method = 'GET', body, query } = {}) {
  const token = getToken()
  const isForm = body instanceof FormData
  const headers = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json'

  let response
  try {
    response = await fetch(`${API_URL}${path}${toQueryString(query)}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    })
  } catch {
    throw new ApiError("Impossible de joindre l'API Edumada. Vérifiez qu'elle est démarrée.", 0)
  }

  if (response.status === 204) return undefined
  const payload = await response.json().catch(() => null)

  if (response.status === 401 && token) {
    setToken(null)
    window.dispatchEvent(new Event('edumada:logout'))
  }
  if (!response.ok) {
    const fallback =
      {
        401: 'Session expirée : reconnectez-vous.',
        403: "Vous n'avez pas accès à cette action.",
        404: 'Élément introuvable.',
        429: 'Trop de tentatives, patientez une minute.',
      }[response.status] ?? 'Une erreur est survenue.'
    throw new ApiError(
      payload?.message && response.status !== 500 ? payload.message : fallback,
      response.status,
      payload?.errors ?? {},
    )
  }
  return payload
}

/** Téléchargement d'un fichier protégé (export CSV, pièce jointe). */
export async function downloadFile(path, fileName) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${getToken() ?? ''}` },
  })
  if (!response.ok) throw new ApiError('Téléchargement impossible.', response.status)
  const url = URL.createObjectURL(await response.blob())
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}
