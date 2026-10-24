import { Metadata } from 'next'
import ArticlesPage from '@/features/actualites/components/ArticlesPage'

export const metadata: Metadata = {
  title: 'Actualités',
  description: 'Rentrées, concours, conseils d’orientation et événements : les actualités de l’éducation à Madagascar.',
}

export default function ActualitesPage() {
  return (
    <main>
      <ArticlesPage />
    </main>
  )
}
