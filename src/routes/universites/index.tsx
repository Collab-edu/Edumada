import { Metadata } from 'next'
import CategoryOffersPage from '@/features/formations/components/CategoryOffersPage'

export const metadata: Metadata = {
  title: 'Universités et écoles supérieures à Madagascar',
  description:
    'Universités publiques et privées, instituts et grandes écoles à Madagascar : licences, masters et BTS, frais de scolarité, conditions d’admission et inscription.',
}

export default function UniversitesPage() {
  return (
    <main>
      <CategoryOffersPage variant='universites' />
    </main>
  )
}
