'use client'
import { useSearchParams } from 'next/navigation'
import LiveSchoolPage from '@/features/etablissements/components/LiveSchoolPage'

export default function QuerySchoolPage() {
  const id = useSearchParams().get('id') ?? ''
  return <LiveSchoolPage key={id} id={id} initial={null} />
}
