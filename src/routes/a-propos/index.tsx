import { Metadata } from 'next'
import AboutPage from '@/features/marketing/components/AboutPage'

export const metadata: Metadata = {
  title: 'À propos',
  description: 'Edumada aide les étudiants et les familles à trouver une formation ou un établissement à Madagascar.',
}

export default function AboutRoute() {
  return (
    <main>
      <AboutPage />
    </main>
  )
}
