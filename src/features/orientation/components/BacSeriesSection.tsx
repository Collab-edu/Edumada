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
        <section>
            <div className='container mx-auto max-w-7xl px-4'>
                <div className='flex max-w-3xl flex-col gap-4'>
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

                <ul className='mt-10 grid gap-5 md:grid-cols-3'>
                    {SERIES.map((serie) => (
                        <li
                            key={serie.code}
                            className='flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-[4px_4px_0_0_rgba(15,76,92,0.22)]'>
                            <div className='flex items-center gap-3'>
                                <span className='flex h-14 min-w-14 items-center justify-center rounded-2xl bg-secondary px-3 text-xl font-bold text-white'>
                                    {serie.code}
                                </span>
                                <div>
                                    <p className='text-sm text-ink/60'>Série {serie.code}</p>
                                    <h3 className='text-lg font-semibold leading-snug text-secondary'>{serie.name}</h3>
                                </div>
                                <Icon icon={serie.icon} className='ml-auto shrink-0 text-2xl text-primary' />
                            </div>
                            <p className='text-black'>{serie.text}</p>

                            <div className='flex flex-col gap-2'>
                                <p className='text-sm font-semibold text-secondary'>Matières dominantes</p>
                                <ul className='flex flex-wrap gap-2'>
                                    {serie.subjects.map((subject) => (
                                        <li key={subject} className='rounded-lg bg-offwhite px-2.5 py-1 text-sm text-secondary'>
                                            {subject}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className='flex flex-col gap-2'>
                                <p className='text-sm font-semibold text-secondary'>Options pour la session 2027</p>
                                {serie.options.length > 0 ? (
                                    <ul className='flex flex-wrap gap-2'>
                                        {serie.options.map((option) => (
                                            <li key={option} className='rounded-lg border border-dashed border-primary/50 bg-cream px-2.5 py-1 text-sm font-semibold text-primary'>
                                                {option}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className='text-sm text-black'>Pas de sous-option : une seule série.</p>
                                )}
                            </div>

                            <div className='mt-auto flex flex-col gap-1 border-t border-gray-200 pt-4'>
                                <p className='text-sm font-semibold text-secondary'>Après le bac</p>
                                <p className='text-sm text-black'>{serie.careers}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}
