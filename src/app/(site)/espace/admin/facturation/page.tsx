import { Suspense } from 'react'
import { Metadata } from 'next'
import { PageSkeleton } from '@/components/ui/page-state'
import { AdminBillingPage as Page } from '@/features/espace/admin/AdminPages'

export const metadata: Metadata = {
  title: 'Facturation',
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
