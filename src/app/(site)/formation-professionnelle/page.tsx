import { Metadata } from 'next'
import CategoryOffersPage from '@/features/formations/components/CategoryOffersPage'

export const metadata: Metadata = {
  title: 'Formation professionnelle',
  description:
    'Formations professionnelles à Madagascar : centres de formation, instituts techniques et écoles de métiers. Comparez les formations courtes et certifiantes.',
}

export default function FormationProfessionnellePage() {
  return (
    <main>
      <CategoryOffersPage variant='formation-pro' />
    </main>
  )
}
