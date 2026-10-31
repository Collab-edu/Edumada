import type { CategoryType } from '@/features/categories/types'
import type { FaqItem } from '@/features/etablissements/faq'
import { formatAgeRange, formatDate } from './format'
import type { FormationDetailType, FormationType } from './types'

/** Questions fréquentes d'une offre, déduites de ses données et adaptées à la catégorie. */
export function buildFormationFaq(
    formation: FormationType,
    detail: FormationDetailType,
    fields: CategoryType['fields']
): FaqItem[] {
    const { level } = formation.admission

    const eligibility: FaqItem = formation.kind === 'niveau'
        ? {
              question: 'Quelles sont les conditions pour intégrer ce niveau ?',
              answer: `${detail.admission.prerequisites.join('. ')}.` +
                  (formation.ageRange ? ` Âge habituel des élèves : ${formatAgeRange(formation.ageRange)}.` : ''),
          }
        : fields.level
        ? {
              question: 'Puis-je postuler sans le baccalauréat ?',
              answer:
                  level === 'Aucun'
                      ? 'Oui, aucun diplôme n’est exigé pour cette offre.'
                      : level === 'BAC'
                          ? 'Non, le baccalauréat ou un diplôme équivalent est exigé.'
                          : `Non, cette formation demande un niveau ${level}.`,
          }
        : {
              question: 'À quel âge mon enfant peut-il être accueilli ?',
              answer: formation.ageRange
                  ? `Les enfants sont accueillis de ${formatAgeRange(formation.ageRange)}.`
                  : "L'âge d'accueil n'est pas encore communiqué.",
          }

    const start: FaqItem = {
        question: formation.kind === 'accueil' ? "Quand peut commencer l'accueil ?" : 'Quand a lieu la rentrée ?',
        answer: formation.startDate
            ? `La prochaine rentrée est prévue le ${formatDate(formation.startDate)}.` +
              (formation.registrationPeriod
                  ? ` Les inscriptions sont reçues du ${formatDate(formation.registrationPeriod.start)} au ${formatDate(formation.registrationPeriod.end)}.`
                  : '')
            : "La date de rentrée n'est pas encore communiquée.",
    }

    const rhythm: FaqItem = fields.careers
        ? {
              question: 'Puis-je travailler en parallèle de mes études ?',
              answer: detail.organization.rhythm.includes('Temps partiel')
                  ? `Oui, la formation peut se suivre à temps partiel (${formation.modality.toLowerCase()}).`
                  : 'Difficilement : la formation se suit à temps plein, en présentiel, en journée.',
          }
        : {
              question: formation.kind === 'accueil' ? "Quels sont les horaires d'accueil ?" : 'Quels sont les horaires des cours ?',
              answer: detail.organization.schedule
                  ? `${detail.organization.schedule}. Formules possibles : ${detail.organization.rhythm.join(', ').toLowerCase()}.`
                  : "Les horaires ne sont pas encore communiqués.",
          }

    return [eligibility, start, rhythm]
}
