import Image from 'next/image'
import Link from 'next/link'

const RegisterCta = () => {
    return (
        <section id='register-section'>
            <div className='container mx-auto max-w-7xl px-4'>
                <div className='relative overflow-hidden rounded-2xl bg-secondary'>
                    <Image
                        src='https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1600&q=70'
                        alt=''
                        aria-hidden='true'
                        fill
                        className='object-cover opacity-25 mix-blend-luminosity'
                    />
                    {/* Dégradé pour garder le texte lisible à gauche */}
                    <div
                        aria-hidden='true'
                        className='absolute inset-0 bg-gradient-to-r from-secondary via-secondary/85 to-secondary/40'
                    />
                    <div className='relative flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-10 md:px-16 text-center md:text-left'>
                        <p className='text-white italic font-bold leading-tight'>
                            <span className='text-3xl lg:text-4xl'>Inscrivez-vous !</span>{' '}
                            <span className='block lg:inline text-lg lg:text-xl mt-1 lg:mt-0 lg:ml-2'>
                                pour étudier à la rentrée académique&nbsp;2026.
                            </span>
                        </p>
                        <Link
                            href='/inscription/'
                            className='shrink-0 rounded-full bg-white px-8 py-4 text-sm font-bold uppercase tracking-wide text-secondary shadow-lg transition-all duration-300 hover:bg-primary hover:text-white hover:-translate-y-0.5'>
                            S&apos;inscrire maintenant
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default RegisterCta
