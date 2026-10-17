'use client'
import { useState } from 'react'
import Image from 'next/image'
import { imageOr, mapUrls } from '@/lib/media'
import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import type { CategoryType } from '@/features/categories/types'
import { formatDate } from '@/features/formations/format'
import { track } from '@/lib/track'
import { backofficeUrl } from '@/features/auth/types'
import type { FormationType } from '@/features/formations/types'
import type { SchoolType, TestimonialType } from '../types'
import type { FaqItem } from '../faq'
import SchoolAdmission from './SchoolAdmission'
import SchoolFaq from './SchoolFaq'
import SchoolFormation from './SchoolFormation'
import SchoolTestimonials from './SchoolTestimonials'
import ReportDialog from './ReportDialog'
import ReviewDialog from './ReviewDialog'

interface SchoolProfileProps {
    school: SchoolType
    category: CategoryType
    formations: FormationType[]
    testimonials: TestimonialType[]
    faq: FaqItem[]
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
export function SchoolProfile({ school, category, formations, testimonials, faq }: SchoolProfileProps) {
    const { fields } = category
    // Les avis viennent des étudiants dans le supérieur, des familles ailleurs.
    const reviewsTitle = category.id === 'petite-enfance' ? 'Avis des parents' : fields.careers ? "Témoignages d'étudiants" : 'Avis des familles et des élèves'
    const socials = Object.entries(school.socialLinks).filter((entry): entry is [string, string] => Boolean(entry[1]))
    const map = mapUrls(school.coordinates)
    const [reviewOpen, setReviewOpen] = useState(false)
    const [reportOpen, setReportOpen] = useState(false)
    const websiteLabel = school.website.replace(/^https?:\/\//, '')

    return (
        <section className='pt-24 pb-20 sm:pt-28'>
            <div className='container mx-auto max-w-7xl px-4'>
                {/* Fil d'Ariane */}
                <nav aria-label="Fil d'Ariane" className='mb-4 text-sm text-ink/60'>
                    <Link href='/' className='inline-block py-2 hover:text-primary'>Accueil</Link>
                    <span className='mx-2'>/</span>
                    <Link href='/etablissements/' className='inline-block py-2 hover:text-primary'>Établissements</Link>
                    <span className='mx-2'>/</span>
                    <span className='text-secondary'>{school.name}</span>
                </nav>

                {/* Couverture */}
                <div className='relative h-72 md:h-80 overflow-hidden rounded-2xl bg-secondary'>
                    <Image src={imageOr(school.imageSrc)} alt={`Locaux de ${school.name}`} fill priority className='object-cover' />
                    <div aria-hidden='true' className='absolute inset-0 bg-gradient-to-t from-secondary via-secondary/60 to-transparent' />
                    <div className='absolute inset-x-0 bottom-0 flex flex-col md:flex-row md:items-end gap-4 p-6 md:p-8'>
                        <span className='flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white text-xl font-bold tracking-wide text-secondary shadow-lg'>
                            {school.initials}
                        </span>
                        <div className='flex flex-col gap-2'>
                            <h1 className='text-3xl md:text-4xl font-bold leading-tight text-white'>{school.name}</h1>
                            <div className='flex flex-wrap items-center gap-2 text-sm'>
                                <span className='inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 font-semibold text-secondary'>
                                    <Icon icon={category.icon} /> {school.subCategory}
                                </span>
                                <span className='rounded-full bg-white/20 px-3 py-1 text-white backdrop-blur-sm'>
                                    {school.type === 'Public' ? 'Public' : 'Privé'}
                                </span>
                                <span className='inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-white backdrop-blur-sm'>
                                    <Icon icon='tabler:map-pin' /> {school.city}
                                </span>
                                {school.verification.status === 'Vérifié' && (
                                    <span className='inline-flex items-center gap-1 rounded-full bg-success px-3 py-1 font-semibold text-secondary'>
                                        <Icon icon='tabler:shield-check' /> Fiche vérifiée
                                    </span>
                                )}
                                {school.accreditationVerified && (
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
                        {school.phone && (
                            <a
                                href={`tel:${school.phone.replace(/\s/g, '')}`}
                                onClick={() => track({ type: 'contact_click', establishment: school.id })}
                                className='inline-flex items-center gap-2 rounded-lg border border-secondary/20 bg-white px-4 py-2.5 font-semibold text-secondary transition-colors duration-300 hover:border-primary hover:text-primary'>
                                <Icon icon='tabler:phone' className='text-lg' /> Appeler
                            </a>
                        )}
                        {school.website && (
                            <a
                                href={school.website}
                                target='_blank'
                                rel='noopener noreferrer'
                                onClick={() => track({ type: 'website_click', establishment: school.id })}
                                className='inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-semibold text-white shadow-lg shadow-primary/30 transition-colors duration-300 hover:bg-primary/90'>
                                <Icon icon='tabler:world' className='text-lg' /> Site web
                            </a>
                        )}
                    </div>
                </div>

                <div className='mt-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8'>
                    {/* Colonne principale */}
                    <div className='flex flex-col gap-10'>
                        <div>
                            <h2 className='mb-3 font-bold'>À propos</h2>
                            <p className='text-black leading-relaxed'>{school.description}</p>
                        </div>

                        <div>
                            <h2 className='mb-5 font-bold'>
                                {category.offersLabel} <span className='text-ink/50'>({formations.length})</span>
                            </h2>
                            {formations.length > 0 ? (
                                <div className='grid grid-cols-1 md:grid-cols-2 items-start gap-5'>
                                    {formations.map((formation) => (
                                        <SchoolFormation key={formation.id} formation={formation} fields={fields} />
                                    ))}
                                </div>
                            ) : (
                                <p className='text-ink/60'>Aucune offre n&apos;est encore référencée pour cet établissement.</p>
                            )}
                        </div>

                        {formations.length > 0 && (
                            <div id='admission' className='scroll-mt-28'>
                                <h2 className='mb-5 font-bold'>Conditions d&apos;admission</h2>
                                <SchoolAdmission school={school} formations={formations} fields={fields} />
                            </div>
                        )}

                        {school.photos.length > 0 && (
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
                        )}

                        {school.infrastructures.length > 0 && (
                            <div>
                                <h2 className='mb-5 font-bold'>Infrastructures</h2>
                                <ul className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                                    {school.infrastructures.map((item) => (
                                        <li key={item} className='flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 text-ink/80'>
                                            <Icon icon='tabler:circle-check-filled' className='shrink-0 text-lg text-primary' /> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div id='temoignages' className='scroll-mt-28'>
                            <div className='mb-5 flex flex-wrap items-center justify-between gap-3'>
                                <h2 className='font-bold'>{reviewsTitle}</h2>
                                <button
                                    type='button'
                                    onClick={() => setReviewOpen(true)}
                                    className='inline-flex min-h-11 items-center gap-2 rounded-lg border border-primary px-4 py-2 font-semibold text-primary hover:bg-primary hover:text-white hover:cursor-pointer'>
                                    <Icon icon='tabler:message-star' /> Donner mon avis
                                </button>
                            </div>
                            <SchoolTestimonials testimonials={testimonials} formations={formations} />
                        </div>

                        <div id='faq' className='scroll-mt-28'>
                            <h2 className='mb-5 font-bold'>Questions fréquentes</h2>
                            <SchoolFaq items={faq} />
                        </div>
                    </div>

                    {/* Colonne latérale */}
                    <aside className='flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start'>
                        {map && (
                        <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
                            <p className='px-6 pt-5 pb-3 text-lg font-bold text-secondary'>Localisation</p>
                            <iframe
                                title={`Carte : ${school.name}`}
                                src={map.embed}
                                className='h-64 w-full border-0'
                            />
                            <a
                                href={map.link}
                                target='_blank'
                                rel='noopener noreferrer'
                                className='flex items-center justify-between px-6 py-4 font-semibold text-primary hover:underline'>
                                Ouvrir dans OpenStreetMap
                                <Icon icon='tabler:external-link' />
                            </a>
                        </div>
                        )}

                        <div className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm'>
                            <p className='mb-2 text-lg font-bold text-secondary'>Informations pratiques</p>
                            <ul>
                                <InfoRow icon='tabler:building-community' label='Nom'>{school.name}</InfoRow>
                                <InfoRow icon={category.icon} label='Type et catégorie'>
                                    {school.subCategory} · {category.label} · {school.type === 'Public' ? 'public' : 'privé'}
                                </InfoRow>
                                <InfoRow icon='tabler:map-pin' label='Adresse'>{school.address}</InfoRow>
                                {school.phone && (
                                    <InfoRow icon='tabler:phone' label='Téléphone'>
                                        <a href={`tel:${school.phone.replace(/\s/g, '')}`} onClick={() => track({ type: 'contact_click', establishment: school.id })} className='hover:text-primary'>{school.phone}</a>
                                    </InfoRow>
                                )}
                                {school.email && (
                                    <InfoRow icon='tabler:mail' label='E-mail'>
                                        <a href={`mailto:${school.email}`} onClick={() => track({ type: 'contact_click', establishment: school.id })} className='hover:text-primary'>{school.email}</a>
                                    </InfoRow>
                                )}
                                {school.website && (
                                    <InfoRow icon='tabler:world' label='Site web'>
                                        <a href={school.website} target='_blank' rel='noopener noreferrer' onClick={() => track({ type: 'website_click', establishment: school.id })} className='text-primary hover:underline'>
                                            {websiteLabel}
                                        </a>
                                    </InfoRow>
                                )}
                                {socials.length > 0 && (
                                    <InfoRow icon='tabler:share' label='Réseaux sociaux'>
                                        <span className='flex flex-wrap gap-2'>
                                            {socials.map(([network, url]) => (
                                                <a
                                                    key={network}
                                                    href={url}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    aria-label={network}
                                                    className='flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 text-secondary hover:bg-primary hover:text-white'>
                                                    <Icon icon={`tabler:brand-${network}`} className='text-xl' />
                                                </a>
                                            ))}
                                        </span>
                                    </InfoRow>
                                )}
                                <InfoRow icon='tabler:rosette-discount-check' label='Reconnaissance / accréditation'>
                                    {school.accreditationVerified && school.accreditation
                                        ? school.accreditation
                                        : 'En cours de vérification par Edumada'}
                                </InfoRow>
                                <InfoRow icon='tabler:shield-check' label='Statut sur Edumada'>
                                    {school.verification.status === 'Vérifié' && school.verification.date
                                        ? `Fiche vérifiée le ${formatDate(school.verification.date)}`
                                        : school.verification.status === 'En cours'
                                            ? 'Vérification en cours'
                                            : 'Fiche non vérifiée'}
                                </InfoRow>
                            </ul>
                        </div>
                        <div className='rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col gap-3'>
                            <p className='text-lg font-bold text-secondary'>Une information à corriger ?</p>
                            <button
                                type='button'
                                onClick={() => setReportOpen(true)}
                                className='flex min-h-11 items-center gap-2 font-semibold text-primary hover:underline hover:cursor-pointer'>
                                <Icon icon='tabler:flag' /> Signaler une information erronée
                            </button>
                            <Link
                                href={backofficeUrl(`/revendiquer?fiche=${school.id}`)}
                                className='flex min-h-11 items-center gap-2 font-semibold text-secondary hover:text-primary'>
                                <Icon icon='tabler:building-community' /> Vous représentez cet établissement ? Gérez cette fiche
                            </Link>
                        </div>
                    </aside>
                </div>
            </div>
            <ReviewDialog open={reviewOpen} onClose={() => setReviewOpen(false)} establishmentId={school.id} formations={formations} />
            <ReportDialog open={reportOpen} onClose={() => setReportOpen(false)} establishmentId={school.id} />
        </section>
    )
}

export default SchoolProfile
