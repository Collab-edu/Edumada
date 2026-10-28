'use client'
import { useMemo } from 'react'
import Image from 'next/image'
import Link from '@/i18n/client'
import { Icon } from '@/components/ui/icon'
import { useSiteData } from '@/data/site-data'
import { cn } from '@/lib/utils'

const photo = (id: string, w = 600) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`

/** Icône et photo de chaque domaine (mêmes libellés que le filtre « Domaine d'études »). Photos : Unsplash. */
const DOMAINS: Record<string, { icon: string; image: string }> = {
    Informatique: { icon: 'tabler:device-desktop', image: '1517694712202-14dd9538aa97' },
    'Médecine & Santé': { icon: 'tabler:heart', image: '1505751172876-fa1923c5c528' },
    Droit: { icon: 'tabler:scale', image: '1589829545856-d10d557cf95f' },
    'Gestion & Commerce': { icon: 'tabler:briefcase', image: '1460925895917-afdab827c52f' },
    Ingénierie: { icon: 'tabler:settings', image: '1581091226825-a6a2a5aee158' },
    Agronomie: { icon: 'tabler:plant', image: '1500382017468-9049fed747ef' },
    'Lettres & Langues': { icon: 'tabler:book', image: '1481627834876-b7833e8f5570' },
    'Tourisme & Hôtellerie': { icon: 'tabler:send', image: '1507525428034-b723cf961d3e' },
    'Petite enfance': { icon: 'tabler:baby-carriage', image: '1503454537195-1dcabb73ffb9' },
    'Enseignement général': { icon: 'tabler:school', image: '1588072432836-e10032774350' },
    'Éducation spécialisée': { icon: 'tabler:heart-handshake', image: '1529390079861-591de354faf5' },
}
const DEFAULT_DOMAIN = { icon: 'tabler:book', image: '1497633762265-9d179a990aa6' }

/** Icônes : une seule couleur, celle de la charte. */
const ICON = 'bg-primary text-white'

/** Carte de Madagascar (même tracé que le logo). */
const MADAGASCAR =
    'M98.6 30.0 L100.9 34.9 L106.2 43.3 L108.8 51.7 L110.8 62.9 L114.5 78.3 L110.8 85.3 L106.2 90.9 L102.9 102.1 L100.3 113.3 L96.3 128.7 L91.1 145.5 L87.1 159.5 L81.9 174.9 L76.6 191.7 L70.0 211.3 L63.4 214.8 L54.2 219.7 L43.7 221.1 L35.8 216.9 L30.5 207.1 L25.3 193.1 L23.9 180.5 L20.0 170.7 L22.6 160.9 L29.2 149.7 L34.5 139.9 L33.2 128.7 L29.2 114.7 L29.2 103.5 L34.5 92.3 L41.1 89.5 L55.5 83.9 L63.4 75.5 L72.6 71.3 L79.2 62.9 L81.9 53.1 L87.1 50.3 L92.4 40.5 Z'

const SECTIONS = [
    {
        id: 'apres-bac',
        categoryId: 'superieur',
        search: 'Enseignement supérieur',
        eyebrow: 'Après le bac',
        title: 'Les études supérieures',
        text: 'Universités, instituts et grandes écoles préparent en plusieurs années à un diplôme reconnu, pour viser un métier qualifié ou poursuivre la recherche.',
        points: [
            { icon: 'tabler:school', title: 'Licence, master, doctorat', text: 'Le système LMD : licence en 3 ans, master en 2 ans de plus, puis doctorat.' },
            { icon: 'tabler:clipboard-text', title: 'BTS et diplômes courts', text: 'En 2 ans après le bac, pour entrer vite dans la vie active ou poursuivre en licence.' },
            { icon: 'tabler:clipboard-check', title: 'Admission', text: 'Sur dossier, sur concours ou inscription directe : la série du bac compte souvent.' },
            { icon: 'tabler:bulb', title: 'Des formations variées', text: 'Universités, instituts, écoles spécialisées : un large choix pour votre avenir.' },
        ],
        page: { href: '/universites/', label: 'Voir les universités et écoles' },
    },
    {
        id: 'formation-pro',
        categoryId: 'formation-pro',
        search: 'Formation professionnelle',
        eyebrow: 'Formation professionnelle',
        title: 'Apprendre un métier',
        text: 'Des formations courtes et pratiques, de quelques semaines à 2 ans, avec ou sans bac, pour acquérir un savoir-faire, obtenir un certificat ou changer de métier.',
        points: [
            { icon: 'tabler:tools', title: 'Des compétences concrètes', text: 'Ateliers, stages et cas pratiques : on apprend en faisant.' },
            { icon: 'tabler:door-enter', title: 'Ouvert à tous', text: 'Beaucoup de formations sont accessibles sans le bac, aux jeunes comme aux adultes.' },
        ],
        page: { href: '/formation-professionnelle/', label: 'Voir les centres de formation' },
    },
] as const

type Section = (typeof SECTIONS)[number]

const plural = (n: number) => `${n} formation${n > 1 ? 's' : ''}`

const CARD = 'rounded-2xl border border-gray-200 bg-white shadow-[4px_4px_0_0_rgba(15,76,92,0.12)]'

/** Traits rouges décoratifs (comme sur l'accueil). */
function Sparks({ className }: { className?: string }) {
    return (
        <svg aria-hidden='true' viewBox='0 0 40 40' className={cn('h-10 w-10 text-primary', className)}>
            <g fill='none' stroke='currentColor' strokeWidth='3.5' strokeLinecap='round'>
                <path d='M8 22 L 20 26' />
                <path d='M12 10 L 22 20' />
                <path d='M26 4 L 28 16' />
            </g>
        </svg>
    )
}

function Points({ points, className }: { points: Section['points']; className?: string }) {
    return (
        <ul className={cn('grid gap-4', className)}>
            {points.map((point) => (
                <li key={point.title} className={cn(CARD, 'flex flex-col gap-2 p-5')}>
                    <span className={cn('mb-2 flex h-11 w-11 items-center justify-center rounded-xl', ICON)}>
                        <Icon icon={point.icon} className='text-2xl' />
                    </span>
                    <p className='font-semibold text-secondary'>{point.title}</p>
                    <p className='text-sm text-black'>{point.text}</p>
                </li>
            ))}
        </ul>
    )
}

function DomainCards({ section, domains, loading, compact }: { section: Section; domains: { name: string; count: number }[]; loading: boolean; compact?: boolean }) {
    return (
        <div className='grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4'>
            {loading
                ? Array.from({ length: 4 }).map((_, i) => <div key={i} className='h-56 animate-pulse rounded-2xl border border-gray-200 bg-white' />)
                : domains.map((domain) => {
                      const meta = DOMAINS[domain.name] ?? DEFAULT_DOMAIN
                      return (
                          <Link
                              key={domain.name}
                              href={`/recherche?categorie=${encodeURIComponent(section.search)}&domaine=${encodeURIComponent(domain.name)}`}
                              className={cn(CARD, 'group flex flex-col gap-4 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[6px_6px_0_0_rgba(255,59,82,0.3)]')}>
                              <div className='flex items-start justify-between gap-3'>
                                  <span className={cn('flex h-11 w-11 items-center justify-center rounded-xl', ICON)}>
                                      <Icon icon={meta.icon} className='text-2xl' />
                                  </span>
                                  {/* Flèche discrète, qui passe au rouge au survol de la carte */}
                                  <span className='flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-secondary transition-colors duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-white'>
                                      <Icon icon='tabler:arrow-right' className='text-base transition-transform duration-300 group-hover:translate-x-0.5' />
                                  </span>
                              </div>
                              <div className='flex flex-col gap-0.5'>
                                  <span className='font-semibold leading-snug text-secondary duration-300 group-hover:text-primary'>{domain.name}</span>
                                  <span className='text-sm text-ink/60'>{plural(domain.count)}</span>
                              </div>
                              <div className='mt-auto'>
                                  <div className={cn('relative overflow-hidden rounded-xl', compact ? 'h-24' : 'h-28')}>
                                      <Image
                                          src={photo(meta.image, 500)}
                                          alt=''
                                          fill
                                          sizes='(min-width: 1024px) 25vw, (min-width: 420px) 50vw, 100vw'
                                          className='object-cover'
                                      />
                                  </div>
                              </div>
                          </Link>
                      )
                  })}
            {!loading && domains.length === 0 && <p className='text-ink/60'>Aucune formation pour le moment.</p>}
        </div>
    )
}

function SectionLinks({ section }: { section: Section }) {
    return (
        <div className='mt-8 flex flex-wrap gap-x-8 gap-y-3'>
            <Link href={section.page.href} className='group inline-flex items-center gap-1.5 font-semibold text-primary'>
                <span className='underline decoration-2 underline-offset-4'>{section.page.label}</span>
                <Icon icon='tabler:arrow-right' className='transition-transform duration-300 group-hover:translate-x-1' />
            </Link>
            <Link href={`/recherche?categorie=${encodeURIComponent(section.search)}`} className='group inline-flex items-center gap-1.5 font-semibold text-secondary hover:text-primary'>
                Toutes les formations de cette catégorie
                <Icon icon='tabler:arrow-right' className='transition-transform duration-300 group-hover:translate-x-1' />
            </Link>
        </div>
    )
}

function Eyebrow({ children }: { children: React.ReactNode }) {
    return (
        <span className='flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-primary'>
            <span className='h-0.5 w-6 rounded-full bg-primary' aria-hidden='true' />
            {children}
        </span>
    )
}

/** Page Domaines : les domaines d'études, séparés entre études supérieures et formation professionnelle. */
export default function DomainsPage() {
    const { data: formations, loading } = useSiteData('FormationData')

    // Domaines de chaque catégorie, du plus fourni au moins fourni.
    const domainsByCategory = useMemo(() => {
        const result = new Map<string, { name: string; count: number }[]>()
        for (const section of SECTIONS) {
            const counts = new Map<string, number>()
            for (const f of formations) if (f.category === section.categoryId && f.domain) counts.set(f.domain, (counts.get(f.domain) ?? 0) + 1)
            result.set(
                section.categoryId,
                [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'fr'))
            )
        }
        return result
    }, [formations])

    const [bac, pro] = SECTIONS

    return (
        <main className='overflow-hidden pt-28 pb-20 sm:pt-32'>
            {/* En-tête */}
            <section className='pt-0 pb-10'>
                <div className='container mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-[1.1fr_1fr]'>
                    <div className='flex flex-col gap-5'>
                        <span className='flex items-center gap-3 text-sm font-semibold uppercase tracking-wide text-secondary'>
                            <span className='h-0.5 w-6 rounded-full bg-secondary' aria-hidden='true' />
                            Domaines <span className='-ml-2 text-primary'>d’études</span>
                        </span>
                        <h1 className='text-4xl font-bold leading-tight text-secondary md:text-5xl'>
                            Les domaines d’études <br className='hidden sm:block' />à <span className='text-primary'>Madagascar</span>
                        </h1>
                        <p className='max-w-xl text-black'>
                            Choisissez votre voie : des études supérieures après le bac, ou une formation professionnelle pour apprendre un métier.
                            Dans chaque cas, cliquez sur un domaine pour voir les formations proposées à Madagascar.
                        </p>
                        <nav aria-label='Sections de la page' className='flex flex-wrap gap-3'>
                            {SECTIONS.map((section) => (
                                <a
                                    key={section.id}
                                    href={`#${section.id}`}
                                    className='inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold text-secondary shadow-[4px_4px_0_0_rgba(15,76,92,0.22)] transition-colors hover:border-primary hover:text-primary'>
                                    {section.eyebrow}
                                    <Icon icon='tabler:chevron-down' className='text-lg' />
                                </a>
                            ))}
                        </nav>
                    </div>

                    {/* Photo sur la carte de Madagascar */}
                    <div className='relative mx-auto h-80 w-full max-w-md sm:h-96'>
                        <svg aria-hidden='true' viewBox='15 25 105 202' className='absolute -top-6 -left-2 aspect-[105/202] h-[115%] rotate-[8deg] fill-success/45 sm:-left-6'>
                            <path d={MADAGASCAR} />
                        </svg>
                        <div className='absolute top-16 right-6 bottom-0 left-16 overflow-hidden rounded-[2.5rem] rounded-tr-[6rem] border-4 border-white shadow-[8px_8px_0_0_rgba(255,59,82,0.9)] sm:left-24'>
                            <Image
                                src={photo('1596495578065-6e0763fa1178', 800)}
                                alt='Étudiante souriante qui prend des notes'
                                fill
                                priority
                                sizes='(min-width: 1024px) 400px, 80vw'
                                className='object-cover'
                            />
                        </div>
                        <Sparks className='absolute top-1/2 left-4 sm:left-12' />
                    </div>
                </div>
            </section>

            {/* Après le bac */}
            <section id={bac.id} className='scroll-mt-28 pt-6'>
                <div className='container mx-auto max-w-7xl px-4'>
                    <div className='mb-8 flex max-w-3xl flex-col gap-3'>
                        <Eyebrow>{bac.eyebrow}</Eyebrow>
                        <h2 className='font-bold'>{bac.title}</h2>
                        <p className='text-black'>{bac.text}</p>
                    </div>
                    <Points points={bac.points} className='sm:grid-cols-2 lg:grid-cols-4' />

                    <h3 className='mt-14 mb-6 flex items-center gap-3 text-xl font-semibold text-secondary'>
                        <span className='h-0.5 w-6 rounded-full bg-primary' aria-hidden='true' />
                        Choisissez un domaine
                    </h3>
                    <DomainCards section={bac} domains={domainsByCategory.get(bac.categoryId) ?? []} loading={loading} />
                    <SectionLinks section={bac} />
                </div>
            </section>

            {/* Formation professionnelle */}
            <section id={pro.id} className='scroll-mt-28 bg-white'>
                <div className='container mx-auto max-w-7xl px-4'>
                    <div className='grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr_1.2fr]'>
                        <div className='flex flex-col gap-3'>
                            <Eyebrow>{pro.eyebrow}</Eyebrow>
                            <h2 className='font-bold'>{pro.title}</h2>
                            <p className='text-black'>{pro.text}</p>
                        </div>
                        <div className='relative h-56 overflow-hidden rounded-[2rem] rounded-bl-[5rem] shadow-[8px_8px_0_0_rgba(15,76,92,0.9)] lg:h-64'>
                            <Image src={photo('1504328345606-18bbc8c9d7d1', 700)} alt='Soudeur au travail dans un atelier' fill sizes='(min-width: 1024px) 30vw, 100vw' className='object-cover' />
                        </div>
                        <Points points={pro.points} className='sm:grid-cols-2' />
                    </div>

                    <h3 className='mt-14 mb-6 flex items-center gap-3 text-xl font-semibold text-secondary'>
                        <span className='h-0.5 w-6 rounded-full bg-primary' aria-hidden='true' />
                        Choisissez un domaine
                    </h3>
                    <DomainCards section={pro} domains={domainsByCategory.get(pro.categoryId) ?? []} loading={loading} compact />
                    <SectionLinks section={pro} />
                </div>
            </section>

            {/* Orientation */}
            <section className='pb-0'>
                <div className='container mx-auto max-w-7xl px-4'>
                    <div className='relative overflow-hidden rounded-3xl bg-secondary'>
                        <div className='absolute inset-y-0 right-0 hidden w-1/2 md:block'>
                            <Image src={photo('1497633762265-9d179a990aa6', 900)} alt='' fill sizes='50vw' className='object-cover' />
                            <div className='absolute inset-0 bg-gradient-to-r from-secondary via-secondary/40 to-primary/30' aria-hidden='true' />
                        </div>
                        <div className='relative flex flex-col gap-4 p-8 sm:p-10 md:max-w-[55%]'>
                            <div className='flex items-center gap-3'>
                                <Icon icon='tabler:book-2' className='text-3xl text-white' />
                                <h2 className='text-2xl font-bold text-white md:text-3xl'>Vous hésitez encore ?</h2>
                            </div>
                            <p className='text-white/80'>Notre page Orientation vous guide pas à pas, selon votre profil.</p>
                            <Link
                                href='/orientation/'
                                className='group inline-flex items-center gap-2 self-start rounded-xl bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary/90'>
                                S’orienter
                                <Icon icon='tabler:arrow-right' className='text-lg transition-transform duration-300 group-hover:translate-x-1' />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
