import { Metadata } from 'next'
import InternshipsPage from '@/features/stages/components/InternshipsPage'

export const metadata: Metadata = {
  title: 'Offres de stage',
  description: 'Offres de stage à Madagascar : comparez les domaines, puis envoyez votre candidature depuis votre compte.',
  alternates: { canonical: '/stages/' },
}

export default function StagesPage() {
  return (
    <main>
      <InternshipsPage />
    </main>
  )
}
