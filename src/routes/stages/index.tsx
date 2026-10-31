import { Metadata } from 'next'
import CategoryOffersPage from '@/features/formations/components/CategoryOffersPage'

export const metadata: Metadata = {
  title: 'Offres de stage',
  description: 'Offres de stage à Madagascar : comparez les domaines et les villes, puis contactez directement l’établissement qui propose le stage.',
}

export default function StagesPage() {
  return (
    <main>
      <CategoryOffersPage variant='stages' />
    </main>
  )
}
