import { DEFAULT_FIELDS, type CategoryType } from '@/features/categories/types'
import type { FaqItem } from '@/features/etablissements/faq'
import type { SchoolType } from '@/features/etablissements/types'
import type { SiteData } from '@/data/site-data'
import { buildFormationFaq } from './faq'
import type { FormationDetailType, FormationType } from './types'

export type FormationPageProps = {
    formation: FormationType
    detail: FormationDetailType
    school: SchoolType
    category: CategoryType
    otherFormations: FormationType[]
    similar: FormationType[]
    faq: FaqItem[]
}

/**
 * Assemble tout ce qu'affiche la fiche offre, au build comme dans le navigateur.
 * `school` peut venir directement de l'API (fiche offre) quand l'établissement n'est pas dans le catalogue chargé.
 */
export function buildFormationPageProps(
    formation: FormationType,
    detail: FormationDetailType,
    data: Pick<SiteData, 'FormationData' | 'SchoolData' | 'CategoryData'>,
    school: SchoolType | undefined = data.SchoolData.find((s) => s.id === formation.schoolId)
): FormationPageProps | null {
    if (!school) return null

    const otherFormations = data.FormationData.filter((f) => f.schoolId === school.id && f.id !== formation.id)
    const category = data.CategoryData.find((c) => c.id === formation.category) ?? { ...data.CategoryData[0], fields: DEFAULT_FIELDS }

    // Offres similaires : autres établissements de la même catégorie, d'abord même domaine, puis même diplôme, puis même ville.
    const score = (f: FormationType) =>
        (f.domain === formation.domain ? 4 : 0) + (f.diploma === formation.diploma ? 2 : 0) + (f.city === formation.city ? 1 : 0)
    const similar = data.FormationData
        .filter((f) => f.schoolId !== school.id && f.category === formation.category)
        .sort((a, b) => score(b) - score(a))
        .slice(0, 8)

    return {
        formation,
        detail,
        school,
        category,
        otherFormations,
        similar,
        faq: buildFormationFaq(formation, detail, category.fields),
    }
}
