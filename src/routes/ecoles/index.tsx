import { Metadata } from 'next'
import CategoryOffersPage from '@/features/formations/components/CategoryOffersPage'

export const metadata: Metadata = {
  title: { absolute: 'École privée, collège et lycée à Antananarivo | Edumada' },
  description:
    'Écoles primaires, collèges et lycées à Madagascar : comparez les établissements près de chez vous et contactez-les directement.',
  alternates: { canonical: '/ecoles/' },
}

export default function EcolesPage() {
  return (
    <main>
      <CategoryOffersPage variant='ecoles' />
    </main>
  )
}
