'use client'
import { Icon } from '@/components/ui/icon'
import { useSiteData } from '@/data/site-data'
import { cn } from '@/lib/utils'

/**
 * Étiquette du type d'établissement sur la photo d'une carte : « Université », « Crèche »,
 * « Centre de formation professionnelle »… (sous-catégorie de l'établissement, sinon sa
 * catégorie), avec l'icône de la catégorie. Placée en bas à droite de la photo.
 */
export function CategoryTag({ categoryId, subCategory, schoolId, className }: { categoryId: string; subCategory?: string; schoolId?: string; className?: string }) {
    const { data: categories } = useSiteData('CategoryData')
    const { data: schools } = useSiteData('SchoolData')
    const category = categories.find((c) => c.id === categoryId)
    const label = subCategory || (schoolId ? schools.find((s) => s.id === schoolId)?.subCategory : '') || category?.shortLabel
    if (!label) return null

    return (
        <span
            className={cn(
                'absolute right-3 bottom-3 inline-flex max-w-[65%] items-center gap-1.5 rounded-md bg-secondary/90 px-2.5 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-sm',
                className
            )}>
            <Icon icon={category?.icon ?? 'tabler:school'} className='shrink-0 text-sm' />
            <span className='truncate'>{label}</span>
        </span>
    )
}

export default CategoryTag
