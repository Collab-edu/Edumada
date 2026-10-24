import { Metadata } from 'next'
import BenefitsPage from '@/features/marketing/components/BenefitsPage'

export const metadata: Metadata = {
  title: 'Avantages pour les établissements',
  description: 'Fiche complète, offres en ligne, demandes des étudiants, statistiques : ce qu’Edumada apporte aux établissements référencés.',
}

export default function BenefitsRoute() {
  return (
    <main>
      <BenefitsPage />
    </main>
  )
}
