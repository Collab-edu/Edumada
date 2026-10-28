import { Icon } from '@/components/ui/icon'

/**
 * Réforme du baccalauréat général malgache (décret adopté en Conseil des ministres le 31 août 2026,
 * assoupli début octobre 2026) : trois séries à partir de la session 2027.
 */
const SERIES = [
    {
        code: 'L',
        name: 'Littéraire',
        icon: 'tabler:book',
        text: 'Lettres, langues et sciences humaines : pour ceux qui aiment lire, écrire, débattre et comprendre la société.',
        subjects: ['Malagasy', 'Français', 'Anglais', 'Philosophie', 'Histoire-géographie'],
        options: ['L', 'A1', 'A2'],
        careers: 'Droit, lettres et langues, communication, journalisme, enseignement, tourisme.',
    },
    {
        code: 'S',
        name: 'Scientifique',
        icon: 'tabler:atom',
        text: 'Mathématiques, physique-chimie et sciences de la vie et de la terre (SVT) : pour les esprits logiques et curieux.',
        subjects: ['Mathématiques', 'Physique-chimie', 'SVT'],
        options: ['S', 'C', 'D'],
        careers: 'Médecine, ingénierie, informatique, agronomie, sciences, architecture.',
    },
    {
        code: 'OSE',
        name: 'Organisation, Société et Économie',
        icon: 'tabler:chart-line',
        text: 'Nouvelle filière tournée vers l’économie, la gestion et l’insertion professionnelle.',
        subjects: ['Économie', 'Gestion', 'Organisation des entreprises', 'Société'],
        options: [],
        careers: 'Gestion, commerce, comptabilité, banque, administration, création d’entreprise.',
    },
]

/** Section de la page Orientation : les séries du bac général à partir de 2027. */
export default function BacSeriesSection() {
    return (
        <section className='py-12 lg:py-16'>
            <div className='container mx-auto max-w-site px-4 sm:px-6 lg:px-8'>
                <div className='mobile-center flex max-w-3xl flex-col gap-4'>
                    <span className='font-semibold uppercase tracking-wide text-primary'>Réforme du baccalauréat</span>
                    <h2 className='text-3xl font-bold leading-tight md:text-4xl'>
                        Les nouvelles séries du bac <span className='text-primary'>à partir de 2027</span>
                    </h2>
                    <p className='text-black'>
                        Le nouveau programme scolaire, testé depuis 2020, devient la règle : à partir de la session 2027, le bac général
                        compte trois séries, L, S et OSE, qui remplacent les séries A, C et D. Les épreuves d’une même série ont une
                        partie commune, avec des parties propres à chaque option.
                    </p>
                </div>

                {/* Cartes des séries (maquette « Séries Bac v3 ») */}
                <ul className='mt-12 grid gap-6 md:grid-cols-3'>
                    {SERIES.map((serie) => (
                        <li
                            key={serie.code}
                            className='relative flex flex-col gap-[22px] overflow-hidden rounded-[22px] border border-gray-200 bg-white p-7 shadow-[0_10px_30px_-24px_rgba(15,76,92,0.4)] transition duration-200 hover:-translate-y-[3px] hover:border-secondary/20 hover:shadow-[0_20px_40px_-24px_rgba(15,76,92,0.45)]'>
                            {/* Code de la série en filigrane */}
                            <span
                                aria-hidden='true'
                                className='pointer-events-none absolute -top-7 -right-2.5 text-[140px] leading-none font-extrabold tracking-[-6px] text-secondary/5'>
                                {serie.code}
                            </span>

                            <div className='relative flex items-center gap-3.5'>
                                <span className='grid h-[52px] w-[52px] shrink-0 place-items-center rounded-[15px] bg-secondary text-white shadow-[0_8px_16px_-8px_rgba(15,76,92,0.6)]'>
                                    <Icon icon={serie.icon} className='text-2xl' />
                                </span>
                                <div className='flex min-w-0 flex-col gap-[3px]'>
                                    <span className='text-[13px] font-semibold text-primary'>Série {serie.code}</span>
                                    <h3 className='text-[21px] leading-tight font-bold tracking-[-0.3px] text-balance text-secondary'>{serie.name}</h3>
                                </div>
                            </div>

                            <p className='relative text-[15px] leading-relaxed text-pretty text-ink'>{serie.text}</p>

                            <div className='flex flex-col gap-2.5'>
                                <span className='text-[13px] font-semibold text-secondary'>Matières dominantes</span>
                                <ul className='flex flex-wrap gap-2'>
                                    {serie.subjects.map((subject) => (
                                        <li
                                            key={subject}
                                            className='rounded-full border border-secondary/10 bg-secondary/5 px-3 py-1.5 text-[13.5px] font-medium whitespace-nowrap text-secondary'>
                                            {subject}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className='flex flex-col gap-2.5'>
                                <span className='text-[13px] font-semibold text-secondary'>Options pour la session 2027</span>
                                {serie.options.length > 0 ? (
                                    <ul className='flex gap-2'>
                                        {serie.options.map((option) => (
                                            <li
                                                key={option}
                                                className='grid h-[34px] min-w-[42px] place-items-center rounded-[10px] border border-primary/25 bg-cream/60 px-3 text-sm font-bold whitespace-nowrap text-primary'>
                                                {option}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <span className='flex min-h-[34px] items-center gap-2 text-sm text-ink'>
                                        <span className='h-1.5 w-1.5 shrink-0 rounded-full bg-primary' aria-hidden='true' />
                                        Pas de sous-option : une seule série.
                                    </span>
                                )}
                            </div>

                            <div className='-mx-3 mt-auto -mb-3 flex items-start gap-3 rounded-[14px] bg-offwhite px-[18px] py-4'>
                                <Icon icon='tabler:arrow-right' className='mt-px shrink-0 text-xl text-primary' />
                                <div className='flex flex-col gap-1'>
                                    <span className='text-[13px] font-semibold text-secondary'>Après le bac</span>
                                    <span className='text-sm leading-normal text-pretty text-ink'>{serie.careers}</span>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}
