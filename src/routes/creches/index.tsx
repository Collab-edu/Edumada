import { Metadata } from 'next'
import CategoryOffersPage from '@/features/formations/components/CategoryOffersPage'

export const metadata: Metadata = {
  title: 'Crèches et petite enfance',
  description:
    'Crèches, garderies, préscolaires et maternelles à Madagascar : comparez les établissements près de chez vous et contactez-les directement.',
}

export default function CrechesPage() {
  return (
    <main>
      <CategoryOffersPage variant='creches' />
    </main>
  )
}
