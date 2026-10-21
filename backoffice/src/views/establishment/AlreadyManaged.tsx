'use client'
import Link from 'next/link'
import { CButton } from '@coreui/react'
import { EmptyState, PageCard } from '@/components/ui'

/** Un compte ne gère qu'un seul établissement : pas de deuxième fiche ni de revendication. */
export default function AlreadyManaged({ name }: { name: string }) {
    return (
        <PageCard>
            <EmptyState
                title='Votre compte gère déjà un établissement'
                action={
                    <CButton color='primary' as={Link} href='/dashboard/'>
                        Retour au tableau de bord
                    </CButton>
                }
            >
                Votre compte gère {name}. Un compte ne peut gérer qu&apos;un seul établissement : pour un autre établissement, créez un compte distinct.
            </EmptyState>
        </PageCard>
    )
}
