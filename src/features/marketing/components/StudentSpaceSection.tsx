'use client'
import Image from 'next/image'
import { Icon } from '@/components/ui/icon'
import { ButtonLink } from '@/components/ui/form'
import { useSiteData } from '@/data/site-data'
import { imageOr } from '@/lib/media'
import PhoneMockup, { type PhoneTab } from './PhoneMockup'

const FEATURES = [
    { icon: 'tabler:heart', text: 'Enregistrez vos formations favorites' },
    { icon: 'tabler:file-check', text: 'Suivez vos demandes et candidatures' },
    { icon: 'tabler:message-circle', text: 'Retrouvez les réponses des établissements' },
    { icon: 'tabler:user-cog', text: 'Gérez votre profil en toute simplicité' },
]

const SHORTCUTS = [
    { icon: 'tabler:heart', label: 'Favoris' },
    { icon: 'tabler:file-check', label: 'Démarches' },
    { icon: 'tabler:user', label: 'Profil' },
]

const TABS: PhoneTab[] = [
    { icon: 'tabler:home', label: 'Accueil', active: true },
    { icon: 'tabler:search', label: 'Rechercher' },
    { icon: 'tabler:heart', label: 'Favoris' },
    { icon: 'tabler:user', label: 'Profil' },
]

/** Section « Espace étudiant » : aperçu sur téléphone et ce que l'on peut y faire. */
export default function StudentSpaceSection() {
    const { data: formations } = useSiteData('FormationData')
    const favorites = formations.filter((formation) => formation.kind === 'formation').slice(0, 2)

    return (
        <section>
            <div className='container mx-auto max-w-7xl px-4'>
                <div className='grid items-center gap-10 lg:grid-cols-2 lg:gap-16'>
                    {/* Téléphone */}
                    <PhoneMockup tabs={TABS}>
                        <div>
                            <p className='font-bold text-secondary'>Bonjour Aina <Icon icon='material-symbols:waving-hand-outline' aria-hidden='true' className='inline-block align-[-0.125em] text-amber-400' /></p>
                            <p className='!text-xs text-ink/60'>Quelle formation cherches-tu ?</p>
                        </div>
                        <div className='flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-ink/50'>
                            <Icon icon='tabler:search' className='text-sm' />
                            Rechercher une formation…
                        </div>
                        <div className='grid grid-cols-3 gap-2'>
                            {SHORTCUTS.map((shortcut) => (
                                <div key={shortcut.label} className='flex flex-col items-center gap-1 rounded-lg bg-white py-2 text-[11px] font-medium text-secondary'>
                                    <span className='flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary'>
                                        <Icon icon={shortcut.icon} className='text-sm' />
                                    </span>
                                    {shortcut.label}
                                </div>
                            ))}
                        </div>
                        <div className='flex flex-col gap-2'>
                            <div className='flex items-center justify-between text-xs'>
                                <span className='font-semibold text-secondary'>Mes favoris</span>
                                <span className='font-semibold text-primary'>Voir tout</span>
                            </div>
                            {favorites.map((formation) => (
                                <div key={formation.id} className='flex gap-2 rounded-lg bg-white p-2'>
                                    <div className='relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-cream'>
                                        <Image src={imageOr(formation.imageSrc)} alt='' fill sizes='48px' className='object-cover' />
                                    </div>
                                    <div className='min-w-0'>
                                        <p className='truncate !text-xs font-semibold text-secondary'>{formation.title}</p>
                                        <p className='truncate !text-[11px] text-ink/60'>{formation.school}</p>
                                        <p className='!text-[11px] text-ink/60'>{formation.city}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </PhoneMockup>

                    {/* Avantages */}
                    <div className='flex flex-col gap-6 rounded-2xl border border-primary/15 bg-cream/60 p-6 sm:p-8'>
                        <div className='flex flex-col gap-3'>
                            <span className='flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white'>
                                <Icon icon='tabler:layout-dashboard' className='text-2xl' />
                            </span>
                            <h2 className='font-bold'>Votre espace étudiant</h2>
                            <p className='text-black'>Un compte gratuit pour garder vos formations à portée de main et suivre vos démarches.</p>
                        </div>
                        <ul className='flex flex-col gap-4'>
                            {FEATURES.map((feature) => (
                                <li key={feature.text} className='flex items-center gap-3 font-medium text-secondary'>
                                    <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-primary shadow-sm'>
                                        <Icon icon={feature.icon} className='text-lg' />
                                    </span>
                                    {feature.text}
                                </li>
                            ))}
                        </ul>
                        <ButtonLink href='/inscription/' className='w-full justify-center sm:w-auto sm:self-start'>
                            Créer mon compte gratuit
                        </ButtonLink>
                    </div>
                </div>
            </div>
        </section>
    )
}
