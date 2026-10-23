'use client'
import Image from 'next/image'
import withBasePath from '@/lib/base-path'
import AutoScroll from '@/components/ui/auto-scroll'
import { useSiteData } from '@/data/site-data'

/** « /images/slickCompany/microsoft.svg » → « Microsoft » (texte alternatif du logo). */
const logoName = (src: string) => {
    const file = src.split('/').pop()?.replace(/\.[a-z]+$/i, '') ?? ''
    return file.charAt(0).toUpperCase() + file.slice(1)
}

/** Logos des établissements qui défilent en continu, en bas du hero de l'accueil. */
export default function HeroLogos() {
    const { data: companies } = useSiteData('Companiesdata')

    // Hauteur réservée pendant le chargement : le hero ne saute pas.
    if (companies.length === 0) return <div className='h-12' aria-hidden='true' />

    return (
        // TODO : logos d'exemple du template, à remplacer par de vrais établissements partenaires
        <AutoScroll duration={120} minItemsPerLoop={12} itemClassName='w-36 sm:w-48'>
            {companies.map((item) => (
                <div key={item.imgSrc} className='flex h-12 items-center justify-center'>
                    <Image
                        src={withBasePath(item.imgSrc)}
                        alt={logoName(item.imgSrc)}
                        width={140}
                        height={40}
                        className='h-7 w-auto max-w-full object-contain sm:h-9'
                    />
                </div>
            ))}
        </AutoScroll>
    )
}
