'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Icon } from '@/components/ui/icon'
import { Button, FormAlert, SelectField, TextField } from '@/components/ui/form'
import { ApiError, apiEnabled } from '@/lib/api'
import { useSiteData } from '@/data/site-data'
import { cn } from '@/lib/utils'
import { useAuth } from '../AuthProvider'
import { backofficeUrl, goTo } from '../types'
import type { Plan } from '@/features/espace/types'
import { formatAriary } from '@/features/espace/components/SpaceShell'
import { ESTABLISHMENT_START, usePlans, type BillingCycle } from '@/features/marketing/plans'

const EMPTY = {
    lastName: '',
    firstName: '',
    jobTitle: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    establishmentName: '',
    category: '',
    city: '',
    establishmentEmail: '',
    website: '',
}

const JOB_TITLES = ['Directeur ou directrice', 'Responsable des admissions', 'Responsable communication', 'Secrétaire', 'Autre']

const PERKS = [
    { icon: 'tabler:id-badge-2', text: 'Une fiche gratuite, visible par les futurs étudiants' },
    { icon: 'tabler:books', text: 'Une offre publiée sans frais' },
    { icon: 'tabler:rosette-discount-check', text: 'Une fiche vérifiée par l’équipe Edumada' },
]

const NEXT_STEPS = ['Créez votre compte', 'Complétez la fiche dans votre espace', 'Nous la vérifions, puis elle est en ligne']

/** « institut.mg » → « https://institut.mg » : l'API attend une adresse complète. */
const withScheme = (url: string) => (url && !/^https?:\/\//i.test(url) ? `https://${url}` : url)

function FormSection({ number, title, text, children }: { number: number; title: string; text: string; children: ReactNode }) {
    return (
        <fieldset className='flex flex-col gap-4'>
            <legend className='mb-4 flex items-start gap-3'>
                <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary font-bold text-white'>{number}</span>
                <span className='flex flex-col gap-0.5'>
                    <span className='text-lg font-semibold text-secondary'>{title}</span>
                    <span className='text-sm text-black'>{text}</span>
                </span>
            </legend>
            {children}
        </fieldset>
    )
}

/** Inscription d'un établissement : responsable du compte et informations minimales de l'établissement. */
export default function EstablishmentSignUp() {
    const { register } = useAuth()
    const router = useRouter()
    const { data: categories } = useSiteData('CategoryData')
    const { data: schools } = useSiteData('SchoolData')
    const [form, setForm] = useState(EMPTY)
    const plans = usePlans()
    // Formule choisie sur la page Tarifs (?formule=pro&rythme=yearly) ; Gratuit par défaut.
    const [choice, setChoice] = useState<{ plan: Plan['code']; cycle: BillingCycle }>({ plan: 'free', cycle: 'monthly' })
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const plan = params.get('formule')
        if (plan === 'pro' || plan === 'premium' || plan === 'free') {
            setChoice({ plan, cycle: params.get('rythme') === 'yearly' ? 'yearly' : 'monthly' })
        }
    }, [])
    const chosen = plans.find((plan) => plan.code === choice.plan) ?? plans[0]
    const yearly = choice.cycle === 'yearly' && chosen.yearlyPrice !== null
    const chosenPrice =
        chosen.code === 'free' ? 'sans engagement' : `${formatAriary(yearly ? chosen.yearlyPrice : chosen.monthlyPrice)} / ${yearly ? 'an' : 'mois'}`
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<ApiError | null>(null)

    const cities = useMemo(() => [...new Set(schools.map((school) => school.city).filter(Boolean))].sort(), [schools])
    const set = (key: keyof typeof EMPTY) => (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value })
    const fieldError = (name: string) => error?.field(name)

    const submit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const user = await register({
                accountType: 'establishment',
                name: `${form.firstName} ${form.lastName}`.trim(),
                firstName: form.firstName,
                lastName: form.lastName,
                jobTitle: form.jobTitle,
                email: form.email,
                phone: form.phone,
                password: form.password,
                password_confirmation: form.password_confirmation,
                plan: chosen.code,
                billingCycle: yearly ? 'yearly' : 'monthly',
                establishment: {
                    name: form.establishmentName,
                    category: form.category,
                    city: form.city,
                    email: form.establishmentEmail || null,
                    website: withScheme(form.website.trim()) || null,
                },
            })
            toast.success('Votre compte est créé.')
            const email = `email=${encodeURIComponent(user.email)}`
            if (chosen.code === 'free') {
                toast('Connectez-vous à votre espace pour compléter la fiche de votre établissement.', { icon: '➡️' })
                goTo(backofficeUrl(`/connexion?${email}`), router.push)
            } else {
                // Formule payante : après connexion, l'établissement arrive sur sa demande d'abonnement.
                toast(`Connectez-vous pour finaliser la formule ${chosen.name}.`, { icon: '➡️' })
                const next = `/formule/?plan=${chosen.code}&cycle=${yearly ? 'yearly' : 'monthly'}`
                goTo(backofficeUrl(`/connexion?${email}&next=${encodeURIComponent(next)}`), router.push)
            }
        } catch (err) {
            setError(err as ApiError)
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className='pt-28 pb-20 sm:pt-32'>
            <div className='container mx-auto max-w-7xl px-4'>
                <div className='grid gap-8 lg:grid-cols-[2fr_3fr] lg:items-start'>
                    {/* Présentation */}
                    <aside className='order-2 flex flex-col gap-6 rounded-2xl bg-secondary p-6 text-white sm:p-8 lg:sticky lg:top-28 lg:order-1'>
                        <div className='flex flex-col gap-3'>
                            <p className='font-semibold uppercase tracking-wide text-primary'>Établissements</p>
                            <h1 className='text-3xl font-bold text-white md:text-4xl'>Référencez votre établissement</h1>
                            <p className='text-white/80'>Créez votre compte en quelques minutes. Vous compléterez ensuite la fiche publique depuis votre espace.</p>
                        </div>
                        <ul className='flex flex-col gap-3'>
                            {PERKS.map((perk) => (
                                <li key={perk.text} className='flex items-center gap-3'>
                                    <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-primary'>
                                        <Icon icon={perk.icon} className='text-xl' />
                                    </span>
                                    <span className='font-medium'>{perk.text}</span>
                                </li>
                            ))}
                        </ul>
                        <div className='flex flex-col gap-3 border-t border-white/15 pt-6'>
                            <p className='text-sm font-semibold uppercase tracking-wide text-white/60'>Et ensuite ?</p>
                            <ol className='flex flex-col gap-3'>
                                {NEXT_STEPS.map((step, index) => (
                                    <li key={step} className='flex items-center gap-3 text-white/90'>
                                        <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-secondary'>{index + 1}</span>
                                        {step}
                                    </li>
                                ))}
                            </ol>
                        </div>
                        <Link href='/avantages/' className='inline-flex items-center gap-1 font-semibold text-white underline underline-offset-4 decoration-white/40 hover:text-cream'>
                            Découvrir les avantages
                            <Icon icon='tabler:arrow-right' />
                        </Link>
                    </aside>

                    {/* Formulaire */}
                    <div className='order-1 flex flex-col gap-2 lg:hidden' aria-hidden='true'>
                        <p className='font-semibold uppercase tracking-wide text-primary'>Établissements</p>
                        <p className='text-3xl font-bold text-secondary'>Référencez votre établissement</p>
                        <p className='text-black'>Gratuit, en quelques minutes.</p>
                    </div>
                    <div className='order-1 rounded-2xl border border-gray-200 bg-white p-6 shadow-[4px_4px_0_0_rgba(15,76,92,0.22)] sm:p-8 lg:order-2'>
                        {/* Formule choisie sur la page Tarifs : rappel discret, modifiable */}
                        <div className='mb-6 flex flex-col gap-2 border-b border-gray-100 pb-5'>
                            <div className='flex flex-wrap items-center justify-between gap-3'>
                                <div className='inline-flex items-center gap-2 rounded-full border border-gray-200 bg-offwhite py-1 pl-3 pr-1 text-sm'>
                                    <span className='text-ink/60'>Formule</span>
                                    <span className='inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-0.5 font-semibold text-secondary shadow-sm'>
                                        <span className={cn('h-2 w-2 rounded-full', chosen.code === 'free' ? 'bg-success' : 'bg-primary')} />
                                        {chosen.name}
                                        <span className='font-normal text-ink/60'>· {chosenPrice}</span>
                                    </span>
                                </div>
                                <Link href={ESTABLISHMENT_START} className='inline-flex items-center gap-1 text-sm font-medium text-ink/60 hover:text-primary duration-300'>
                                    <Icon icon='tabler:pencil' className='text-base' />
                                    Modifier
                                </Link>
                            </div>
                            {chosen.code !== 'free' && (
                                <p className='flex items-start gap-1.5 !text-xs text-ink/60'>
                                    <Icon icon='tabler:info-circle' className='mt-px shrink-0 text-sm' />
                                    Paiement après la création du compte, depuis votre espace. La fiche reste en Gratuit jusqu&apos;à sa confirmation.
                                </p>
                            )}
                        </div>

                        {!apiEnabled && <FormAlert tone='info'>L&apos;inscription sera disponible quand le service en ligne d&apos;Edumada sera activé.</FormAlert>}
                        {error && Object.keys(error.errors).length === 0 && <FormAlert>{error.message}</FormAlert>}
                        {error && Object.keys(error.errors).length > 0 && <FormAlert>Certains champs sont à corriger : ils sont signalés en rouge.</FormAlert>}

                        <form onSubmit={submit} className='flex flex-col gap-8' noValidate>
                            <FormSection number={1} title='Responsable du compte' text='La personne qui inscrit l’établissement et qui gérera son compte.'>
                                <div className='grid gap-4 sm:grid-cols-2'>
                                    <TextField label='Nom' autoComplete='family-name' required value={form.lastName} onChange={set('lastName')} error={fieldError('lastName')} />
                                    <TextField label='Prénom' autoComplete='given-name' required value={form.firstName} onChange={set('firstName')} error={fieldError('firstName')} />
                                </div>
                                <SelectField
                                    label='Fonction'
                                    required
                                    placeholder='Choisir…'
                                    options={JOB_TITLES}
                                    value={form.jobTitle}
                                    onChange={set('jobTitle')}
                                    error={fieldError('jobTitle')}
                                />
                                <div className='grid gap-4 sm:grid-cols-2'>
                                    <TextField
                                        label='Adresse e-mail professionnelle'
                                        type='email'
                                        autoComplete='email'
                                        required
                                        hint='Elle servira à vous connecter.'
                                        value={form.email}
                                        onChange={set('email')}
                                        error={fieldError('email')}
                                    />
                                    <TextField label='Téléphone' type='tel' autoComplete='tel' required placeholder='034 00 000 00' value={form.phone} onChange={set('phone')} error={fieldError('phone')} />
                                </div>
                                <div className='grid gap-4 sm:grid-cols-2'>
                                    <TextField
                                        label='Mot de passe'
                                        type='password'
                                        autoComplete='new-password'
                                        required
                                        hint='8 caractères au moins, avec des lettres et des chiffres.'
                                        value={form.password}
                                        onChange={set('password')}
                                        error={fieldError('password')}
                                    />
                                    <TextField
                                        label='Confirmation du mot de passe'
                                        type='password'
                                        autoComplete='new-password'
                                        required
                                        value={form.password_confirmation}
                                        onChange={set('password_confirmation')}
                                    />
                                </div>
                                <p className='flex items-start gap-2 rounded-lg bg-cream/60 p-3 text-sm text-black'>
                                    <Icon icon='tabler:info-circle' className='mt-0.5 shrink-0 text-lg text-primary' />
                                    Le responsable du compte n&apos;est pas forcément le propriétaire ou le directeur de l&apos;établissement.
                                </p>
                            </FormSection>

                            <FormSection number={2} title='Votre établissement' text='Pour identifier l’établissement. Vous compléterez sa fiche publique ensuite.'>
                                <TextField
                                    label='Nom officiel de l’établissement'
                                    required
                                    autoComplete='organization'
                                    value={form.establishmentName}
                                    onChange={set('establishmentName')}
                                    error={fieldError('establishment.name')}
                                />
                                <div className='grid gap-4 sm:grid-cols-2'>
                                    <SelectField
                                        label='Type d’établissement'
                                        required
                                        placeholder='Choisir…'
                                        options={categories.map((category) => ({ value: category.id, label: category.label }))}
                                        value={form.category}
                                        onChange={set('category')}
                                        error={fieldError('establishment.category')}
                                    />
                                    <TextField
                                        label='Ville'
                                        required
                                        list='establishment-cities'
                                        autoComplete='address-level2'
                                        value={form.city}
                                        onChange={set('city')}
                                        error={fieldError('establishment.city')}
                                    />
                                    <datalist id='establishment-cities'>
                                        {cities.map((city) => (
                                            <option key={city} value={city} />
                                        ))}
                                    </datalist>
                                </div>
                                <div className='grid gap-4 sm:grid-cols-2'>
                                    <TextField
                                        label='E-mail de l’établissement'
                                        type='email'
                                        hint='Facultatif, s’il est différent du vôtre.'
                                        value={form.establishmentEmail}
                                        onChange={set('establishmentEmail')}
                                        error={fieldError('establishment.email')}
                                    />
                                    <TextField
                                        label='Site web'
                                        type='url'
                                        inputMode='url'
                                        placeholder='www.mon-etablissement.mg'
                                        hint='Facultatif.'
                                        value={form.website}
                                        onChange={set('website')}
                                        error={fieldError('establishment.website')}
                                    />
                                </div>
                            </FormSection>

                            <div className='flex flex-col gap-4'>
                                <Button type='submit' loading={loading} disabled={!apiEnabled} className='w-full py-3 text-lg'>
                                    Créer mon compte établissement
                                </Button>
                                <p className='text-sm text-black'>
                                    En créant un compte, vous acceptez nos{' '}
                                    <Link href='/conditions/' className='text-primary hover:underline'>conditions d&apos;utilisation</Link> et notre{' '}
                                    <Link href='/confidentialite/' className='text-primary hover:underline'>politique de confidentialité</Link>.
                                </p>
                                <p className='text-black'>
                                    Vous avez déjà un compte ?
                                    <Link href={backofficeUrl('/connexion')} className='pl-2 font-semibold text-primary hover:underline'>
                                        Se connecter
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}
