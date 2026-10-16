import { Suspense } from 'react'
import { Metadata } from 'next'
import { PageSkeleton } from '@/components/ui/page-state'
import Page from '@/features/espace/etablissement/InboxPage'

export const metadata: Metadata = {
  title: 'Demandes',
  robots: { index: false },
}

// Espace connecté : rendu dans le navigateur, avec les paramètres d'URL (?e=…).
export default function Route() {
  return (
    <main>
      <Suspense fallback={<PageSkeleton />}>
        <Page />
      </Suspense>
    </main>
  )
}
