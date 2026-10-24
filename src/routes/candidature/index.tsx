import { Suspense } from 'react'
import { Metadata } from 'next'
import { PageSkeleton } from '@/components/ui/page-state'
import ApplicationPage from '@/features/candidature/ApplicationPage'

export const metadata: Metadata = {
  title: 'Candidature en ligne',
  robots: { index: false },
}

export default function CandidaturePage() {
  return (
    <main>
      <Suspense fallback={<PageSkeleton />}>
        <ApplicationPage />
      </Suspense>
    </main>
  )
}
