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
  return (
    <main>
      <SchoolProfile school={school} formations={formations} />
    </main>
  )
}
