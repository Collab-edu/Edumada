'use client'
import { Icon as IconifyIcon, type IconProps } from '@iconify/react'
import '@/lib/icons'

/**
 * Icône du site. Les dessins sont embarqués (src/lib/icons.ts) et rendus dès le HTML de la page
 * (`ssr`) : aucune attente du chargement de React ni du service en ligne Iconify.
 */
export function Icon(props: IconProps) {
    return <IconifyIcon ssr {...props} />
}

export default Icon
