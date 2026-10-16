const number = new Intl.NumberFormat('fr-FR')
const dateTime = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const dateLong = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
const dayShort = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' })

type Num = number | null | undefined

export const formatNumber = (n: Num) => (n === null || n === undefined ? '—' : number.format(n))
export const formatAriary = (n: Num) => (n === null || n === undefined ? '—' : `${number.format(n)} Ar`)
export const formatDateTime = (iso?: string | null) => (iso ? dateTime.format(new Date(iso)) : '—')
export const formatDate = (iso?: string | null) => (iso ? dateLong.format(new Date(iso)) : '—')
/** « 2026-10-16 » → « 16 oct. » (axes des graphiques). */
export const formatDay = (isoDate: string) => dayShort.format(new Date(`${isoDate}T00:00:00Z`))

/** Variation en % entre deux périodes ; null si la précédente est vide. */
export const percentChange = (current: number, previous?: number | null) =>
    previous ? Math.round(((current - previous) / previous) * 1000) / 10 : null
