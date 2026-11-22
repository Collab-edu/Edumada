import { Metadata } from 'next'
import CategoryOffersPage from '@/features/formations/components/CategoryOffersPage'

export const metadata: Metadata = {
  title: 'Petite enfance et écoles',
  description:
    'Crèches, garderies, maternelles, écoles primaires, collèges et lycées à Madagascar : comparez les établissements près de chez vous et contactez-les directement.',
}

export default function PetiteEnfancePage() {
  return (
    <main>
      <CategoryOffersPage variant='petite-enfance' />
    </main>
  )
}
