import { Metadata } from 'next'
import BenefitsPage from '@/features/marketing/components/BenefitsPage'

export const metadata: Metadata = {
  title: { absolute: 'Référencer son établissement à Madagascar | Edumada' },
  description: 'École, université ou centre de formation à Madagascar ? Référencez gratuitement votre établissement sur Edumada et présentez vos formations aux futurs étudiants.',
  alternates: { canonical: '/avantages/' },
}

export default function BenefitsRoute() {
  return (
    <main>
      <BenefitsPage />
    </main>
  )
}
