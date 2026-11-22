import { Metadata } from 'next'
import OrientationTest from '@/features/orientation/test/OrientationTest'

export const metadata: Metadata = {
  title: 'Test d’orientation',
  description: '12 questions pour découvrir votre profil, les domaines d’études qui vous correspondent et les formations disponibles à Madagascar.',
  alternates: { canonical: '/orientation/test/' },
}

export default function OrientationTestRoute() {
  return (
    <main>
      <OrientationTest />
    </main>
  )
}
