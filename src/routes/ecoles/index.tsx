import { Metadata } from 'next'
import CategoryOffersPage from '@/features/formations/components/CategoryOffersPage'

export const metadata: Metadata = {
  title: 'Écoles, collèges et lycées',
  description:
    'Écoles primaires, collèges et lycées à Madagascar : comparez les établissements près de chez vous et contactez-les directement.',
}

export default function EcolesPage() {
  return (
    <main>
      <CategoryOffersPage variant='ecoles' />
    </main>
  )
}
