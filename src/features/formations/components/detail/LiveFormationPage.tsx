'use client'
import { useEffect, useState } from 'react'
import { apiEnabled, getToken } from '@/lib/api'
import { getBasePath } from '@/lib/base-path'
import { track } from '@/lib/track'
import { fetchOfferPage, fetchOfferPageByUrl } from '@/data/catalog'
import { getSiteData } from '@/data/site-data'
import { PageSkeleton, PageUnavailable } from '@/components/ui/page-state'
import { offerHref } from '../../href'
import { buildFormationPageProps, type FormationPageProps } from '../../page-props'
import FormationDetailPage from './FormationDetailPage'

/**
 * Fiche offre toujours à jour : la page statique s'affiche tout de suite, puis les données
 * de l'API la remplacent (frais, dates, statut des inscriptions modifiés depuis le build).
 * Sans page statique (offre créée après le build), la fiche est construite dans le navigateur.
 */
export default function LiveFormationPage({ id, school, initial }: { id: string; school?: string; initial: FormationPageProps | null }) {
    const [props, setProps] = useState(initial)
    const [state, setState] = useState<'ready' | 'missing' | 'error'>('ready')

    useEffect(() => {
        if (!apiEnabled) {
            if (!initial) setState('missing')
            return
        }
        let active = true
        Promise.all([(school ? fetchOfferPageByUrl(school, id, getToken()) : fetchOfferPage(id, getToken())), getSiteData()])
            .then(([page, data]) => {
                const { details, establishment, ...formation } = page
                const next = buildFormationPageProps(formation, details, data, establishment)
                if (!active) return
                // Ancien lien (/formations/…) : on renvoie vers l'adresse actuelle de l'offre.
                if (!initial && !school) {
                    window.location.replace(`${getBasePath()}${offerHref(formation)}`)
                    return
                }
                if (next) setProps(next)
                track({ type: 'view', establishment: establishment.id, offer: formation.id })
            })
            .catch((error) => {
                if (active && !initial) setState(error?.status === 404 ? 'missing' : 'error')
            })
        return () => {
            active = false
        }
    }, [id, school, initial])

    if (state === 'missing') {
        return <PageUnavailable title='Offre introuvable' message="Cette offre n'existe pas ou n'est plus publiée." />
    }
    if (state === 'error') {
        return <PageUnavailable title='Service momentanément indisponible' message="Impossible de charger cette offre pour l'instant. Réessayez dans quelques minutes." />
    }
    if (!props) return <PageSkeleton />
    return <FormationDetailPage {...props} />
}
