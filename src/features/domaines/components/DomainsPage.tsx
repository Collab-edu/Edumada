'use client'
import { useMemo } from 'react'
import Link from '@/i18n/client'
import { Icon } from '@/components/ui/icon'
import { useSiteData } from '@/data/site-data'

/** Icône de chaque domaine (mêmes libellés que le filtre « Domaine d'études »). */
const DOMAIN_ICONS: Record<string, string> = {
    Informatique: 'tabler:code',
    'Médecine & Santé': 'tabler:heart',
    Droit: 'tabler:scale',
    'Gestion & Commerce': 'tabler:briefcase',
    Ingénierie: 'tabler:settings',
    Agronomie: 'tabler:plant',
    'Lettres & Langues': 'tabler:microphone',
    'Tourisme & Hôtellerie': 'tabler:send',
    'Petite enfance': 'tabler:baby-carriage',
    'Enseignement général': 'tabler:school',
    'Éducation spécialisée': 'tabler:heart-handshake',
}

const SECTIONS = [
    {
        id: 'apres-bac',
        categoryId: 'superieur',
        search: 'Enseignement supérieur',
        eyebrow: 'Après le bac',
        title: 'Les études supérieures',
        text: 'Universités, instituts et grandes écoles préparent en plusieurs années à un diplôme reconnu, pour viser un métier qualifié ou poursuivre la recherche.',
        points: [
            { icon: 'tabler:certificate', title: 'Licence, master, doctorat', text: 'Le système LMD : licence en 3 ans, master en 2 ans de plus, puis doctorat.' },
            { icon: 'tabler:school', title: 'BTS et diplômes courts', text: 'En 2 ans après le bac, pour entrer vite dans la vie active ou poursuivre en licence.' },
            { icon: 'tabler:clipboard-check', title: 'Admission', text: 'Sur dossier, sur concours ou inscription directe : la série du bac compte souvent.' },
        ],
        page: { href: '/universites/', label: 'Voir les universités et écoles' },
    },
    {
        id: 'formation-pro',
        categoryId: 'formation-pro',
        search: 'Formation professionnelle',
        eyebrow: 'Formation professionnelle',
        title: 'Apprendre un métier',
        text: 'Des formations courtes et pratiques, avec ou sans bac, pour acquérir un savoir-faire, obtenir un certificat ou changer de métier.',
        points: [
            { icon: 'tabler:clock', title: 'De quelques semaines à 2 ans', text: 'Des rythmes adaptés, en journée, en soirée ou à distance selon les centres.' },
            { icon: 'tabler:tools', title: 'Des compétences concrètes', text: 'Ateliers, stages et cas pratiques : on apprend en faisant.' },
            { icon: 'tabler:door-enter', title: 'Ouvert à tous', text: 'Beaucoup de formations sont accessibles sans le bac, aux jeunes comme aux adultes.' },
        ],
        page: { href: '/formation-professionnelle/', label: 'Voir les centres de formation' },
    },
] as const

const plural = (n: number) => `${n} formation${n > 1 ? 's' : ''}`

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

    return (
        <>
            {/* Sommaire : accès direct aux deux sections */}
            <div className='container mx-auto max-w-7xl px-4'>
                <nav aria-label='Sections de la page' className='mt-6 flex flex-wrap gap-3'>
                    {SECTIONS.map((section) => (
                        <a
                            key={section.id}
                            href={`#${section.id}`}
                            className='inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-secondary shadow-[3px_3px_0_0_rgba(15,76,92,0.22)] transition-colors hover:border-primary hover:text-primary'>
                            {section.eyebrow}
                            <Icon icon='tabler:arrow-down' className='text-base' />
                        </a>
                    ))}
                </nav>
            </div>

            {SECTIONS.map((section, index) => {
                const domains = domainsByCategory.get(section.categoryId) ?? []
                return (
                    <section key={section.id} id={section.id} className={`scroll-mt-28 ${index % 2 ? 'bg-white' : ''}`}>
                        <div className='container mx-auto max-w-7xl px-4'>
                            <div className='grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-end lg:gap-16'>
                                <div className='flex flex-col gap-4'>
                                    <span className='font-semibold uppercase tracking-wide text-primary'>{section.eyebrow}</span>
                                    <h2 className='font-bold'>{section.title}</h2>
                                    <p className='text-black'>{section.text}</p>
                                </div>
                                <ul className='grid gap-4 sm:grid-cols-3'>
                                    {section.points.map((point) => (
                                        <li key={point.title} className='flex flex-col gap-2 rounded-xl bg-cream/60 p-4'>
                                            <Icon icon={point.icon} className='text-2xl text-primary' />
                                            <p className='text-sm font-semibold text-secondary'>{point.title}</p>
                                            <p className='text-sm text-black'>{point.text}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <h3 className='mt-12 mb-5 text-lg font-semibold text-secondary'>Choisissez un domaine</h3>
                            <div className='grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                                {loading
                                    ? Array.from({ length: 4 }).map((_, i) => <div key={i} className='h-32 animate-pulse rounded-xl border border-gray-200 bg-white' />)
                                    : domains.map((domain) => (
                                          <Link
                                              key={domain.name}
                                              href={`/recherche?categorie=${encodeURIComponent(section.search)}&domaine=${encodeURIComponent(domain.name)}`}
                                              className='group flex flex-col justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-[4px_4px_0_0_rgba(255,59,82,0.22)] transition-all duration-300 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[6px_6px_0_0_rgba(255,59,82,0.35)]'>
                                              <span className='flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                                                  <Icon icon={DOMAIN_ICONS[domain.name] ?? 'tabler:book'} className='text-xl' />
                                              </span>
                                              <div className='flex items-end justify-between gap-2'>
                                                  <div className='flex flex-col gap-1'>
                                                      <span className='text-[15px] font-semibold leading-snug text-secondary duration-300 group-hover:text-primary'>{domain.name}</span>
                                                      <span className='text-sm text-ink/60'>{plural(domain.count)}</span>
                                                  </div>
                                                  <Icon icon='tabler:arrow-right' className='shrink-0 text-lg text-primary transition-transform duration-300 group-hover:translate-x-1' />
                                              </div>
                                          </Link>
                                      ))}
                                {!loading && domains.length === 0 && <p className='text-ink/60'>Aucune formation pour le moment.</p>}
                            </div>

                            <div className='mt-8 flex flex-wrap gap-x-8 gap-y-3'>
                                <Link
                                    href={section.page.href}
                                    className='font-semibold text-primary underline decoration-2 underline-offset-4 hover:text-primary/80'>
                                    {section.page.label}
                                </Link>
                                <Link
                                    href={`/recherche?categorie=${encodeURIComponent(section.search)}`}
                                    className='font-semibold text-secondary underline decoration-secondary/40 underline-offset-4 hover:text-primary hover:decoration-primary'>
                                    Toutes les formations de cette catégorie
                                </Link>
                            </div>
                        </div>
                    </section>
                )
            })}

            {/* Orientation */}
            <section className='pb-0'>
                <div className='container mx-auto max-w-7xl px-4'>
                    <div className='flex flex-col gap-4 rounded-2xl bg-secondary p-8 text-white md:flex-row md:items-center md:justify-between'>
                        <div>
                            <h2 className='text-2xl font-bold text-white'>Vous hésitez encore ?</h2>
                            <p className='text-white/80'>Notre page Orientation vous guide pas à pas, selon votre profil.</p>
                        </div>
                        <Link
                            href='/orientation/'
                            className='inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-semibold text-white transition-colors hover:bg-primary/90'>
                            <Icon icon='tabler:compass' className='text-lg' />
                            S’orienter
                        </Link>
                    </div>
                </div>
            </section>
        </>
    )
}
