const number = new Intl.NumberFormat('fr-FR')
const dateTime = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})
const dateLong = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const dayShort = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})

export const formatNumber = (n) => (n === null || n === undefined ? '—' : number.format(n))
export const formatAriary = (n) => (n === null || n === undefined ? '—' : `${number.format(n)} Ar`)
export const formatDateTime = (iso) => (iso ? dateTime.format(new Date(iso)) : '—')
export const formatDate = (iso) => (iso ? dateLong.format(new Date(iso)) : '—')
/** « 2026-10-16 » → « 16 oct. » (axes des graphiques). */
export const formatDay = (isoDate) => dayShort.format(new Date(`${isoDate}T00:00:00Z`))

/** Variation en % entre deux périodes ; null si la précédente est vide. */
export const percentChange = (current, previous) =>
  previous ? Math.round(((current - previous) / previous) * 1000) / 10 : null
