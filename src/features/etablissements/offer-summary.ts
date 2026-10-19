import { formatAgeRange, formatTuition } from '@/features/formations/format'
import type { Diploma, FormationType } from '@/features/formations/types'

/** Ordre des diplômes, du plus court au plus long (les diplômes scolaires avant le supérieur). */
const DIPLOMA_ORDER: Diploma[] = ['CEPE', 'BEPC', 'BAC', 'Certificat', 'BTS', 'Licence', 'Master', 'Doctorat']

export type OfferSummary = {
    /** « 3 formations », « 4 niveaux scolaires »… */
    count: string
    /** « Licence → Master », ou les âges accueillis pour une crèche. */
    range: string | null
    /** Frais les plus bas : « Dès 1 200 000 Ar / an ». */
    fees: string | null
    registration: 'Inscriptions ouvertes' | 'Inscriptions à venir' | null
}

const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`

/** Résumé des offres publiées d'un établissement, pour sa carte. Null s'il n'en a aucune. */
export function summarizeOffers(offers: FormationType[]): OfferSummary | null {
    if (offers.length === 0) return null

    const kinds = new Set(offers.map((offer) => offer.kind))
    const count =
        kinds.size === 1 && kinds.has('formation')
            ? plural(offers.length, 'formation', 'formations')
            : kinds.size === 1 && kinds.has('niveau')
              ? plural(offers.length, 'niveau scolaire', 'niveaux scolaires')
              : plural(offers.length, 'offre', 'offres')

    const diplomas = DIPLOMA_ORDER.filter((diploma) => offers.some((offer) => offer.diploma === diploma))
    const ages = offers.map((offer) => offer.ageRange).filter((range) => range !== null)
    const range =
        diplomas.length > 1
            ? `${diplomas[0]} → ${diplomas[diplomas.length - 1]}`
            : diplomas.length === 1
              ? diplomas[0]
              : ages.length > 0
                ? `Âges : ${formatAgeRange({ min: Math.min(...ages.map((a) => a.min)), max: Math.max(...ages.map((a) => a.max)) })}`
                : null

    // Frais d'entrée : le moins cher, dans la période la plus courante (par an ou par mois).
    const priced = offers.filter((offer) => offer.fees !== null)
    const periods = priced.map((offer) => offer.feesPeriod)
    const period = periods.filter((p) => p === 'mois').length > periods.length / 2 ? 'mois' : 'an'
    const cheapest = priced.filter((offer) => offer.feesPeriod === period).sort((a, b) => (a.fees ?? 0) - (b.fees ?? 0))[0]
    const tuition = cheapest ? formatTuition(cheapest) : null

    const registration = offers.some((offer) => offer.registration === 'Ouvertes')
        ? 'Inscriptions ouvertes'
        : offers.some((offer) => offer.registration === 'À venir')
          ? 'Inscriptions à venir'
          : null

    return { count, range, fees: tuition ? `Dès ${tuition}` : null, registration }
}
