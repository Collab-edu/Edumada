import { Metadata } from 'next'
import DomainsSection from '@/features/domaines/components/DomainsSection'
import { T } from '@/i18n/T'

export const metadata: Metadata = {
  title: 'Domaines',
  description: "Explorez les formations à Madagascar par domaine d'études : informatique, gestion, santé, commerce et plus encore.",
}

export default function DomainesPage() {
  return (
    <main className='pt-28 pb-20 sm:pt-32'>
      <div className='container mx-auto max-w-7xl px-4 mb-2'>
        <h1 className='text-3xl md:text-4xl font-bold text-secondary'>
          <T>Les domaines d’études</T>
        </h1>
      </div>
      <DomainsSection />
    </main>
  )
}
