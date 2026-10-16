import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { readSiteData } from '@/data/server'
import LiveSchoolPage from '@/features/etablissements/components/LiveSchoolPage'
import { buildSchoolPageProps } from '@/features/etablissements/page-props'

type Props = { params: Promise<{ id: string }> }

// Export statique : une page est générée par établissement au moment du build.
// Une fiche publiée ensuite s'affiche via /etablissements/voir/?id=… (voir la page 404).
export const dynamicParams = false

export async function generateStaticParams() {
  return (await readSiteData()).SchoolData.map((school) => ({ id: school.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const school = (await readSiteData()).SchoolData.find((s) => s.id === id)
  if (!school) return {}
  return {
    title: school.name,
    description: `${school.description} ${school.city}, Madagascar.`,
  }
}

export default async function SchoolPage({ params }: Props) {
  const { id } = await params
  const data = await readSiteData()
  const school = data.SchoolData.find((s) => s.id === id)
  if (!school) notFound()

  const props = buildSchoolPageProps(school, data)

  // Données structurées FAQPage : Google peut afficher les questions dans ses résultats.
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: props.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  return (
    <main>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }} />
      <LiveSchoolPage id={id} initial={props} />
    </main>
  )
}
