'use client'
import { CAlert } from '@coreui/react'
import { useEstablishment } from '@/context/EstablishmentContext'
import { useAuth } from '@/context/AuthContext'
import PageBanner from '@/components/PageBanner'
import EstablishmentForm from './EstablishmentForm'
import AlreadyManaged from './AlreadyManaged'

/** Nouvelle fiche : créée « en attente de validation », publiée après contrôle par Edumada. */
export default function NewEstablishment() {
    const { select, current } = useEstablishment()
    const { refresh } = useAuth()
    if (current) return <AlreadyManaged name={current.name} />

    return (
        <>
            <PageBanner />
            <CAlert color='info'>
                Votre établissement est peut-être déjà sur Edumada : retrouvez-le sur le site et cliquez sur « Vous représentez cet établissement ? » plutôt que de créer un
                doublon.
            </CAlert>
            <EstablishmentForm
                onSaved={async (saved) => {
                    await refresh()
                    await select(saved.id, '/fiche/')
                }}
            />
        </>
    )
}
