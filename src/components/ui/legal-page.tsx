import type { ReactNode } from 'react'
import { T } from '@/i18n/T'

/** Mise en page des pages légales : texte lisible, une colonne. */
export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
    return (
        <main>
            <section className='pt-28 pb-20'>
                <article className='container mx-auto max-w-3xl px-4 flex flex-col gap-5 text-ink/90 [&_h2]:mt-4 [&_h2]:font-bold [&_li]:ml-5 [&_li]:list-disc'>
                    <h1 className='text-3xl md:text-4xl font-bold text-secondary'>
                        <T>{title}</T>
                    </h1>
                    <p className='text-sm text-ink/60'>
                        <T vars={{ updated }}>{'Mise à jour : {updated}. Document de travail, à faire valider par un juriste avant la mise en ligne.'}</T>
                    </p>
                    {children}
                </article>
            </section>
        </main>
    )
}
