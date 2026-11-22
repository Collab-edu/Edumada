import { Metadata } from 'next'
import OrientationPage from '@/features/orientation/components/OrientationPage'

export const metadata: Metadata = {
  title: 'Orientation',
  description: 'Choisir sa formation ou un établissement à Madagascar : les étapes pour s’orienter, selon votre profil.',
}

export default function OrientationRoute() {
  return (
    <main>
      <OrientationPage />
    </main>
  )
}
