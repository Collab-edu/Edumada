import Image from 'next/image'
import Link from '@/i18n/client'
import { imageOr } from '@/lib/media'
import { Icon } from '@/components/ui/icon'
import { Card } from '@/components/ui/card'
import { formatArticleDate, type Article } from '../articles'

export const articleHref = (id: string) => `/actualites/voir/?id=${encodeURIComponent(id)}`

/** Carte d'actualité : photo avec la rubrique, date, titre, résumé. */
export function ArticleCard({ article }: { article: Article }) {
    return (
        <Card className='relative flex h-full flex-col overflow-hidden'>
            <div className='relative h-48 overflow-hidden bg-cream'>
                <Image src={imageOr(article.coverImage)} alt='' fill className='object-cover transition-transform duration-500 group-hover:scale-105' />
                <span className='absolute bottom-3 left-3 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-white'>{article.categoryLabel}</span>
            </div>
            <div className='flex flex-1 flex-col gap-2 p-5'>
                <p className='flex items-center gap-1.5 text-sm text-ink/60'>
                    <Icon icon='tabler:calendar' className='text-base text-secondary' />
                    {formatArticleDate(article.publishedAt)}
                </p>
                <h3 className='text-lg font-bold leading-snug text-secondary group-hover:text-primary duration-300'>
                    {/* Lien étiré : toute la carte mène à l'article. */}
                    <Link href={articleHref(article.id)} className='after:absolute after:inset-0'>
                        {article.title}
                    </Link>
                </h3>
                <p className='line-clamp-3 text-sm text-black'>{article.excerpt}</p>
                <span className='mt-auto inline-flex items-center gap-1 pt-2 text-sm font-semibold text-primary'>
                    Lire l&apos;article
                    <Icon icon='tabler:arrow-right' className='text-base transition-transform duration-300 group-hover:translate-x-1' />
                </span>
            </div>
        </Card>
    )
}

export default ArticleCard
