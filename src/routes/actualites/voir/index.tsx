import { Suspense } from 'react'
import { Metadata } from 'next'
import { PageSkeleton } from '@/components/ui/page-state'
import QueryArticlePage from '@/app/(site)/actualites/voir/QueryArticlePage'

export const metadata: Metadata = {
  title: 'Actualité',
}

/** Page d'un article : /actualites/voir/?id=… */
export default function VoirArticlePage() {
  return (
    <main>
      <Suspense fallback={<PageSkeleton />}>
        <QueryArticlePage />
      </Suspense>
    </main>
  )
}
