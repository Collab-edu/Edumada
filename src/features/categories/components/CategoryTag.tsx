'use client'
import { Icon } from '@/components/ui/icon'
import { useSiteData } from '@/data/site-data'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/client'

/**
 * Étiquette du type d'établissement sur la photo d'une carte : « Université », « Crèche »,
 * « Centre de formation professionnelle »… (sous-catégorie de l'établissement, sinon sa
 * catégorie), avec l'icône de la catégorie. Placée en haut à gauche de la photo.
 */
export function CategoryTag({ categoryId, subCategory, schoolId, className }: { categoryId: string; subCategory?: string; schoolId?: string; className?: string }) {
    const t = useT()
    const { data: categories } = useSiteData('CategoryData')
    const { data: schools } = useSiteData('SchoolData')
    const category = categories.find((c) => c.id === categoryId)
    const label = subCategory || (schoolId ? schools.find((s) => s.id === schoolId)?.subCategory : '') || category?.shortLabel
    if (!label) return null

    return (
        <span
            className={cn(
                'absolute top-3 left-3 inline-flex max-w-[70%] items-center gap-1.5 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-white',
                className
            )}>
            <Icon icon={category?.icon ?? 'tabler:school'} className='shrink-0 text-sm' />
            <span className='truncate'>{t(label)}</span>
        </span>
    )
}

export default CategoryTag
