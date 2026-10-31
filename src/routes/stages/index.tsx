import { Metadata } from 'next'
import InternshipsPage from '@/features/stages/components/InternshipsPage'

export const metadata: Metadata = {
  title: 'Offres de stage',
  description: 'Offres de stage à Madagascar : comparez les domaines et les villes, puis envoyez votre candidature depuis votre compte.',
}

export default function StagesPage() {
  return (
    <main>
      <InternshipsPage />
    </main>
  )
}
