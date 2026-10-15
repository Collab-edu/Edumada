'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import { DomainType } from '@/app/types/domain'
import withBasePath from '@/utils/basePath'

const Domains = () => {
    const [domains, setDomains] = useState<DomainType[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(withBasePath('/data/data.json'))
                if (!res.ok) throw new Error('Failed to fetch')
                const data = await res.json()
                setDomains(data.DomainData)
            } catch (error) {
                console.error('Error fetching services:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <section id='domains-section'>
            <div className='container mx-auto max-w-7xl px-4'>
                <div className='flex flex-col sm:flex-row justify-between sm:items-end gap-5 mb-10'>
                    <div className='flex flex-col gap-3'>
                        <h2 className='font-bold tracking-tight'>Explorez les formations par domaine</h2>
                        <p className='text-base text-ink/70'>
                            Découvrez les possibilités d&apos;études selon vos centres d&apos;intérêt et vos
                            objectifs professionnels.
                        </p>
                    </div>
                    <Link
                        href='/#courses-section'
                        className='group inline-flex shrink-0 items-center gap-1.5 font-semibold text-primary hover:text-primary/80 duration-300'>
                        Voir tous les domaines
                        <Icon
                            icon='tabler:arrow-right'
                            className='text-lg transition-transform duration-300 group-hover:translate-x-1'
                        />
                    </Link>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                    {loading
                        ? Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className='h-28 rounded-2xl bg-white border border-gray-100 animate-pulse' />
                        ))
                        : domains.map((domain) => (
                            <Link
                                key={domain.name}
                                href='/#courses-section'
                                className='group flex items-center gap-5 rounded-2xl bg-white border border-gray-100 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg'>
                                <span className='flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary transition-colors duration-300 group-hover:bg-primary group-hover:text-white'>
                                    <Icon icon={domain.icon} className='text-2xl' />
                                </span>
                                <div className='flex flex-col gap-2'>
                                    <h3 className='text-base font-semibold leading-snug text-secondary group-hover:text-primary duration-300'>
                                        {domain.name}
                                    </h3>
                                    <p className='text-base text-ink/60'>{domain.count} formations</p>
                                </div>
                            </Link>
                        ))}
                </div>
            </div>
        </section>
    )
}

export default Domains
