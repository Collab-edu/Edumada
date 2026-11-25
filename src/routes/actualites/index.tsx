import { Metadata } from 'next'
import ArticlesPage from '@/features/actualites/components/ArticlesPage'

export const metadata: Metadata = {
  title: { absolute: 'Éducation à Madagascar : actualités, concours, rentrée | Edumada' },
  description: 'Rentrées, concours, conseils d’orientation et événements : les actualités de l’éducation à Madagascar.',
  alternates: { canonical: '/actualites/' },
}

export default function ActualitesPage() {
  return (
    <main>
      <ArticlesPage />
    </main>
  )
}
