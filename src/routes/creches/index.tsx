import { Metadata } from 'next'
import CategoryOffersPage from '@/features/formations/components/CategoryOffersPage'

export const metadata: Metadata = {
  title: { absolute: 'Crèche, garderie et maternelle à Antananarivo | Edumada' },
  description:
    'Crèches, garderies, préscolaires et maternelles à Madagascar : comparez les établissements près de chez vous et contactez-les directement.',
  alternates: { canonical: '/creches/' },
}

export default function CrechesPage() {
  return (
    <main>
      <CategoryOffersPage variant='creches' />
    </main>
  )
}
