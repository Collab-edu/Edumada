import { Metadata } from 'next'
import CategoryOffersPage from '@/features/formations/components/CategoryOffersPage'

export const metadata: Metadata = {
  title: { absolute: 'Centre de formation professionnelle à Madagascar | Edumada' },
  description:
    'Formations professionnelles à Madagascar : centres de formation, instituts techniques et écoles de métiers. Comparez les formations courtes et certifiantes.',
  alternates: { canonical: '/formation-professionnelle/' },
}

export default function FormationProfessionnellePage() {
  return (
    <main>
      <CategoryOffersPage variant='formation-pro' />
    </main>
  )
}
