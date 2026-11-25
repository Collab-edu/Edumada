import { Metadata } from 'next'
import DomainsPage from '@/features/domaines/components/DomainsPage'

export const metadata: Metadata = {
  title: { absolute: 'Domaines d’études à Madagascar : quelle filière choisir ? | Edumada' },
  description: "Explorez les formations à Madagascar par domaine d'études, après le bac ou en formation professionnelle : informatique, gestion, santé, tourisme et plus encore.",
  alternates: { canonical: '/domaines/' },
}

export default function DomainesRoute() {
  return <DomainsPage />
}
