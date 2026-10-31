import { Suspense } from 'react'
import { Metadata } from 'next'
import { PageSkeleton } from '@/components/ui/page-state'
import InternshipPage from '@/features/stages/components/InternshipPage'

export const metadata: Metadata = {
  title: 'Offre de stage',
}

/** Fiche d'une offre de stage : /stages/voir/?id=… */
export default function VoirStagePage() {
  return (
    <main>
      <Suspense fallback={<PageSkeleton />}>
        <InternshipPage />
      </Suspense>
    </main>
  )
}
