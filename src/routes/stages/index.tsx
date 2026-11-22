import { Metadata } from 'next'
import InternshipsPage from '@/features/stages/components/InternshipsPage'

export const metadata: Metadata = {
  title: 'Offres de stage à Madagascar',
  description: 'Offres de stage à Antananarivo et partout à Madagascar, par domaine : ville, durée et candidature en ligne avec CV et lettre de motivation.',
}

export default function StagesPage() {
  return (
    <main>
      <InternshipsPage />
    </main>
  )
}
