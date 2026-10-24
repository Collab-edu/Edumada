'use client'
import Image from 'next/image'
import Link, { useT } from '@/i18n/client'
import { Icon } from '@/components/ui/icon'
import { PageSkeleton, PageUnavailable } from '@/components/ui/page-state'
import { formatArticleDate, useArticle } from '../articles'

/** Contenu saisi dans le back-office : paragraphes séparés par une ligne vide, « ## » pour un intertitre. */
function ArticleBody({ content }: { content: string }) {
    const blocks = content
        .replace(/\r\n/g, '\n')
        .split(/\n{2,}/)
        .map((b) => b.trim())
        .filter(Boolean)
    return (
        <div className='flex flex-col gap-5 text-lg leading-relaxed text-ink/80'>
            {blocks.map((block, i) =>
                block.startsWith('## ') ? (
                    <h2 key={i} className='mt-4 text-2xl font-bold text-secondary'>
                        {block.slice(3)}
                    </h2>
                ) : (
                    <p key={i} className='whitespace-pre-line'>
                        {block}
                    </p>
                )
            )}
        </div>
    )
}

/** Page d'un article : /actualites/voir/?id=… */
export default function ArticlePage({ id }: { id: string }) {
    const t = useT()
    const { article, loading, error } = useArticle(id)

    if (loading) return <PageSkeleton />
    if (!article) {
        return error && error.status !== 404 ? (
            <PageUnavailable title='Article indisponible' message={error.message} />
        ) : (
            <PageUnavailable title='Article introuvable' message="Cet article n'existe pas ou n'est plus en ligne." />
        )
    }

    return (
        <article className='pt-28 pb-20 sm:pt-32'>
            <div className='container mx-auto max-w-3xl px-4'>
                <Link href='/actualites/' className='mb-6 inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:text-primary'>
                    <Icon icon='tabler:arrow-left' className='text-base' />
                    {t('Toutes les actualités')}
                </Link>
                <div className='flex flex-wrap items-center gap-3 text-sm'>
                    <span className='rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-white'>{t(article.categoryLabel)}</span>
                    <span className='flex items-center gap-1.5 text-ink/60'>
                        <Icon icon='tabler:calendar' className='text-base text-secondary' />
                        {formatArticleDate(article.publishedAt)}
                    </span>
                </div>
                <h1 className='mt-4 text-3xl md:text-5xl font-bold text-secondary'>{article.title}</h1>
                <p className='mt-4 text-xl text-black'>{article.excerpt}</p>
            </div>

            {article.coverImage && (
                <div className='container mx-auto mt-8 max-w-5xl px-4'>
                    <div className='relative h-64 overflow-hidden rounded-2xl sm:h-96'>
                        <Image src={article.coverImage} alt='' fill priority sizes='(min-width: 1024px) 1024px, 100vw' className='object-cover' />
                    </div>
                </div>
            )}

            <div className='container mx-auto mt-10 max-w-3xl px-4'>
                <ArticleBody content={article.content ?? ''} />
            </div>
        </article>
    )
}
