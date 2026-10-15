'use client'
import { Icon } from '@iconify/react/dist/iconify.js'

const steps = [
    {
        number: '01',
        title: 'Recherchez',
        description:
            "Filtrez les formations selon le domaine, la ville, le niveau d'études et votre budget.",
        icon: 'tabler:search',
    },
    {
        number: '02',
        title: 'Comparez',
        description:
            'Consultez les informations essentielles et comparez les possibilités proposées par les établissements.',
        icon: 'tabler:layout-columns',
    },
    {
        number: '03',
        title: 'Contactez',
        description:
            "Prenez contact avec l'établissement pour obtenir davantage d'informations sur la formation qui vous intéresse.",
        icon: 'tabler:mail',
    },
]

const Steps = () => {
    return (
        <section id='steps-section' className='bg-white py-20'>
            <div className='container mx-auto max-w-7xl px-4'>
                <h2 className='font-bold tracking-tight text-center mb-10'>
                    Trouvez votre formation en trois étapes
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-5'>
                    {steps.map((step) => (
                        <div
                            key={step.number}
                            className='group flex flex-col rounded-2xl bg-white border border-gray-100 p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg'>
                            <div className='flex items-start justify-between mb-5'>
                                <span className='flex h-14 w-14 items-center justify-center rounded-xl bg-secondary/10 text-secondary transition-colors duration-300 group-hover:bg-primary group-hover:text-white'>
                                    <Icon icon={step.icon} className='text-2xl' />
                                </span>
                                <span aria-hidden='true' className='text-5xl font-bold text-secondary/20 select-none transition-colors duration-300 group-hover:text-primary/30'>
                                    {step.number}
                                </span>
                            </div>
                            <h3 className='mb-3 text-xl font-semibold text-secondary transition-colors duration-300 group-hover:text-primary'>{step.title}</h3>
                            <p className='text-ink/70 leading-relaxed'>{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Steps
