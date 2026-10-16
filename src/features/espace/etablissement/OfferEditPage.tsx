'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { EmptyState } from '@/components/ui/form'
import OfferForm from './OfferForm'
import { EstablishmentSpace, useEstablishment } from './EstablishmentSpace'

function OfferEdit() {
    const { establishment, href, reload } = useEstablishment()
    const router = useRouter()
    const id = useSearchParams().get('id')
    const offer = id ? establishment.offers?.find((o) => o.id === id) : undefined

    if (id && !offer) return <EmptyState icon='tabler:school-off' title='Offre introuvable'>Elle a peut-être été supprimée.</EmptyState>

    return (
        <OfferForm
            key={offer?.updatedAt ?? 'new'}
            establishment={establishment}
            offer={offer}
            onDone={async () => {
                await reload()
                router.push(href('offres'))
            }}
        />
    )
}

export default function OfferEditPage() {
    const id = useSearchParams().get('id')
    return (
        <EstablishmentSpace title={id ? "Modifier l'offre" : 'Nouvelle offre'}>
            <OfferEdit />
        </EstablishmentSpace>
    )
}
