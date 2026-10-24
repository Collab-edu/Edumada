import { Metadata } from 'next'
import SpaceRedirect from '@/features/espace/SpaceRedirect'

export const metadata: Metadata = {
  title: 'Mon espace',
  robots: { index: false },
}

export default function EspacePage() {
  return (
    <main>
      <SpaceRedirect />
    </main>
  )
}
