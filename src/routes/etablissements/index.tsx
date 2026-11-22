import { Metadata } from 'next'
import SchoolsPage from '@/features/etablissements/components/SchoolsPage'

export const metadata: Metadata = {
  title: 'Établissements',
  description: 'Universités, écoles, crèches et centres de formation à Madagascar : filtrez par catégorie et par ville.',
}

export default function EtablissementsPage() {
  return (
    <main>
      <SchoolsPage />
    </main>
  )
}
