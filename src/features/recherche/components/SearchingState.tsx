'use client'
import { cn } from '@/lib/utils'

/** État « recherche en cours » : même loader que sur la page /recherche. */
export default function SearchingState({ label, count, gridClassName, cardClassName }: { label: string; count: number; gridClassName: string; cardClassName: string }) {
    return (
        <div className='flex flex-col gap-4' role='status' aria-live='polite'>
            <p className='flex items-center gap-2 font-medium text-secondary'>
                <span className='h-5 w-5 animate-spin rounded-full border-2 border-primary/20 border-t-primary' aria-hidden='true' />
                {label}
            </p>
            <div className={cn('grid', gridClassName)}>
                {Array.from({ length: count }).map((_, i) => (
                    <div key={i} className={cn('rounded-2xl border border-gray-100 bg-white animate-pulse', cardClassName)} />
                ))}
            </div>
        </div>
    )
}
