'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@/components/ui/icon'
import { useSiteData } from '@/data/site-data'

const PHOTO = 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=900&q=70'

const BENEFITS = ['Fiche établissement gratuite', 'Jusqu’à 3 offres publiées sans frais', 'Formules Pro et Premium pour plus de visibilité']

const SchoolCta = () => {
    const { data: schools } = useSiteData('SchoolData')

    return (
        <section id='school-cta-section' className='relative z-10 -mb-28 pb-0'>
            <div className='container mx-auto max-w-7xl px-4'>
                <div className='relative grid overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl shadow-secondary/20 lg:grid-cols-[3fr_2fr]'>
                    {/* Décor */}
                    <div className='pointer-events-none absolute -left-14 -top-14 h-32 w-32 rounded-full bg-cream' aria-hidden='true' />
                    <div
                        className='pointer-events-none absolute bottom-6 left-1/2 hidden h-16 w-24 opacity-40 lg:block'
                        style={{ backgroundImage: 'radial-gradient(var(--color-secondary) 1.5px, transparent 1.5px)', backgroundSize: '12px 12px' }}
                        aria-hidden='true'
                    />

                    <div className='relative flex flex-col justify-center gap-6 px-6 py-10 sm:px-10 md:px-14'>
                        <span className='inline-flex items-center gap-2 self-start rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary'>
                            <Icon icon='tabler:building' className='text-base' />
                            Espace établissements
                        </span>
                        <div className='flex flex-col gap-3 max-w-2xl'>
                            <h2 className='font-bold text-secondary'>
                                Vous êtes un établissement de formation ?
                            </h2>
                            <p className='text-ink/80 leading-relaxed'>
                                Présentez vos formations, améliorez votre visibilité et permettez aux futurs
                                étudiants de découvrir votre établissement.
                            </p>
                        </div>
                        <ul className='flex flex-col gap-2'>
                            {BENEFITS.map((benefit) => (
                                <li key={benefit} className='flex items-center gap-2 font-medium text-secondary'>
                                    <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success/40 text-secondary'>
                                        <Icon icon='tabler:check' className='text-sm' />
                                    </span>
                                    {benefit}
                                </li>
                            ))}
                        </ul>
                        <div className='flex flex-col sm:flex-row sm:items-center gap-6'>
                            <Link
                                href='/signup/?type=etablissement'
                                className='inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-7 py-4 font-bold text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:bg-primary/90 hover:-translate-y-0.5'>
                                Référencer mon établissement
                                <Icon icon='tabler:arrow-right' className='text-lg' />
                            </Link>
                            <Link
                                href='/tarifs/'
                                className='text-center font-semibold text-secondary underline underline-offset-4 decoration-secondary/40 transition-colors duration-300 hover:text-primary hover:decoration-primary'>
                                Découvrir les avantages
                            </Link>
                        </div>
                    </div>

                    <div className='relative hidden min-h-72 lg:block'>
                        <div className='absolute inset-0 [clip-path:polygon(12%_0,100%_0,100%_100%,0_100%)]'>
                            <Image src={PHOTO} alt='Bâtiment d’un établissement d’enseignement' fill sizes='40vw' className='object-cover' />
                            <div className='absolute inset-0 bg-secondary/10' />
                        </div>
                        {schools.length > 0 && (
                            <div className='absolute bottom-6 left-0 flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-lg'>
                                <span className='flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-white'>
                                    <Icon icon='tabler:building-community' className='text-xl' />
                                </span>
                                <div className='leading-tight'>
                                    <p className='!text-lg font-bold text-secondary'>{schools.length}</p>
                                    <p className='!text-xs text-ink/70'>établissements référencés</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SchoolCta
