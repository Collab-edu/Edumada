import { Suspense } from 'react'
import { Metadata } from 'next'
import SearchPage from '@/features/recherche/components/SearchPage'

export const metadata: Metadata = {
  title: { absolute: 'Rechercher une formation à Madagascar | Edumada' },
  description:
    'Filtrez les formations à Madagascar par domaine, ville, budget, durée, modalité, diplôme et conditions d’admission.',
  alternates: { canonical: '/recherche/' },
}

export default function RecherchePage() {
  // useSearchParams() exige une frontière Suspense pour l'export statique.
  return (
    <main>
      <Suspense>
        <SearchPage />
      </Suspense>
    </main>
  )
}
