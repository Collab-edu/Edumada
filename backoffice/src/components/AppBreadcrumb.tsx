'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CBreadcrumb, CBreadcrumbItem } from '@coreui/react'
import { findRoute, routes } from '@/routes'

export default function AppBreadcrumb() {
    const route = findRoute(usePathname())
    const parent = route?.parent ? routes.find((r) => r.path === route.parent) : undefined

    return (
        <CBreadcrumb className='my-0'>
            <CBreadcrumbItem>
                <Link href='/dashboard/'>Accueil</Link>
            </CBreadcrumbItem>
            {parent && (
                <CBreadcrumbItem>
                    <Link href={`${parent.path}/`}>{parent.name}</Link>
                </CBreadcrumbItem>
            )}
            {route && <CBreadcrumbItem active>{route.name}</CBreadcrumbItem>}
        </CBreadcrumb>
    )
}
