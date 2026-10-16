import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { readFormationDetails, readSiteData } from '@/data/server'
import { DEFAULT_FIELDS } from '@/features/categories/types'
import FormationDetailPage from '@/features/formations/components/detail/FormationDetailPage'
import { buildFormationFaq } from '@/features/formations/faq'
import { offerFacts } from '@/features/formations/format'

type Props = { params: Promise<{ id: string }> }

// Export statique : une page est générée par offre au moment du build.
export const dynamicParams = false

export function generateStaticParams() {
  return readSiteData().FormationData.map((formation) => ({ id: formation.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const formation = readSiteData().FormationData.find((f) => f.id === id)
  if (!formation) return {}
  const facts = offerFacts(formation).map((f) => f.label).join(', ')
  return {
    title: `${formation.title} — ${formation.school}`,
    description: `${formation.title} à ${formation.city}${facts ? ` (${facts})` : ''} : ${formation.school}, admission, frais, organisation et inscription.`,
  }
}

export default async function FormationPage({ params }: Props) {
  const { id } = await params
  const data = readSiteData()
  const formation = data.FormationData.find((f) => f.id === id)
  const detail = readFormationDetails().find((d) => d.id === id)
  const school = data.SchoolData.find((s) => s.id === formation?.schoolId)
  if (!formation || !detail || !school) notFound()

  const otherFormations = data.FormationData.filter((f) => f.schoolId === school.id && f.id !== formation.id)
  const category = data.CategoryData.find((c) => c.id === formation.category) ?? { ...data.CategoryData[0], fields: DEFAULT_FIELDS }

  // Offres similaires : autres établissements de la même catégorie, d'abord même domaine, puis même diplôme, puis même ville.
  const score = (f: typeof formation) =>
    (f.domain === formation.domain ? 4 : 0) + (f.diploma === formation.diploma ? 2 : 0) + (f.city === formation.city ? 1 : 0)
  const similar = data.FormationData
    .filter((f) => f.schoolId !== school.id && f.category === formation.category)
    .sort((a, b) => score(b) - score(a))
    .slice(0, 8)

  const faq = buildFormationFaq(formation, detail, category.fields)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: formation.title,
    description: detail.description,
    provider: { '@type': 'EducationalOrganization', name: school.name, sameAs: school.website },
    ...(formation.diploma ? { educationalCredentialAwarded: formation.diploma } : {}),
    inLanguage: formation.languages,
  }

  return (
    <main>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <FormationDetailPage
        formation={formation}
        detail={detail}
        school={school}
        category={category}
        otherFormations={otherFormations}
        similar={similar}
        faq={faq}
      />
    </main>
  )
}
