import { Metadata } from 'next'
import PricingPage from '@/features/marketing/components/PricingPage'

export const metadata: Metadata = {
  title: { absolute: 'Tarifs : référencer son établissement à Madagascar | Edumada' },
  description:
    'Référencez votre établissement gratuitement sur Edumada. Formule Pro pour gérer vos demandes, Premium pour promouvoir vos formations. Accès toujours gratuit pour les étudiants.',
  alternates: { canonical: '/tarifs/' },
}

export default function TarifsPage() {
  return (
    <main>
      <PricingPage />
    </main>
  )
}
