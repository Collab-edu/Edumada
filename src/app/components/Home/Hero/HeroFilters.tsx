'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import FilterDropdown from './FilterDropdown'
import { HeroFilterType } from '@/app/types/herofilter'
import withBasePath from '@/utils/basePath'
import { Icon } from '@iconify/react/dist/iconify.js'

// Icône affichée devant chaque filtre, dans l'ordre de HeroFilterData
const FILTER_ICONS = ['tabler:book-2', 'tabler:school', 'tabler:map-pin', 'tabler:building-community']

const HeroFilters = () => {
    const [filters, setFilters] = useState<HeroFilterType[]>([])
    const [selected, setSelected] = useState<string[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(withBasePath('/data/data.json'))
                if (!res.ok) throw new Error('Failed to fetch')
                const data = await res.json()
                setFilters(data.HeroFilterData)
                setSelected(data.HeroFilterData.map((f: HeroFilterType) => f.options[0]))
            } catch (error) {
                console.error('Error fetching services:', error)
            }
        }
        fetchData()
    }, [])

    const handleChange = (index: number, value: string) => {
        setSelected((prev) => prev.map((v, i) => (i === index ? value : v)))
    }

    return (
        <div className='relative mx-auto max-w-6xl mt-12'>
            {/* Lueur colorée derrière la barre */}
            <div
                aria-hidden='true'
                className='pointer-events-none absolute -inset-2 rounded-3xl bg-gradient-to-r from-primary/40 via-cream to-secondary/40 blur-2xl opacity-70'
            />
            <div className='relative rounded-2xl bg-white p-3 ring-1 ring-secondary/10 shadow-[0_24px_60px_-20px_rgba(15,76,92,0.45)]'>
                <div className='flex items-center justify-center gap-2 px-4 pt-2 pb-3 text-sm font-semibold text-secondary'>
                    <Icon icon='tabler:search' className='text-lg text-primary' />
                    Trouvez l&apos;établissement qui vous correspond
                </div>
                <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5 lg:items-center'>
                    {filters.map((filter, index) => (
                        <div
                            key={filter.label}
                            className='rounded-xl px-4 py-3 transition-colors duration-200 hover:bg-offwhite lg:border-r lg:border-gray-100 lg:rounded-none'>
                            <FilterDropdown
                                icon={FILTER_ICONS[index]}
                                label={filter.label}
                                options={filter.options}
                                value={selected[index]}
                                onChange={(value) => handleChange(index, value)}
                            />
                        </div>
                    ))}
                    <div className='sm:col-span-2 lg:col-span-1 p-1'>
                        <Link href={'/#courses-section'}>
                            <button className='flex items-center justify-center gap-2 bg-primary w-full text-white font-bold py-4 px-3 rounded-xl shadow-lg shadow-primary/30 hover:bg-primary/90 hover:shadow-primary/50 hover:-translate-y-0.5 duration-300 hover:cursor-pointer'>
                                <Icon icon='tabler:search' className='text-xl' />
                                Rechercher
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HeroFilters
