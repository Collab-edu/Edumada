'use client'
import { useEffect, useState } from 'react'
import Link from '@/i18n/client'
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
        <article className='relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-md'>
            <div className='flex flex-1 flex-col gap-3 bg-secondary/[0.05] p-5'>
                <div className='flex items-start justify-between gap-3'>
                    <div className='flex min-w-0 items-center gap-3'>
                        <CompanyLogo name={i.companyName} logo={i.companyLogo} className='h-14 w-14 ring-gray-200' />
                        <span className='min-w-0 break-words font-semibold text-secondary'>{i.companyName}</span>
                    </div>
                    <span className='shrink-0 rounded-full bg-secondary px-3 py-0.5 text-sm font-medium text-white'>Stage</span>
                </div>
                <h3 className='text-xl font-normal leading-snug text-black sm:text-2xl'>
                    <Link href={internshipHref(i.id)} className='after:absolute after:inset-0 after:content-[""]'>
                        {i.title}
                    </Link>
                </h3>
                <div className='mt-auto flex flex-wrap gap-1.5'>
                    <span className='rounded-full bg-success px-3 py-0.5 text-sm font-medium text-secondary'>{i.city}</span>
                    <span className='rounded-full bg-primary px-3 py-0.5 text-sm font-medium text-white'>{i.modality}</span>
                </div>
                {i.domain && <p className='text-black'>{i.domain}</p>}
                <p className='text-ink/60'>{publishedAgo(i.createdAt)}</p>
            </div>
            <div className='flex items-center justify-between gap-3 px-5 py-3'>
                <Link href={internshipHref(i.id)} aria-label={`Voir les détails : ${i.title}`} className='relative z-10 inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 font-semibold text-white transition-colors hover:bg-primary/90'>
                    Voir détails
                </Link>
                <button
                    type='button'
                    aria-pressed={saved}
                    aria-label={saved ? `Retirer « ${i.title} » des stages enregistrés` : `Enregistrer « ${i.title} »`}
                    onClick={toggle}
                    className='relative z-10 flex h-11 w-11 items-center justify-center rounded-full text-secondary hover:cursor-pointer hover:bg-offwhite'>
                    <svg viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2' strokeLinejoin='round' aria-hidden='true' className={cn('h-7 w-7', saved ? 'fill-current' : 'fill-none')}>
                        <path d='M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1Z' />
                    </svg>
                </button>
            </div>
        </article>
    )
}
