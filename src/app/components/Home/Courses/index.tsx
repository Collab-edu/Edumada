'use client'
import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import Image from 'next/image'
import Link from 'next/link'
import { FormationType } from '@/app/types/formation'
import withBasePath from '@/utils/basePath'
import AutoScroll from '../../Common/AutoScroll'

const Formations = () => {
    const [formations, setFormations] = useState<FormationType[]>([])
    const [loading, setLoading] = useState(true)
    const [favorites, setFavorites] = useState<string[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(withBasePath('/data/data.json'))
                if (!res.ok) throw new Error('Failed to fetch.')
                const data = await res.json()
                setFormations(data.FormationData)
            } catch (error) {
                console.error('Error fetching services:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const toggleFavorite = (title: string) => {
        setFavorites((prev) =>
            prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
        )
    }

    return (
        <section id='courses-section'>
            <div id='Courses' className='container mx-auto max-w-7xl px-4'>
                <div className='flex flex-col sm:flex-row justify-between sm:items-end gap-5 mb-10'>
                    <div className='flex flex-col gap-3'>
                        <h2 className='font-bold tracking-tight'>Les formations à découvrir</h2>
                        <p className='text-ink/70'>
                            Parcourez une sélection de formations pour découvrir les cursus disponibles.
                        </p>
                    </div>
                    <Link
                        href='/#courses-section'
                        className='group inline-flex shrink-0 items-center gap-1.5 font-semibold text-primary hover:text-primary/80 duration-300'>
                        Découvrir toutes les formations
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
                    <AutoScroll duration={35}>
                        {formations.map((formation) => {
                            const isFavorite = favorites.includes(formation.title)
                            return (
                                <div
                                    key={formation.title}
                                    className='group flex h-full flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg'>
                                    <div className='relative h-44 overflow-hidden bg-cream'>
                                        <Image
                                            src={formation.imageSrc}
                                            alt={formation.title}
                                            fill
                                            className='object-cover'
                                        />
                                        <button
                                            type='button'
                                            onClick={() => toggleFavorite(formation.title)}
                                            aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                            aria-pressed={isFavorite}
                                            className='absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-colors duration-300 hover:bg-white hover:cursor-pointer'>
                                            <Icon
                                                icon={isFavorite ? 'tabler:heart-filled' : 'tabler:heart'}
                                                className={`text-xl ${isFavorite ? 'text-primary' : 'text-secondary'}`}
                                            />
                                        </button>
                                    </div>

                                    <div className='flex flex-1 flex-col gap-4 p-5'>
                                        <div className='flex flex-col gap-1'>
                                            <h3 className='text-lg font-semibold leading-snug text-secondary group-hover:text-primary duration-300'>
                                                {formation.title}
                                            </h3>
                                            <p className='text-ink/60'>{formation.school}</p>
                                        </div>
                                        <ul className='flex flex-col gap-2 text-ink/80'>
                                            <li className='flex items-center gap-2'>
                                                <Icon icon='tabler:map-pin' className='text-lg text-secondary' />
                                                {formation.city}
                                            </li>
                                            <li className='flex items-center gap-2'>
                                                <Icon icon='tabler:school' className='text-lg text-secondary' />
                                                {formation.level}
                                            </li>
                                            <li className='flex items-center gap-2'>
                                                <Icon icon='tabler:clock' className='text-lg text-secondary' />
                                                {formation.duration}
                                            </li>
                                        </ul>
                                        <Link
                                            href='/#courses-section'
                                            className='mt-auto block w-full rounded-lg border border-primary py-3 text-center font-semibold text-primary transition-colors duration-300 hover:bg-primary hover:text-white'>
                                            Voir la formation
                                        </Link>
                                    </div>
                                </div>
                            )
                        })}
                    </AutoScroll>
                )}
            </div>
        </section>
    )
}

export default Formations
