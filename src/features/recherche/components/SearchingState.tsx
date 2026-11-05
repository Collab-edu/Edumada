'use client'
import { EduLoaderDots, EduLoaderMark } from '@/components/ui/edu-loader'
import { cn } from '@/lib/utils'

/** État « recherche en cours » : logo animé, texte et cartes en attente. */
export default function SearchingState({ label, count, gridClassName, cardClassName }: { label: string; count: number; gridClassName: string; cardClassName: string }) {
    return (
        <div className='flex flex-col gap-4' role='status' aria-live='polite'>
            <p className='flex items-center gap-3 font-medium text-secondary'>
                <EduLoaderMark size={40} cap={false} />
                <span className='flex'>
                    {label.replace(/…$/, '')}
                    <EduLoaderDots />
                </span>
            </p>
            <div className={cn('grid', gridClassName)}>
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className={cn('rounded-xl border border-gray-100 bg-white animate-pulse', cardClassName)} />
                ))}
            </div>
        </div>
    )
}
