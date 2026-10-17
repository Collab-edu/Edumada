import Link from 'next/link'

const SchoolCta = () => {
    return (
        <section id='school-cta-section' className='relative z-10 -mb-28 pb-0'>
            <div className='container mx-auto max-w-7xl px-4'>
                <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-8 rounded-2xl border border-primary/15 bg-cream px-8 shadow-xl shadow-secondary/20 py-12 md:px-14'>
                    <div className='flex flex-col gap-3 max-w-2xl'>
                        <h2 className='font-bold text-secondary'>
                            Vous êtes un établissement de formation ?
                        </h2>
                        <p className='text-ink/80 leading-relaxed'>
                            Présentez vos formations, améliorez votre visibilité et permettez aux futurs
                            étudiants de découvrir votre établissement.
                        </p>
                    </div>
                    <div className='flex flex-col sm:flex-row sm:items-center gap-6 shrink-0'>
                        <Link
                            href='/signup/?type=etablissement'
                            className='rounded-xl bg-primary px-7 py-4 text-center font-bold text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:bg-primary/90 hover:-translate-y-0.5'>
                            Référencer mon établissement
                        </Link>
                        <Link
                            href='/tarifs/'
                            className='text-center font-semibold text-secondary underline underline-offset-4 decoration-secondary/40 transition-colors duration-300 hover:text-primary hover:decoration-primary'>
                            Découvrir les avantages
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default SchoolCta
