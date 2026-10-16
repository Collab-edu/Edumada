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

/** Bande de logos partenaires, pleine largeur sur fond blanc, qui défile en continu. */
const Companies = () => {
    const { data: companies } = useSiteData('Companiesdata')

    return (
        <section className='bg-white py-8 sm:py-10 border-y border-gray-100'>
            {/* TODO : logos d'exemple du template, à remplacer par de vrais partenaires */}
            <h2 className='mb-6 px-4 text-center text-base font-medium text-ink/70'>Ils nous font confiance</h2>
            {companies.length > 0 ? (
                <AutoScroll duration={30} minItemsPerLoop={12} itemClassName='w-40 sm:w-56'>
                    {companies.map((item) => (
                        <div key={item.imgSrc} className='flex h-12 items-center justify-center'>
                            <Image
                                src={withBasePath(item.imgSrc)}
                                alt={logoName(item.imgSrc)}
                                width={140}
                                height={40}
                                className='h-8 w-auto max-w-full object-contain sm:h-10'
                            />
                        </div>
                    ))}
                </AutoScroll>
            ) : (
                <div className='h-[72px]' aria-hidden='true' />
            )}
        </section>
    )
}

export default Companies
