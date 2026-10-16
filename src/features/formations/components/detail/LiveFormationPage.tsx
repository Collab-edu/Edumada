'use client'
import { useEffect, useState } from 'react'
import { apiEnabled, getToken } from '@/lib/api'
import { track } from '@/lib/track'
import { fetchOfferPage } from '@/data/catalog'
import { getSiteData } from '@/data/site-data'
import { PageSkeleton, PageUnavailable } from '@/components/ui/page-state'
import { buildFormationPageProps, type FormationPageProps } from '../../page-props'
import FormationDetailPage from './FormationDetailPage'

/**
 * Fiche offre toujours à jour : la page statique s'affiche tout de suite, puis les données
 * de l'API la remplacent (frais, dates, statut des inscriptions modifiés depuis le build).
 * Sans page statique (offre créée après le build), la fiche est construite dans le navigateur.
 */
export default function LiveFormationPage({ id, initial }: { id: string; initial: FormationPageProps | null }) {
    const [props, setProps] = useState(initial)
    const [state, setState] = useState<'ready' | 'missing' | 'error'>('ready')

    useEffect(() => {
        if (!apiEnabled) {
            if (!initial) setState('missing')
            return
        }
        let active = true
        Promise.all([fetchOfferPage(id, getToken()), getSiteData()])
            .then(([page, data]) => {
                const { details, establishment, ...formation } = page
                const next = buildFormationPageProps(formation, details, data, establishment)
                if (!active) return
                if (next) setProps(next)
                track({ type: 'view', establishment: establishment.id, offer: formation.id })
            })
            .catch((error) => {
                if (active && !initial) setState(error?.status === 404 ? 'missing' : 'error')
            })
        return () => {
            active = false
        }
    }, [id, initial])

    if (state === 'missing') {
        return <PageUnavailable title='Offre introuvable' message="Cette offre n'existe pas ou n'est plus publiée." />
    }
    if (state === 'error') {
        return <PageUnavailable title='Service momentanément indisponible' message="Impossible de charger cette offre pour l'instant. Réessayez dans quelques minutes." />
    }
    if (!props) return <PageSkeleton />
    return <FormationDetailPage {...props} />
}
