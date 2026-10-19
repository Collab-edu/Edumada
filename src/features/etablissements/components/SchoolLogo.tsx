import Image from 'next/image'
import withBasePath from '@/lib/base-path'
import { cn } from '@/lib/utils'

type SchoolLogoProps = {
    name: string
    /** Par défaut : premières lettres du nom. */
    initials?: string
    logo?: string
    /** Taille, arrondi et contour : le même cadre sert au logo et aux initiales. */
    className?: string
    /** Couleurs des initiales quand l'établissement n'a pas de logo. */
    fallbackClassName?: string
}

/** Logo de l'établissement, ou ses initiales s'il n'en a pas encore. */
export function SchoolLogo({ name, initials, logo, className, fallbackClassName = 'bg-secondary text-white' }: SchoolLogoProps) {
    if (logo) {
        const src = logo.startsWith('/') && !logo.startsWith('//') ? withBasePath(logo) : logo
        return (
            <span className={cn('relative block shrink-0 overflow-hidden bg-white', className)}>
                <Image src={src} alt={`Logo de ${name}`} fill sizes='96px' className='object-contain p-1' />
            </span>
        )
    }

    return (
        <span aria-hidden='true' className={cn('flex shrink-0 items-center justify-center font-bold tracking-wide', fallbackClassName, className)}>
            {initials ?? name.split(/\s+/).map((word) => word[0]).join('').slice(0, 2).toUpperCase()}
        </span>
    )
}

export default SchoolLogo
