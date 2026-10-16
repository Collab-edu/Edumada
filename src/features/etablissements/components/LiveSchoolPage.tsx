'use client'
import { useEffect, useState } from 'react'
import { api, apiEnabled, getToken } from '@/lib/api'
import { track } from '@/lib/track'
import { getSiteData } from '@/data/site-data'
import { PageSkeleton, PageUnavailable } from '@/components/ui/page-state'
import type { CategoryType } from '@/features/categories/types'
import type { FormationType } from '@/features/formations/types'
import { buildSchoolPageProps, type SchoolPageProps } from '../page-props'
import type { SchoolType, TestimonialType } from '../types'
import SchoolProfile from './SchoolProfile'

type SchoolDetail = SchoolType & { categoryDetails: CategoryType; offers: FormationType[]; testimonials: TestimonialType[] }

/**
 * Fiche établissement toujours à jour (voir LiveFormationPage) : données de l'API dès qu'elles arrivent,
 * construction dans le navigateur pour une fiche publiée après le build.
 */
export default function LiveSchoolPage({ id, initial }: { id: string; initial: SchoolPageProps | null }) {
    const [props, setProps] = useState(initial)
    const [state, setState] = useState<'ready' | 'missing' | 'error'>('ready')

    useEffect(() => {
        if (!apiEnabled) {
            if (!initial) setState('missing')
            return
        }
        let active = true
        Promise.all([api<{ data: SchoolDetail }>(`/establishments/${encodeURIComponent(id)}`, { token: getToken() }), getSiteData()])
            .then(([res, data]) => {
                const { categoryDetails, offers, testimonials, ...school } = res.data
                if (!active) return
                setProps(buildSchoolPageProps(school, data, { formations: offers, testimonials, category: categoryDetails }))
                track({ type: 'view', establishment: school.id })
            })
            .catch((error) => {
                if (active && !initial) setState(error?.status === 404 ? 'missing' : 'error')
            })
        return () => {
            active = false
        }
    }, [id, initial])

    if (state === 'missing') {
        return <PageUnavailable title='Établissement introuvable' message="Cette fiche n'existe pas ou n'est plus publiée." />
    }
    if (state === 'error') {
        return <PageUnavailable title='Service momentanément indisponible' message="Impossible de charger cette fiche pour l'instant. Réessayez dans quelques minutes." />
    }
    if (!props) return <PageSkeleton />
    return <SchoolProfile {...props} />
}
