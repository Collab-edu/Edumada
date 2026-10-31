'use client'
import { useEffect, useState } from 'react'
import Link from '@/i18n/client'
import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import CompanyLogo from './CompanyLogo'
import { internshipHref, publishedAgo, type Internship } from '../types'

const STORAGE_KEY = 'edumada.stages.saved'

function readSaved(): string[] {
    try {
        return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')
    } catch {
        return []
    }
}

/** Stage mis de côté, dans ce navigateur uniquement. */
function useSaved(id: string) {
    const [saved, setSaved] = useState(false)
    useEffect(() => setSaved(readSaved().includes(id)), [id])
    const toggle = () => {
        const list = readSaved().filter((item) => item !== id)
        const next = saved ? list : [...list, id]
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        } catch {
            // sans importance
        }
        setSaved(!saved)
    }
    return { saved, toggle }
}

/** Carte d'une offre de stage : toute la carte mène à la fiche. */
export default function InternshipCard({ internship: i }: { internship: Internship }) {
    const { saved, toggle } = useSaved(i.id)
    return (
        <article className='relative flex h-full flex-col rounded-2xl bg-white shadow-[0_10px_30px_-12px_rgba(15,76,92,0.28)] ring-1 ring-secondary/10 transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_-14px_rgba(15,76,92,0.38)] motion-reduce:transform-none'>
            <div className='flex flex-1 flex-col gap-4 p-5'>
                <div className='flex items-center gap-3'>
                    <CompanyLogo name={i.companyName} logo={i.companyLogo} className='h-14 w-14 ring-gray-200' />
                    <div className='min-w-0'>
                        <p className='break-words font-semibold text-secondary'>{i.companyName}</p>
                        <p className='text-sm text-ink/60'>{publishedAgo(i.createdAt)}</p>
                    </div>
                </div>
                <h3 className='text-lg font-semibold leading-snug text-secondary'>
                    <Link href={internshipHref(i.id)} className='after:absolute after:inset-0 after:rounded-2xl after:content-[""]'>
                        {i.title}
                    </Link>
                </h3>
                <div className='mt-auto flex flex-col gap-3'>
                    {i.domain && (
                        <p className='flex items-center gap-1.5 text-sm text-ink'>
                            <Icon icon='tabler:tools' className='shrink-0 text-base text-primary' />
                            {i.domain}
                        </p>
                    )}
                    <div className='flex flex-wrap gap-2'>
                        <span className='inline-flex items-center gap-1 rounded-full bg-secondary/[0.08] px-3 py-1 text-sm font-medium text-secondary'>
                            <Icon icon='tabler:map-pin' className='text-base' />
                            {i.city}
                        </span>
                        <span className='rounded-full bg-cream px-3 py-1 text-sm font-medium text-secondary'>{i.modality}</span>
                    </div>
                </div>
            </div>
            <div className='flex items-center gap-3 border-t border-gray-100 p-4'>
                <Link href={internshipHref(i.id)} aria-label={`Voir les détails : ${i.title}`} className='relative z-10 inline-flex min-h-11 flex-1 items-center justify-center rounded-lg bg-primary px-4 font-semibold text-white transition-colors hover:bg-primary/90'>
                    Voir détails
                </Link>
                <button
                    type='button'
                    aria-pressed={saved}
                    aria-label={saved ? `Retirer « ${i.title} » des stages enregistrés` : `Enregistrer « ${i.title} »`}
                    onClick={toggle}
                    className='relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-secondary ring-1 ring-secondary/15 transition-colors hover:cursor-pointer hover:bg-offwhite'>
                    <svg viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2' strokeLinejoin='round' aria-hidden='true' className={cn('h-6 w-6', saved ? 'fill-current' : 'fill-none')}>
                        <path d='M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1Z' />
                    </svg>
                </button>
            </div>
        </article>
    )
}
