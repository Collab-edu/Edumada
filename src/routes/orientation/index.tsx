import { Metadata } from 'next'
import OrientationPage from '@/features/orientation/components/OrientationPage'

export const metadata: Metadata = {
  title: 'Orientation après le bac à Madagascar',
  description: 'Quelle filière choisir après le bac à Madagascar ? Les étapes pour s’orienter, un test d’orientation gratuit et les formations par profil.',
}

export default function OrientationRoute() {
  return (
    <main>
      <OrientationPage />
    </main>
  )
}
