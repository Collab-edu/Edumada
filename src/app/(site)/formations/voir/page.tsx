import { Suspense } from 'react'
import { Metadata } from 'next'
import { PageSkeleton } from '@/components/ui/page-state'
import QueryFormationPage from './QueryFormationPage'

export const metadata: Metadata = {
  title: 'Offre',
}

/** Fiche d'une offre publiée après le dernier build : /formations/voir/?id=… */
export default function VoirFormationPage() {
  return (
    <main>
      <Suspense fallback={<PageSkeleton />}>
        <QueryFormationPage />
      </Suspense>
    </main>
  )
}
