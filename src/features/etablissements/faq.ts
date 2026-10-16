import type { CategoryType } from '@/features/categories/types'
import { formatAgeRange, formatDate, formatFees } from '@/features/formations/format'
import type { FormationType } from '@/features/formations/types'
import type { SchoolType } from './types'

export type FaqItem = { question: string; answer: string }

const unique = <T,>(values: T[]) => [...new Set(values)]

/** « A », « A et B », « A, B et C » */
function joinFr(items: string[]): string {
    if (items.length <= 1) return items.join('')
    return `${items.slice(0, -1).join(', ')} et ${items[items.length - 1]}`
}

/** « s'élèvent à 80 000 Ar » ou « vont de 80 000 Ar à 140 000 Ar » ; null si aucun montant connu. */
function describeFees(values: (number | null)[]): string | null {
    const known = values.filter((v): v is number => v !== null)
    if (known.length === 0) return null
    const min = Math.min(...known)
    const max = Math.max(...known)
    return min === max ? `s'élèvent à ${formatFees(min)}` : `vont de ${formatFees(min)} à ${formatFees(max)}`
}

/**
 * Questions fréquentes d'un établissement (inscriptions, coûts, diplômes),
 * déduites de ses données et de celles de ses formations.
 */
export function buildSchoolFaq(school: SchoolType, formations: FormationType[], fields: CategoryType['fields']): FaqItem[] {
    // Question sur les diplômes pour les catégories qui en délivrent, sinon sur l'âge d'accueil.
    const diplomas = fields.diplomas ? unique(formations.flatMap((f) => (f.diploma ? [f.diploma] : []))) : []
    const ages = formations.flatMap((f) => (f.ageRange ? [`de ${formatAgeRange(f.ageRange)} (${f.title})`] : []))

    // Regroupe les formations qui partagent la même période : « A et B (du … au …) ».
    const describeGroup = (list: FormationType[]) => {
        const byPeriod = new Map<string, string[]>()
        for (const f of list) {
            const period = f.registrationPeriod
                ? `du ${formatDate(f.registrationPeriod.start)} au ${formatDate(f.registrationPeriod.end)}`
                : 'dates à confirmer'
            byPeriod.set(period, [...(byPeriod.get(period) ?? []), f.title])
        }
        return joinFr([...byPeriod].map(([period, titles]) => `${joinFr(titles)} (${period})`))
    }
    const open = formations.filter((f) => f.registration === 'Ouvertes')
    const upcoming = formations.filter((f) => f.registration === 'À venir')
    const registrationParts: string[] = []
    if (open.length > 0) registrationParts.push(`Les inscriptions sont actuellement ouvertes pour : ${describeGroup(open)}.`)
    if (upcoming.length > 0) registrationParts.push(`Elles ouvriront prochainement pour : ${describeGroup(upcoming)}.`)

    const tuition = describeFees(formations.map((f) => f.fees))
    const registrationFee = describeFees(formations.map((f) => f.registrationFee))
    const period = formations.find((f) => f.fees !== null)?.feesPeriod ?? 'an'
    const feeSentences = [
        tuition && `Les frais de scolarité ${tuition} par ${period} selon l'offre choisie.`,
        registrationFee && `Les frais d'inscription ${registrationFee}.`,
    ].filter(Boolean)

    return [
        {
            question: 'Quand ont lieu les inscriptions ?',
            answer:
                registrationParts.length > 0
                    ? registrationParts.join(' ')
                    : "Aucune période d'inscription n'est communiquée pour le moment. Contactez l'établissement pour connaître les prochaines dates.",
        },
        {
            question: fields.diplomas ? 'Combien coûtent les études ?' : "Quels sont les frais d'accueil ?",
            answer:
                feeSentences.length > 0
                    ? feeSentences.join(' ')
                    : "Les frais ne sont pas encore renseignés. Contactez l'établissement pour les connaître.",
        },
        diplomas.length > 0
            ? {
                  question: 'Quels diplômes peut-on obtenir ? Sont-ils reconnus ?',
                  answer:
                      `L'établissement prépare aux diplômes suivants : ${joinFr(diplomas)}. ` +
                      (school.accreditationVerified && school.accreditation
                          ? `Reconnaissance vérifiée par Edumada : ${school.accreditation}.`
                          : "Aucune information de reconnaissance ou d'accréditation n'est vérifiée pour le moment : renseignez-vous auprès de l'établissement avant de vous inscrire."),
              }
            : {
                  question: 'À partir de quel âge les enfants sont-ils accueillis ?',
                  answer: ages.length > 0
                      ? `L'établissement accueille les enfants ${joinFr(ages)}.`
                      : "L'âge d'accueil n'est pas encore renseigné. Contactez l'établissement.",
              },
    ]
}
