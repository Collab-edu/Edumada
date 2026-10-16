'use client'
import { useRouter } from 'next/navigation'
import { FormAlert } from '@/components/ui/form'
import { useAuth } from '@/features/auth/AuthProvider'
import { SpaceShell } from '../components/SpaceShell'
import EstablishmentForm from './EstablishmentForm'

/** Création d'une fiche par un compte établissement : elle est publiée après validation par Edumada. */
export default function NewEstablishmentPage() {
    const router = useRouter()
    const { refresh } = useAuth()

    return (
        <SpaceShell
            roles={['establishment', 'admin']}
            title='Créer la fiche de mon établissement'
            subtitle="Gratuit. Votre fiche sera publiée après vérification de votre lien avec l'établissement."
            nav={[{ href: '/espace/etablissement/', label: 'Mon espace', icon: 'tabler:arrow-left' }]}>
            <FormAlert tone='info'>Votre établissement est peut-être déjà sur Edumada : cherchez-le et cliquez sur « Vous représentez cet établissement ? » plutôt que d&apos;en créer un doublon.</FormAlert>
            <EstablishmentForm
                onSaved={async (saved) => {
                    await refresh()
                    router.push(`/espace/etablissement/?e=${saved.id}`)
                }}
            />
        </SpaceShell>
    )
}
