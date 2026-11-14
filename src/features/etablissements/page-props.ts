import { DEFAULT_FIELDS, type CategoryType } from '@/features/categories/types'
import type { FormationType } from '@/features/formations/types'
import type { SiteData } from '@/data/site-data'
import { buildSchoolFaq, type FaqItem } from './faq'
import type { SchoolType, TestimonialType } from './types'

export type SchoolPageProps = {
    school: SchoolType
    category: CategoryType
    formations: FormationType[]
    testimonials: TestimonialType[]
    faq: FaqItem[]
}

/** Assemble tout ce qu'affiche la fiche établissement, au build comme dans le navigateur. */
export function buildSchoolPageProps(
    school: SchoolType,
    data: Pick<SiteData, 'FormationData' | 'CategoryData' | 'TestimonialData'>,
    overrides: { formations?: FormationType[]; testimonials?: TestimonialType[]; category?: CategoryType } = {}
): SchoolPageProps {
    const formations = overrides.formations ?? data.FormationData.filter((f) => f.schoolId === school.id)
    const category = overrides.category ?? data.CategoryData.find((c) => c.id === school.category) ?? {
        ...data.CategoryData[0],
        fields: DEFAULT_FIELDS,
    }

    return {
        school,
        category,
        formations,
        testimonials: overrides.testimonials ?? data.TestimonialData.filter((t) => t.schoolId === school.id),
        faq: buildSchoolFaq(school, formations, category.fields),
    }
}
