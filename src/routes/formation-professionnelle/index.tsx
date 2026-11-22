import { Metadata } from 'next'
import CategoryOffersPage from '@/features/formations/components/CategoryOffersPage'

export const metadata: Metadata = {
  title: 'Centres de formation professionnelle à Madagascar',
  description:
    'Formations courtes et certifiantes à Madagascar : centres de formation professionnelle, instituts techniques et écoles de métiers, avec durée, coût et certificat délivré.',
}

export default function FormationProfessionnellePage() {
  return (
    <main>
      <CategoryOffersPage variant='formation-pro' />
    </main>
  )
}
