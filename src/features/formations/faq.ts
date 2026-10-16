import type { FaqItem } from '@/features/etablissements/faq'
import { formatDate } from './format'
import type { FormationDetailType, FormationType } from './types'

/** Questions fréquentes d'une formation, déduites de ses données. */
export function buildFormationFaq(formation: FormationType, detail: FormationDetailType): FaqItem[] {
    const { level } = formation.admission
    return [
        {
            question: 'Puis-je postuler sans le baccalauréat ?',
            answer:
                level === 'Aucun'
                    ? 'Oui, aucun diplôme n’est exigé pour cette formation.'
                    : level === 'BAC'
                        ? 'Non, le baccalauréat ou un diplôme équivalent est exigé.'
                        : `Non, cette formation demande un niveau ${level}.`,
        },
        {
            question: 'Quand commence la formation ?',
            answer: formation.startDate
                ? `La prochaine rentrée est prévue le ${formatDate(formation.startDate)}.` +
                  (formation.registrationPeriod
                      ? ` Les candidatures sont reçues du ${formatDate(formation.registrationPeriod.start)} au ${formatDate(formation.registrationPeriod.end)}.`
                      : '')
                : "La date de rentrée n'est pas encore communiquée.",
        },
        {
            question: 'Puis-je travailler en parallèle de mes études ?',
            answer: detail.organization.rhythm.includes('Temps partiel')
                ? `Oui, la formation peut se suivre à temps partiel (${formation.modality.toLowerCase()}).`
                : 'Difficilement : la formation se suit à temps plein, en présentiel, en journée.',
        },
    ]
}
