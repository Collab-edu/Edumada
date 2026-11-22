import { Metadata } from 'next'
import CategoryOffersPage from '@/features/formations/components/CategoryOffersPage'

export const metadata: Metadata = {
  title: 'Écoles, collèges et lycées à Madagascar',
  description:
    'Écoles primaires, collèges et lycées publics ou privés à Antananarivo et partout à Madagascar : niveaux, frais de scolarité et inscription.',
}

export default function EcolesPage() {
  return (
    <main>
      <CategoryOffersPage variant='ecoles' />
    </main>
  )
}
