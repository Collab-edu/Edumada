import { Metadata } from 'next'
import DomainsPage from '@/features/domaines/components/DomainsPage'

export const metadata: Metadata = {
  title: 'Domaines',
  description: "Explorez les formations à Madagascar par domaine d'études, après le bac ou en formation professionnelle : informatique, gestion, santé, tourisme et plus encore.",
}

export default function DomainesPage() {
  return (
    <main className='pt-28 pb-20 sm:pt-32'>
      <div className='container mx-auto max-w-7xl px-4'>
        <div className='flex max-w-3xl flex-col gap-3'>
          <h1 className='text-3xl md:text-4xl font-bold text-secondary'>Les domaines d’études</h1>
          <p className='text-black'>
            Choisissez votre voie : des études supérieures après le bac, ou une formation professionnelle pour apprendre un métier.
            Dans chaque cas, cliquez sur un domaine pour voir les formations proposées à Madagascar.
          </p>
        </div>
      </div>
      <DomainsPage />
    </main>
  )
}
