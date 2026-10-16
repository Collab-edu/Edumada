import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { readFormationDetails, readSiteData } from '@/data/server'
import FormationDetailPage from '@/features/formations/components/detail/FormationDetailPage'
import { buildFormationFaq } from '@/features/formations/faq'
import { formatDuration } from '@/features/formations/format'

type Props = { params: Promise<{ id: string }> }

// Export statique : une page est générée par formation au moment du build.
export const dynamicParams = false

export function generateStaticParams() {
  return readSiteData().FormationData.map((formation) => ({ id: formation.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const formation = readSiteData().FormationData.find((f) => f.id === id)
  if (!formation) return {}
  return {
    title: `${formation.title} — ${formation.school}`,
    description: `${formation.title} à ${formation.city} (${formation.diploma}, ${formatDuration(formation.durationYears)}) : programme, admission, frais, débouchés et candidature.`,
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

  // Formations similaires : autres établissements, d'abord même domaine, puis même diplôme, puis même ville.
  const score = (f: typeof formation) =>
    (f.domain === formation.domain ? 4 : 0) + (f.diploma === formation.diploma ? 2 : 0) + (f.city === formation.city ? 1 : 0)
  const similar = data.FormationData
    .filter((f) => f.schoolId !== school.id)
    .sort((a, b) => score(b) - score(a))
    .slice(0, 8)

  const faq = buildFormationFaq(formation, detail)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: formation.title,
    description: detail.description,
    provider: { '@type': 'EducationalOrganization', name: school.name, sameAs: school.website },
    educationalCredentialAwarded: formation.diploma,
    inLanguage: formation.languages,
  }

  return (
    <main>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <FormationDetailPage
        formation={formation}
        detail={detail}
        school={school}
        otherFormations={otherFormations}
        similar={similar}
        faq={faq}
      />
    </main>
  )
}
