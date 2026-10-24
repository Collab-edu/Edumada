import { Suspense } from 'react'
import { Metadata } from 'next'
import { PageSkeleton } from '@/components/ui/page-state'
import QuerySchoolPage from '@/app/(site)/etablissements/voir/QuerySchoolPage'

export const metadata: Metadata = {
  title: 'Établissement',
}

/** Fiche d'un établissement publié après le dernier build : /etablissements/voir/?id=… */
export default function VoirEtablissementPage() {
  return (
    <main>
      <Suspense fallback={<PageSkeleton />}>
        <QuerySchoolPage />
      </Suspense>
    </main>
  )
}
