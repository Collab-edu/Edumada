import { Metadata } from 'next'
import InternshipsPage from '@/features/stages/components/InternshipsPage'

export const metadata: Metadata = {
  title: 'Offres de stage',
  description: 'Offres de stage à Madagascar : comparez les domaines et les villes, puis postulez directement auprès de la société.',
}

export default function StagesPage() {
  return (
    <main>
      <InternshipsPage />
    </main>
  )
}
