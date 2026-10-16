'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { CardSkeletonGrid } from '@/components/ui/card'
import { ARTICLE_CATEGORIES, useArticles } from '../articles'
import ArticleCard from './ArticleCard'

/** Page Actualités : articles publiés par Edumada, filtrables par rubrique. */
export default function ArticlesPage() {
    const [category, setCategory] = useState('')
    const { articles, loading, error } = useArticles(category)

    return (
        <section className='pt-28 pb-20 sm:pt-32'>
            <div className='container mx-auto max-w-7xl px-4'>
                <div className='mb-8 flex max-w-3xl flex-col gap-4'>
                    <p className='font-semibold uppercase tracking-wide text-primary'>Actualités</p>
                    <h1 className='text-3xl md:text-5xl font-bold text-secondary'>Les actualités de l&apos;éducation à Madagascar</h1>
                    <p className='text-ink/70'>Rentrées, concours, conseils d&apos;orientation et événements : suivez ce qui compte pour vos études.</p>
                </div>

                <div className='mb-8 flex flex-wrap gap-2' role='group' aria-label='Filtrer par rubrique'>
                    {[{ value: '', label: 'Toutes' }, ...ARTICLE_CATEGORIES].map((c) => (
                        <button
                            key={c.value || 'all'}
                            type='button'
                            onClick={() => setCategory(c.value)}
                            aria-pressed={category === c.value}
                            className={cn(
                                'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors duration-300 hover:cursor-pointer',
                                category === c.value ? 'border-secondary bg-secondary text-white' : 'border-gray-200 bg-white text-secondary hover:border-secondary/40'
                            )}>
                            {c.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <CardSkeletonGrid count={4} className='h-[380px]' />
                ) : error ? (
                    <p className='rounded-xl bg-white p-8 text-center text-ink/70'>{error}</p>
                ) : articles.length === 0 ? (
                    <p className='rounded-xl bg-white p-8 text-center text-ink/70'>
                        {category ? 'Aucun article dans cette rubrique pour le moment.' : 'Aucune actualité publiée pour le moment. Revenez bientôt !'}
                    </p>
                ) : (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {articles.map((article) => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}
