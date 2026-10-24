import { Metadata } from 'next'
import PricingPage from '@/features/marketing/components/PricingPage'

export const metadata: Metadata = {
  title: 'Établissements : nos formules',
  description:
    'Référencez votre établissement gratuitement sur Edumada. Formule Pro pour gérer vos demandes, Premium pour promouvoir vos formations. Accès toujours gratuit pour les étudiants.',
}

export default function TarifsPage() {
  return (
    <main>
      <PricingPage />
    </main>
  )
}
