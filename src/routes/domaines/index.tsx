import { Metadata } from 'next'
import DomainsPage from '@/features/domaines/components/DomainsPage'

export const metadata: Metadata = {
  title: 'Domaines',
  description: "Explorez les formations à Madagascar par domaine d'études, après le bac ou en formation professionnelle : informatique, gestion, santé, tourisme et plus encore.",
}

export default function DomainesRoute() {
  return <DomainsPage />
}
