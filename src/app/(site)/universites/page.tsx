import { Metadata } from 'next'
import CategoryOffersPage from '@/features/formations/components/CategoryOffersPage'

export const metadata: Metadata = {
  title: 'Universités',
  description:
    'Formations des universités, instituts supérieurs, écoles supérieures et grandes écoles à Madagascar : filtrez par type d’établissement, par filière et par ville.',
}

export default function UniversitesPage() {
  return (
    <main>
      <CategoryOffersPage variant='universites' />
    </main>
  )
}
