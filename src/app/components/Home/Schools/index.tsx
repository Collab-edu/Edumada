'use client'
import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import Image from 'next/image'
import Link from 'next/link'
import { SchoolType } from '@/app/types/school'
import withBasePath from '@/utils/basePath'
import AutoScroll from '../../Common/AutoScroll'

const Schools = () => {
    const [schools, setSchools] = useState<SchoolType[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(withBasePath('/data/data.json'))
                if (!res.ok) throw new Error('Failed to fetch.')
                const data = await res.json()
                setSchools(data.SchoolData)
            } catch (error) {
                console.error('Error fetching services:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <section id='schools-section' className='bg-secondary/[0.06] py-20 mt-14'>
            <div className='container mx-auto max-w-7xl px-4'>
                <div className='flex flex-col sm:flex-row justify-between sm:items-end gap-5 mb-10'>
                    <div className='flex flex-col gap-3'>
                        <h2 className='font-bold tracking-tight'>Découvrez les établissements</h2>
                        <p className='text-ink/70'>
                            Consultez les établissements et découvrez les formations qu&apos;ils proposent.
                        </p>
                    </div>
                    <Link
                        href='/#schools-section'
                        className='group inline-flex shrink-0 items-center gap-1.5 font-semibold text-primary hover:text-primary/80 duration-300'>
                        Voir tous les établissements
                        <Icon
                            icon='tabler:arrow-right'
                            className='text-lg transition-transform duration-300 group-hover:translate-x-1'
                        />
                    </Link>
                </div>

                {loading ? (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className='h-[420px] rounded-2xl bg-white border border-gray-100 animate-pulse' />
                        ))}
                    </div>
                ) : (
                    <AutoScroll duration={40}>
                        {schools.map((school) => (
                            <div
                                key={school.name}
                                className='group flex h-full flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg'>
                                <div className='relative h-36 bg-cream'>
                                    <Image
                                        src={school.imageSrc}
                                        alt={`Locaux de ${school.name}`}
                                        fill
                                        className='object-cover'
                                    />
                                </div>

                                <div className='flex flex-1 flex-col gap-3 px-5 pb-5'>
                                    {/* Logo de l'établissement, à cheval sur la photo */}
                                    <span className='relative -mt-7 flex h-14 w-14 items-center justify-center rounded-xl bg-secondary text-sm font-bold tracking-wide text-white ring-4 ring-white'>
                                        {school.initials}
                                    </span>
                                    <div className='flex flex-col gap-1'>
                                        <h3 className='text-lg font-semibold leading-snug text-secondary group-hover:text-primary duration-300'>
                                            {school.name}
                                        </h3>
                                        <p className='flex items-center gap-1.5 text-ink/70'>
                                            <Icon icon='tabler:map-pin' className='text-lg text-secondary' />
                                            {school.city}
                                        </p>
                                    </div>
                                    <p className='text-ink/60'>{school.description}</p>
                                    <div className='flex flex-wrap gap-2'>
                                        {school.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className='rounded-full bg-success/30 px-3 py-1 text-sm font-medium text-secondary'>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <Link
                                        href='/#schools-section'
                                        className='mt-auto block w-full rounded-lg border border-primary py-3 text-center font-semibold text-primary transition-colors duration-300 hover:bg-primary hover:text-white'>
                                        Voir l&apos;établissement
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </AutoScroll>
                )}
            </div>
        </section>
    )
}

export default Schools
