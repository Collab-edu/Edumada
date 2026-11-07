'use client'
import { useState } from 'react'
import Image from 'next/image'
import { imageOr, mapUrls } from '@/lib/media'
import Link, { useT } from '@/i18n/client'
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
import SchoolLogo from './SchoolLogo'
import ReportDialog from './ReportDialog'
import ReviewDialog from './ReviewDialog'
import SchoolMap from '@/components/map/SchoolMap'
import ContactDialog from '@/features/formations/components/detail/ContactDialog'

interface SchoolProfileProps {
    school: SchoolType
    category: CategoryType
    formations: FormationType[]
    testimonials: TestimonialType[]
    faq: FaqItem[]
}

/** « 27 ans d'existence », « Créé cette année ». */
function foundedLabel(year: number): string {
    const age = new Date().getFullYear() - year
    return age <= 0 ? 'Créé cette année' : age === 1 ? "1 an d'existence" : `${age} ans d'existence`
}

/** Ligne de la fiche pratique : libellé à gauche, valeur à droite. */
function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
    const t = useT()
    return (
        <div className='flex items-start justify-between gap-4 border-b border-gray-100 py-2.5 last:border-b-0'>
            <dt className='shrink-0 text-ink/60'>{t(label)}</dt>
            <dd className='min-w-0 break-words text-right font-medium text-ink'>{typeof children === 'string' ? t(children) : children}</dd>
        </div>
    )
}

/** Fiche complète d'un établissement : présentation, formations, photos, contact et localisation. */
export function SchoolProfile({ school, category, formations, testimonials, faq }: SchoolProfileProps) {
    const t = useT()
    const { fields } = category
    // Les avis viennent des étudiants dans le supérieur, des familles ailleurs.
    const reviewsTitle = category.id === 'petite-enfance' ? 'Avis des parents' : fields.careers ? "Témoignages d'étudiants" : 'Avis des familles et des élèves'
    const socials = Object.entries(school.socialLinks).filter((entry): entry is [string, string] => Boolean(entry[1]))
    const map = mapUrls(school.coordinates)
    const [reviewOpen, setReviewOpen] = useState(false)
    const [reportOpen, setReportOpen] = useState(false)
    const [contactOpen, setContactOpen] = useState(false)
    const websiteLabel = school.website.replace(/^https?:\/\//, '')
    // Pastille du bandeau de la fiche pratique.
    const statusLabel = school.verification.status === 'Vérifié' ? 'Vérifiée' : school.verification.status === 'En cours' ? 'Vérification en cours' : 'Non vérifiée'
    const statusClass = school.verification.status === 'Vérifié' ? 'bg-success text-secondary' : 'bg-white/15 text-white'

    return (
        <section className='pt-24 pb-20 sm:pt-28'>
            <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                {/* Fil d'Ariane */}
                <nav aria-label={t("Fil d'Ariane")} className='mb-4 text-sm text-ink/60'>
                    <Link href='/' className='inline-block py-2 hover:text-primary'>{t('Accueil')}</Link>
                    <span className='mx-2'>/</span>
                    <Link href='/etablissements/' className='inline-block py-2 hover:text-primary'>{t('Établissements')}</Link>
                    <span className='mx-2'>/</span>
                    <span aria-current='page' className='text-black'>{school.name}</span>
                </nav>

                {/* Couverture */}
                <div className='relative h-72 md:h-80 overflow-hidden rounded-xl bg-secondary'>
                    <Image src={imageOr(school.imageSrc)} alt={`Locaux de ${school.name}`} fill priority className='object-cover' />
                    <div aria-hidden='true' className='absolute inset-0 bg-gradient-to-t from-secondary via-secondary/60 to-transparent' />
                    <div className='absolute inset-x-0 bottom-0 flex flex-col md:flex-row md:items-end gap-4 p-6 md:p-8'>
                        <SchoolLogo
                            name={school.name}
                            initials={school.initials}
                            logo={school.logo}
                            className='h-14 w-14 rounded-xl text-sm shadow-md ring-4 ring-white'
                            fallbackClassName='bg-white text-secondary'
                        />
                        <div className='flex flex-col gap-2'>
                            <h1 className='text-3xl md:text-4xl font-bold leading-tight text-white'>{school.name}</h1>
                            <div className='flex flex-wrap items-center gap-2 text-sm'>
                                <span className='inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 font-semibold text-secondary'>
                                    <Icon icon={category.icon} /> {school.subCategory}
                                </span>
                                {school.type && <span className='rounded-full bg-white/20 px-3 py-1 text-white backdrop-blur-sm'>{school.type}</span>}
                                <span className='inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-white backdrop-blur-sm'>
                                    <Icon icon='tabler:map-pin' /> {school.city}
                                </span>
                                {school.foundedYear && (
                                    <span className='inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-white backdrop-blur-sm'>
                                        <Icon icon='tabler:calendar-star' /> {school.foundedYear} · {t(foundedLabel(school.foundedYear))}
                                    </span>
                                )}
                                {school.verification.status === 'Vérifié' && (
                                    <span className='inline-flex items-center gap-1 rounded-full bg-success px-3 py-1 font-semibold text-secondary'>
                                        <Icon icon='tabler:shield-check' /> {t('Fiche vérifiée')}
                                    </span>
                                )}
                                {school.accreditationVerified && (
                                    <span className='inline-flex items-center gap-1 rounded-full bg-success px-3 py-1 font-semibold text-secondary'>
                                        <Icon icon='tabler:rosette-discount-check' /> {t('Reconnu')}
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
                        <button
                            type='button'
                            onClick={() => setContactOpen(true)}
                            className='inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-semibold text-white shadow-lg shadow-primary/30 transition-colors duration-300 hover:cursor-pointer hover:bg-primary/90'>
                            <Icon icon='tabler:message-circle' className='text-lg' /> Contacter l’établissement
                        </button>
                        {school.website && (
                            <a
                                href={school.website}
                                target='_blank'
                                rel='noopener noreferrer'
                                onClick={() => track({ type: 'website_click', establishment: school.id })}
                                className='inline-flex items-center gap-2 rounded-lg border border-secondary/20 bg-white px-4 py-2.5 font-semibold text-secondary transition-colors duration-300 hover:border-primary hover:text-primary'>
                                <Icon icon='tabler:world' className='text-lg' /> {t('Site web')}
                            </a>
                        )}
                    </div>
                </div>

                <div className='mt-10 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-8'>
                    {/* Colonne principale */}
                    <div className='flex flex-col gap-10'>
                        <div>
                            <h2 className='mb-3 font-bold'>{t('À propos')}</h2>
                            <p className='text-black leading-relaxed'>{school.description}</p>
                        </div>

                        <div>
                            <h2 className='mb-5 font-bold'>
                                {t(category.offersLabel)} <span className='text-ink/50'>({formations.length})</span>
                            </h2>
                            {formations.length > 0 ? (
                                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'>
                                    {formations.map((formation) => (
                                        <SchoolFormation key={formation.id} formation={formation} />
                                    ))}
                                </div>
                            ) : (
                                <p className='text-ink/60'>{t('Aucune offre n’est encore référencée pour cet établissement.')}</p>
                            )}
                        </div>

                        {formations.length > 0 && (
                            <div id='admission' className='scroll-mt-28'>
                                <h2 className='mb-5 font-bold'>{t('Conditions d’admission')}</h2>
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

                        {school.reviewsEnabled !== false && (
                        <div id='temoignages' className='scroll-mt-28'>
                            <div className='mb-5 flex flex-wrap items-center justify-between gap-3'>
                                <h2 className='font-bold'>{t(reviewsTitle)}</h2>
                                <button
                                    type='button'
                                    onClick={() => setReviewOpen(true)}
                                    className='inline-flex min-h-11 items-center gap-2 rounded-lg border border-primary px-4 py-2 font-semibold text-primary hover:bg-primary hover:text-white hover:cursor-pointer'>
                                    <Icon icon='tabler:message-star' /> {t('Donner mon avis')}
                                </button>
                            </div>
                            <SchoolTestimonials testimonials={testimonials} formations={formations} />
                        </div>
                        )}

                        <div id='faq' className='scroll-mt-28'>
                            <h2 className='mb-5 font-bold'>{t('Questions fréquentes')}</h2>
                            <SchoolFaq items={faq} />
                        </div>
                    </div>

                    {/* Colonne latérale : une seule « fiche pratique » (contact, localisation, informations, signalement). */}
                    <aside className='lg:sticky lg:top-28 lg:self-start'>
                        <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
                            <div className='flex items-center justify-between gap-3 bg-secondary px-5 py-3.5'>
                                <p className='text-xs font-bold uppercase tracking-[0.12em] text-white'>{t('Fiche pratique')}</p>
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass}`}>{t(statusLabel)}</span>
                            </div>

                            <div className='border-b border-gray-100 p-5'>
                                <button
                                    type='button'
                                    onClick={() => setContactOpen(true)}
                                    className='flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 font-bold text-white shadow-md shadow-primary/25 transition-colors duration-300 hover:cursor-pointer hover:bg-primary/90'>
                                    <Icon icon='tabler:message-circle' className='text-lg' /> {t('Contacter l’établissement')}
                                </button>
                            </div>

                            {map && (
                                <div className='border-b border-gray-100 bg-offwhite/60 p-5'>
                                    <p className='mb-3 font-bold text-secondary'>{t('Localisation')}</p>
                                    {school.coordinates && (
                                        <SchoolMap
                                            lat={school.coordinates.lat}
                                            lng={school.coordinates.lng}
                                            name={school.name}
                                            className='overflow-hidden rounded-xl'
                                            mapClassName='h-56 w-full'
                                        />
                                    )}
                                    <div className='mt-3 flex items-start justify-between gap-3 text-sm'>
                                        <span className='min-w-0 text-ink'>{[school.address, school.city].filter(Boolean).join(', ')}</span>
                                        <a
                                            href={map.link}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='inline-flex shrink-0 items-center gap-1 font-semibold text-primary hover:underline'>
                                            {t('Google Maps')} <Icon icon='tabler:external-link' />
                                        </a>
                                    </div>
                                </div>
                            )}

                            <div className='p-5'>
                                <p className='mb-1 font-bold text-secondary'>{t('Informations')}</p>
                                <dl className='text-sm'>
                                    <InfoRow label='Nom'>{school.name}</InfoRow>
                                    <InfoRow label='Type'>
                                        {[school.subCategory, category.label, school.type].filter((v): v is string => Boolean(v)).map((v) => t(v)).join(' · ')}
                                    </InfoRow>
                                    {school.foundedYear && (
                                        <InfoRow label='Création'>
                                            {school.foundedYear} · {t(foundedLabel(school.foundedYear))}
                                        </InfoRow>
                                    )}
                                    <InfoRow label='Adresse'>{school.address}</InfoRow>
                                    {school.phone && (
                                        <InfoRow label='Téléphone'>
                                            <a href={`tel:${school.phone.replace(/\s/g, '')}`} onClick={() => track({ type: 'contact_click', establishment: school.id })} className='hover:text-primary'>{school.phone}</a>
                                        </InfoRow>
                                    )}
                                    {school.email && (
                                        <InfoRow label='E-mail'>
                                            <a href={`mailto:${school.email}`} onClick={() => track({ type: 'contact_click', establishment: school.id })} className='hover:text-primary'>{school.email}</a>
                                        </InfoRow>
                                    )}
                                    {school.website && (
                                        <InfoRow label='Site web'>
                                            <a href={school.website} target='_blank' rel='noopener noreferrer' onClick={() => track({ type: 'website_click', establishment: school.id })} className='text-primary hover:underline'>
                                                {websiteLabel}
                                            </a>
                                        </InfoRow>
                                    )}
                                    {socials.length > 0 && (
                                        <InfoRow label='Réseaux'>
                                            <span className='inline-flex flex-wrap justify-end gap-1.5'>
                                                {socials.map(([network, url]) => (
                                                    <a
                                                        key={network}
                                                        href={url}
                                                        target='_blank'
                                                        rel='noopener noreferrer'
                                                        aria-label={network}
                                                        className='flex h-8 w-8 items-center justify-center rounded-full bg-secondary/10 text-secondary hover:bg-primary hover:text-white'>
                                                        <Icon icon={`tabler:brand-${network}`} className='text-base' />
                                                    </a>
                                                ))}
                                            </span>
                                        </InfoRow>
                                    )}
                                    <InfoRow label='Accréditation'>
                                        {school.accreditationVerified && school.accreditation ? school.accreditation : 'En cours de vérification'}
                                    </InfoRow>
                                    <InfoRow label='Statut'>
                                        {school.verification.status === 'Vérifié' && school.verification.date
                                            ? t('Fiche vérifiée le {date}', { date: t(formatDate(school.verification.date)) })
                                            : school.verification.status === 'En cours'
                                              ? 'Vérification en cours'
                                              : 'Fiche non vérifiée'}
                                    </InfoRow>
                                </dl>
                            </div>

                            <div className='flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-gray-100 px-5 py-3 text-sm'>
                                <button type='button' onClick={() => setReportOpen(true)} className='min-h-10 font-semibold text-primary hover:underline hover:cursor-pointer'>
                                    {t('Signaler une erreur')}
                                </button>
                                <Link href={backofficeUrl(`/revendiquer?fiche=${school.id}`)} className='min-h-10 content-center font-semibold text-secondary hover:text-primary'>
                                    {t('Gérer cette fiche')}
                                </Link>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
            <ContactDialog open={contactOpen} onClose={() => setContactOpen(false)} school={school} />
            {school.reviewsEnabled !== false && <ReviewDialog open={reviewOpen} onClose={() => setReviewOpen(false)} establishmentId={school.id} formations={formations} />}
            <ReportDialog open={reportOpen} onClose={() => setReportOpen(false)} establishmentId={school.id} />
        </section>
    )
}

export default SchoolProfile
