import { cn } from '@/lib/utils'

/** Logo de la société, ou ses initiales s'il n'y en a pas. */
export default function CompanyLogo({ name, logo, className }: { name: string; logo: string | null; className?: string }) {
    const initials = name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join('')
    return (
        <span className={cn('flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-gray-100', className)}>
            {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt={`Logo de ${name}`} className='h-full w-full object-contain p-1' />
            ) : (
                <span className='font-bold text-secondary'>{initials}</span>
            )}
        </span>
    )
}
