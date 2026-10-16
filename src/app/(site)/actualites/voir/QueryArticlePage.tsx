'use client'
import { useSearchParams } from 'next/navigation'
import ArticlePage from '@/features/actualites/components/ArticlePage'

export default function QueryArticlePage() {
  const id = useSearchParams().get('id') ?? ''
  return <ArticlePage key={id} id={id} />
}
