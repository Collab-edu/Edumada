'use client'
import { useSearchParams } from 'next/navigation'
import LiveFormationPage from '@/features/formations/components/detail/LiveFormationPage'

export default function QueryFormationPage() {
  const id = useSearchParams().get('id') ?? ''
  return <LiveFormationPage key={id} id={id} initial={null} />
}
