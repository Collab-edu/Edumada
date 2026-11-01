'use client'
import Link, { useT } from '@/i18n/client'
import { EduPageLoader } from '@/components/ui/edu-loader'
import { Icon } from '@/components/ui/icon'

/** Affiché pendant le chargement d'une fiche ou d'une page. */
export function PageSkeleton() {
    return <EduPageLoader />
}

/** Fiche introuvable ou service indisponible : message clair et chemin de sortie. */
export function PageUnavailable({ title, message }: { title: string; message: string }) {
    const t = useT()
    return (
        <section className='pt-32 pb-20'>
            <div className='container mx-auto max-w-xl px-4 flex flex-col items-center gap-4 text-center'>
                <span className='flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white'>
                    <Icon icon='tabler:mood-empty' className='text-3xl' />
                </span>
                <h1 className='text-3xl font-bold text-secondary'>{t(title)}</h1>
                <p className='text-black'>{t(message)}</p>
                <div className='flex flex-col sm:flex-row gap-3'>
                    <Link href='/recherche/' className='rounded-lg bg-primary px-6 py-3 font-bold text-white hover:bg-primary/90'>
                        {t('Rechercher une formation')}
                    </Link>
                    <Link href='/' className='rounded-lg border border-secondary/20 px-6 py-3 font-semibold text-secondary hover:border-primary hover:text-primary'>
                        {t('Retour à l’accueil')}
                    </Link>
                </div>
            </div>
        </section>
    )
}
