'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import type { FormationType } from '@/features/formations/types'
import type { SchoolType } from '../types'
import SchoolFormation from './SchoolFormation'

interface SchoolProfileProps {
    school: SchoolType
    formations: FormationType[]
}

function InfoRow({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
    return (
        <li className='flex gap-3 py-3 border-b border-gray-100 last:border-b-0'>
            <Icon icon={icon} className='mt-0.5 shrink-0 text-xl text-secondary' />
            <div className='flex min-w-0 flex-col'>
                <span className='text-sm text-ink/60'>{label}</span>
                <span className='break-words text-ink'>{children}</span>
            </div>
        </li>
    )
}

/** Fiche complète d'un établissement : présentation, formations, photos, contact et localisation. */
export function SchoolProfile({ school, formations }: SchoolProfileProps) {
    const { lat, lng } = school.coordinates
    const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.012}%2C${lat - 0.008}%2C${lng + 0.012}%2C${lat + 0.008}&layer=mapnik&marker=${lat}%2C${lng}`
    const mapLink = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`
    const websiteLabel = school.website.replace(/^https?:\/\//, '')

    return (
        <section className='pt-28 pb-20'>
            <div className='container mx-auto max-w-7xl px-4'>
                {/* Fil d'Ariane */}
                <nav aria-label="Fil d'Ariane" className='mb-4 text-sm text-ink/60'>
                    <Link href='/' className='hover:text-primary'>Accueil</Link>
                    <span className='mx-2'>/</span>
                    <Link href='/#schools-section' className='hover:text-primary'>Établissements</Link>
                    <span className='mx-2'>/</span>
                    <span className='text-secondary'>{school.name}</span>
                </nav>

                {/* Couverture */}
                <div className='relative h-72 md:h-80 overflow-hidden rounded-2xl bg-secondary'>
                    <Image src={school.imageSrc} alt={`Locaux de ${school.name}`} fill priority className='object-cover' />
                    <div aria-hidden='true' className='absolute inset-0 bg-gradient-to-t from-secondary via-secondary/60 to-transparent' />
                    <div className='absolute inset-x-0 bottom-0 flex flex-col md:flex-row md:items-end gap-4 p-6 md:p-8'>
                        <span className='flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white text-xl font-bold tracking-wide text-secondary shadow-lg'>
                            {school.initials}
                        </span>
                        <div className='flex flex-col gap-2'>
                            <h1 className='text-3xl md:text-4xl font-bold leading-tight text-white'>{school.name}</h1>
                            <div className='flex flex-wrap items-center gap-2 text-sm'>
                                <span className='rounded-full bg-white/90 px-3 py-1 font-semibold text-secondary'>
                                    {school.type === 'Public' ? 'Établissement public' : 'Établissement privé'}
                                </span>
                                <span className='inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-white backdrop-blur-sm'>
                                    <Icon icon='tabler:map-pin' /> {school.city}
                                </span>
                                {school.accreditation && (
                                    <span className='inline-flex items-center gap-1 rounded-full bg-success px-3 py-1 font-semibold text-secondary'>
                                        <Icon icon='tabler:rosette-discount-check' /> Reconnu
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions rapides */}
                <div className='mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                    <div className='flex flex-wrap gap-2'>
                        {school.tags.map((tag) => (
                            <span key={tag} className='rounded-full bg-success/30 px-3 py-1 text-sm font-medium text-secondary'>
                                {tag}
                            </span>
                        ))}
                    </div>
                    <div className='flex flex-wrap gap-3'>
                        <a
                            href={`tel:${school.phone.replace(/\s/g, '')}`}
                            className='inline-flex items-center gap-2 rounded-lg border border-secondary/20 bg-white px-4 py-2.5 font-semibold text-secondary transition-colors duration-300 hover:border-primary hover:text-primary'>
                            <Icon icon='tabler:phone' className='text-lg' /> Appeler
                        </a>
                        <a
                            href={school.website}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-semibold text-white shadow-lg shadow-primary/30 transition-colors duration-300 hover:bg-primary/90'>
                            <Icon icon='tabler:world' className='text-lg' /> Site web
                        </a>
                    </div>
                </div>

                <div className='mt-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8'>
                    {/* Colonne principale */}
                    <div className='flex flex-col gap-10'>
                        <div>
                            <h2 className='mb-3 font-bold'>À propos</h2>
                            <p className='text-ink/80 leading-relaxed'>{school.description}</p>
                        </div>

                        <div>
                            <h2 className='mb-5 font-bold'>
                                Formations proposées <span className='text-ink/50'>({formations.length})</span>
                            </h2>
                            {formations.length > 0 ? (
                                <div className='grid grid-cols-1 md:grid-cols-2 items-start gap-5'>
                                    {formations.map((formation) => (
                                        <SchoolFormation key={formation.id} formation={formation} />
                                    ))}
                                </div>
                            ) : (
                                <p className='text-ink/60'>Aucune formation n&apos;est encore référencée pour cet établissement.</p>
                            )}
                        </div>

                        <div>
                            <h2 className='mb-5 font-bold'>Photos</h2>
                            <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                                {school.photos.map((src, i) => (
                                    <div
                                        key={src}
                                        className={`relative overflow-hidden rounded-xl bg-cream ${i === 0 ? 'col-span-2 row-span-2 h-72' : 'h-[138px]'}`}>
                                        <Image src={src} alt={`${school.name} — photo ${i + 1}`} fill className='object-cover' />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Colonne latérale */}
                    <aside className='flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start'>
                        <div className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
                            <p className='mb-2 text-lg font-bold text-secondary'>Informations pratiques</p>
                            <ul>
                                <InfoRow icon='tabler:building-community' label='Nom'>{school.name}</InfoRow>
                                <InfoRow icon='tabler:map-pin' label='Adresse'>{school.address}</InfoRow>
                                <InfoRow icon='tabler:phone' label='Téléphone'>
                                    <a href={`tel:${school.phone.replace(/\s/g, '')}`} className='hover:text-primary'>{school.phone}</a>
                                </InfoRow>
                                <InfoRow icon='tabler:mail' label='E-mail'>
                                    <a href={`mailto:${school.email}`} className='hover:text-primary'>{school.email}</a>
                                </InfoRow>
                                <InfoRow icon='tabler:world' label='Site web'>
                                    <a href={school.website} target='_blank' rel='noopener noreferrer' className='text-primary hover:underline'>
                                        {websiteLabel}
                                    </a>
                                </InfoRow>
                                <InfoRow icon='tabler:rosette-discount-check' label='Reconnaissance / accréditation'>
                                    {school.accreditation ?? 'Non renseignée'}
                                </InfoRow>
                            </ul>
                        </div>

                        <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
                            <p className='px-6 pt-5 pb-3 text-lg font-bold text-secondary'>Localisation</p>
                            <iframe
                                title={`Carte : ${school.name}`}
                                src={mapSrc}
                                loading='lazy'
                                className='h-64 w-full border-0'
                            />
                            <a
                                href={mapLink}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='flex items-center justify-between px-6 py-4 font-semibold text-primary hover:underline'>
                                Ouvrir dans OpenStreetMap
                                <Icon icon='tabler:external-link' />
                            </a>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    )
}

export default SchoolProfile
