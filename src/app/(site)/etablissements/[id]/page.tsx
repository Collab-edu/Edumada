import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { readSiteData } from '@/data/server'
import SchoolProfile from '@/features/etablissements/components/SchoolProfile'
import { buildSchoolFaq } from '@/features/etablissements/faq'
import { DEFAULT_FIELDS } from '@/features/categories/types'

type Props = { params: Promise<{ id: string }> }

// Export statique : une page est générée par établissement au moment du build.
export const dynamicParams = false

export function generateStaticParams() {
  return readSiteData().SchoolData.map((school) => ({ id: school.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const school = readSiteData().SchoolData.find((s) => s.id === id)
  if (!school) return {}
  return {
    title: school.name,
    description: `${school.description} ${school.city}, Madagascar.`,
  }
}

export default async function SchoolPage({ params }: Props) {
  const { id } = await params
  const data = readSiteData()
  const school = data.SchoolData.find((s) => s.id === id)
  if (!school) notFound()

  const formations = data.FormationData.filter((f) => f.schoolId === school.id)
  const category = data.CategoryData.find((c) => c.id === school.category) ?? {
    ...data.CategoryData[0],
    fields: DEFAULT_FIELDS,
  }
  const faq = buildSchoolFaq(school, formations, category.fields)

  // Données structurées FAQPage : Google peut afficher les questions dans ses résultats.
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  return (
    <main>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '\\u003c') }} />
      <SchoolProfile
        school={school}
        category={category}
        formations={formations}
        testimonials={data.TestimonialData.filter((t) => t.schoolId === school.id)}
        faq={faq}
      />
    </main>
  )
}
