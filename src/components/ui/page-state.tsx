'use client'
import Link from 'next/link'
import { Icon } from '@/components/ui/icon'

/** Squelette affiché pendant le chargement d'une fiche. */
export function PageSkeleton() {
    return (
        <div className='container mx-auto max-w-7xl px-4 pt-28 pb-20' aria-busy='true' aria-live='polite'>
            <span className='sr-only'>Chargement…</span>
            <div className='h-72 rounded-2xl bg-white border border-gray-100 animate-pulse' />
            <div className='mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8'>
                <div className='flex flex-col gap-4'>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className='h-32 rounded-2xl bg-white border border-gray-100 animate-pulse' />
                    ))}
                </div>
                <div className='hidden lg:block h-80 rounded-2xl bg-white border border-gray-100 animate-pulse' />
            </div>
        </div>
    )
}

/** Fiche introuvable ou service indisponible : message clair et chemin de sortie. */
export function PageUnavailable({ title, message }: { title: string; message: string }) {
    return (
        <section className='pt-32 pb-20'>
            <div className='container mx-auto max-w-xl px-4 flex flex-col items-center gap-4 text-center'>
                <span className='flex h-16 w-16 items-center justify-center rounded-full bg-cream text-primary'>
                    <Icon icon='tabler:mood-empty' className='text-3xl' />
                </span>
                <h1 className='text-3xl font-bold text-secondary'>{title}</h1>
                <p className='text-ink/70'>{message}</p>
                <div className='flex flex-col sm:flex-row gap-3'>
                    <Link href='/recherche/' className='rounded-lg bg-primary px-6 py-3 font-bold text-white hover:bg-primary/90'>
                        Rechercher une formation
                    </Link>
                    <Link href='/' className='rounded-lg border border-secondary/20 px-6 py-3 font-semibold text-secondary hover:border-primary hover:text-primary'>
                        Retour à l&apos;accueil
                    </Link>
                </div>
            </div>
        </section>
    )
}
