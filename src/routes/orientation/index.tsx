import { Metadata } from 'next'
import OrientationPage from '@/features/orientation/components/OrientationPage'

export const metadata: Metadata = {
  title: { absolute: 'Orientation scolaire à Madagascar : choisir sa formation | Edumada' },
  description: 'Vous cherchez votre orientation après le bac ? Découvrez les filières, les formations et les établissements à Madagascar pour construire votre projet d’études.',
  alternates: { canonical: '/orientation/' },
}

export default function OrientationRoute() {
  return (
    <main>
      <OrientationPage />
    </main>
  )
}
