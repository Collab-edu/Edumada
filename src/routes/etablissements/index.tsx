import { Metadata } from 'next'
import SchoolsPage from '@/features/etablissements/components/SchoolsPage'

export const metadata: Metadata = {
  title: 'Annuaire des écoles et universités à Madagascar',
  description: 'Annuaire des universités, écoles, crèches et centres de formation à Madagascar : formations, frais et contact de chaque établissement, par ville.',
}

export default function EtablissementsPage() {
  return (
    <main>
      <SchoolsPage />
    </main>
  )
}
