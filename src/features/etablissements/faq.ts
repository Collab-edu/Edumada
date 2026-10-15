import { formatDate, formatFees } from '@/features/formations/format'
import type { FormationType, Modality } from '@/features/formations/types'
import type { SchoolType } from './types'

export type FaqItem = { question: string; answer: string }

const unique = <T,>(values: T[]) => [...new Set(values)]

const MODALITY_LABEL: Record<Modality, string> = {
    Présentiel: 'en présentiel',
    Hybride: 'en hybride',
    Distanciel: 'à distance',
}

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

/** Questions fréquentes d'un établissement, déduites de ses données et de celles de ses formations. */
export function buildSchoolFaq(school: SchoolType, formations: FormationType[]): FaqItem[] {
    const items: FaqItem[] = []

    items.push({
        question: "Comment s'inscrire dans cet établissement ?",
        answer:
            `Les inscriptions se font directement auprès de l'établissement. Vous pouvez le contacter au ${school.phone}, ` +
            `par e-mail à ${school.email} ou vous rendre sur place : ${school.address}. ` +
            `Préparez votre dernier diplôme et vos relevés de notes.`,
    })

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
    items.push({
        question: 'Quand ont lieu les inscriptions ?',
        answer:
            registrationParts.length > 0
                ? registrationParts.join(' ')
                : "Aucune période d'inscription n'est communiquée pour le moment. Contactez l'établissement pour connaître les prochaines dates.",
    })

    const tuition = describeFees(formations.map((f) => f.fees))
    const registrationFee = describeFees(formations.map((f) => f.registrationFee))
    const feeSentences = [
        tuition && `Les frais de scolarité ${tuition} par an selon la formation.`,
        registrationFee && `Les frais d'inscription ${registrationFee}.`,
    ].filter(Boolean)
    items.push({
        question: 'Combien coûtent les études ?',
        answer:
            feeSentences.length > 0
                ? feeSentences.join(' ')
                : "Les frais ne sont pas encore renseignés. Contactez l'établissement pour les connaître.",
    })

    const diplomas = unique(formations.map((f) => f.diploma))
    items.push({
        question: 'Quels diplômes peut-on obtenir ? Sont-ils reconnus ?',
        answer:
            `L'établissement prépare aux diplômes suivants : ${joinFr(diplomas)}. ` +
            (school.accreditation
                ? `Reconnaissance indiquée : ${school.accreditation}.`
                : "Aucune information de reconnaissance ou d'accréditation n'est renseignée : renseignez-vous auprès de l'établissement avant de vous inscrire."),
    })

    const withoutBac = formations.filter((f) => f.admission.level === 'Aucun')
    items.push({
        question: 'Faut-il avoir le BAC pour y étudier ?',
        answer:
            withoutBac.length > 0 && withoutBac.length === formations.length
                ? 'Non : toutes les formations de cet établissement sont accessibles sans le BAC.'
                : withoutBac.length > 0
                ? `Certaines formations sont accessibles sans le BAC : ${joinFr(withoutBac.map((f) => f.title))}. Les autres demandent au minimum le baccalauréat.`
                : 'Oui : toutes les formations de cet établissement demandent au minimum le baccalauréat.' +
                  (formations.some((f) => f.admission.level === 'BAC+3') ? ' Les masters demandent une licence (BAC+3).' : ''),
    })

    const modalities = unique(formations.map((f) => f.modality))
    items.push({
        question: 'Peut-on suivre les cours à distance ?',
        answer: modalities.some((m) => m !== 'Présentiel')
            ? `${modalities.includes('Présentiel') ? 'Oui, en partie' : 'Oui'}. Les formations sont proposées ${joinFr(modalities.map((m) => MODALITY_LABEL[m]))}. Consultez le détail de chaque formation ci-dessus.`
            : 'Non, toutes les formations de cet établissement se déroulent en présentiel.',
    })

    items.push({
        question: "Dans quelles langues les cours sont-ils dispensés ?",
        answer: `Les cours sont dispensés en ${joinFr(unique(formations.flatMap((f) => f.languages)).map((l) => l.toLowerCase()))}.`,
    })

    const hasScholarship = formations.some((f) => f.scholarship === 'Bourses disponibles')
    items.push({
        question: 'Des bourses sont-elles disponibles ?',
        answer: hasScholarship
            ? "Oui, des bourses sont disponibles pour certaines formations. Les conditions d'attribution sont à demander directement à l'établissement."
            : "Aucune bourse n'est renseignée pour le moment. Renseignez-vous auprès de l'établissement.",
    })

    const housing = unique(formations.map((f) => f.housing))
    items.push({
        question: "L'établissement propose-t-il un hébergement ?",
        answer: housing.includes('Disponible')
            ? "Oui, un hébergement est proposé aux étudiants. Le nombre de places étant limité, faites la demande dès l'inscription."
            : housing.includes('Non disponible')
                ? "Non, l'établissement ne propose pas d'hébergement."
                : "Cette information n'est pas encore renseignée.",
    })

    return items
}
