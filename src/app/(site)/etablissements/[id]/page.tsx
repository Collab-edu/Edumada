import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { readSiteData } from '@/data/server'
import SchoolProfile from '@/features/etablissements/components/SchoolProfile'

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

  // Suggestions : formations des autres établissements, d'abord dans les mêmes domaines, puis dans la même ville.
  const score = (f: (typeof formations)[number]) =>
    (school.tags.includes(f.domain) ? 2 : 0) + (f.city === school.city ? 1 : 0)
  const suggestions = data.FormationData
    .filter((f) => f.schoolId !== school.id)
    .sort((a, b) => score(b) - score(a))
    .slice(0, 8)

  return (
    <main>
      <SchoolProfile school={school} formations={formations} suggestions={suggestions} />
    </main>
  )
}
