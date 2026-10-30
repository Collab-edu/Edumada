import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { readFormationDetails, readSiteData } from '@/data/server'
import LiveFormationPage from '@/features/formations/components/detail/LiveFormationPage'
import { offerFacts } from '@/features/formations/format'
import { buildFormationPageProps } from '@/features/formations/page-props'

type Props = { params: Promise<{ id: string; offre: string }> }

// Export statique : une page est générée par offre au moment du build.
// Une offre publiée ensuite s'affiche via /formations/voir/?ecole=…&offre=… (voir la page 404).
export const dynamicParams = false

export async function generateStaticParams() {
  return (await readSiteData()).FormationData.map((formation) => ({ id: formation.schoolId, offre: formation.urlSlug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, offre } = await params
  const formation = (await readSiteData()).FormationData.find((f) => f.schoolId === id && f.urlSlug === offre)
  if (!formation) return {}
  const facts = offerFacts(formation).map((f) => f.label).join(', ')
  return {
    title: `${formation.title} — ${formation.school}`,
    description: `${formation.title} à ${formation.city}${facts ? ` (${facts})` : ''} : ${formation.school}, admission, frais, organisation et inscription.`,
  }
}

export default async function FormationPage({ params }: Props) {
  const { id, offre } = await params
  const data = await readSiteData()
  const formation = data.FormationData.find((f) => f.schoolId === id && f.urlSlug === offre)
  const detail = (await readFormationDetails()).find((d) => d.id === formation?.id)
  const props = formation && detail ? buildFormationPageProps(formation, detail, data) : null
  if (!props) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: props.formation.title,
    description: props.detail.description,
    provider: { '@type': 'EducationalOrganization', name: props.school.name, ...(props.school.website ? { sameAs: props.school.website } : {}) },
    ...(props.formation.diploma ? { educationalCredentialAwarded: props.formation.diploma } : {}),
    inLanguage: props.formation.languages,
  }

  return (
    <main>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <LiveFormationPage id={props.formation.id} initial={props} />
    </main>
  )
}
