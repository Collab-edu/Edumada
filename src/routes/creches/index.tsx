import { Metadata } from 'next'
import CategoryOffersPage from '@/features/formations/components/CategoryOffersPage'

export const metadata: Metadata = {
  title: 'Crèches et garderies à Madagascar',
  description:
    'Crèches, garderies et maternelles à Antananarivo et partout à Madagascar : âge d’accueil, horaires, tarifs et contact de chaque établissement.',
}

export default function CrechesPage() {
  return (
    <main>
      <CategoryOffersPage variant='creches' />
    </main>
  )
}
