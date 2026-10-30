import { Suspense } from 'react'
import { Metadata } from 'next'
import { PageSkeleton } from '@/components/ui/page-state'
import QueryFormationPage from '@/app/(site)/formations/voir/QueryFormationPage'

export const metadata: Metadata = {
  title: 'Offre',
}

/** Fiche d'une offre publiée après le dernier build (?ecole=…&offre=…) ou ancien lien (?id=…). */
export default function VoirFormationPage() {
  return (
    <main>
      <Suspense fallback={<PageSkeleton />}>
        <QueryFormationPage />
      </Suspense>
    </main>
  )
}
