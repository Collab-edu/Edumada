import { Metadata } from 'next'
import SchoolsPage from '@/features/etablissements/components/SchoolsPage'

export const metadata: Metadata = {
  title: 'Universités',
  description: 'Universités, instituts supérieurs, écoles supérieures et grandes écoles à Madagascar : filtrez par filière et par ville.',
}

export default function UniversitesPage() {
  return (
    <main>
      <SchoolsPage variant='universites' />
    </main>
  )
}
