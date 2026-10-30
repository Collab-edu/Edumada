'use client'
import { useSearchParams } from 'next/navigation'
import LiveFormationPage from '@/features/formations/components/detail/LiveFormationPage'

export default function QueryFormationPage() {
  const params = useSearchParams()
  const id = params.get('offre') ?? params.get('id') ?? ''
  return <LiveFormationPage key={id} id={id} school={params.get('ecole') ?? undefined} initial={null} />
}
